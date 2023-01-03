/**
 * Integration for Smogon tournaments.
 * @author mia-pi-git
 */
import {FS, Utils} from '../../lib';

type Image = [string, number, number];
interface TourEvent {
	title: string;
	url: string;
	desc: string;
	image?: Image;
	id: string;
	shortDesc: string;
}

interface TourTable {
	title: string;
	tours: TourEvent[];
	whitelist?: string[];
	icon?: Image;
	desc: string;
}

export const tours: Record<string, TourTable> = {
	official: {
		title: "Smogon Officials",
		// cap this one's dimensions
		icon: ['https://www.smogon.com/media/zracknel-beta.svg', 178, 200],
		tours: [],
		desc: "Tournaments run by Smogon staff.",
	},
	smogon: {
		title: "Open Sign-Ups",
		tours: [],
		desc: "Tournaments run by Smogon staff and regular users alike.",
	},
	ps: {
		title: "Pokémon Showdown!",
		icon: ['https://play.pokemonshowdown.com/pokemonshowdownbeta.png', 146, 44],
		tours: [],
		desc: "Tournaments run by the rooms of Pokemon Showdown.",
	},
};
try {
	const data = JSON.parse(FS('config/chat-plugins/smogtours.json').readSync());
	// settings should prioritize hardcoded values for these keys
	const PRIO = ['title', 'icon'];
	for (const key in data) {
		const section = (tours[key] ||= data[key]) as any;
		for (const k in data[key]) {
			if (PRIO.includes(k)) {
				if (!section[k]) section[k] = data[key][k];
			} else {
				section[k] = data[key][k];
			}
		}
	}
} catch {}

function saveTours() {
	FS('config/chat-plugins/smogtours.json').writeUpdate(() => JSON.stringify(tours));
}

function getTour(categoryID: ID, id: string) {
	id = toID(id);
	return tours?.[categoryID].tours.find(f => f.id === id) || null;
}

function checkWhitelisted(category: ID, user: User) {
	return category ?
		tours[category].whitelist?.includes(user.id) :
		Object.values(tours).some(f => f.whitelist?.includes(user.id));
}

function checkCanEdit(user: User, context: Chat.PageContext | Chat.CommandContext, category?: ID) {
	category = toID(category);
	if (!checkWhitelisted(category, user)) {
		context.checkCan('globalban');
	}
}

export const commands: Chat.ChatCommands = {
	smogtours: {
		''() {
			return this.parse('/j view-tournaments-all');
		},
		edit: 'add',
		async add(target, room, user, connection, cmd) {
			if (!toID(target).length) {
				return this.parse(`/help smogtours`);
			}
			const targets = target.split('|');
			const isEdit = cmd === 'edit';
			const tourID = isEdit ? toID(targets.shift()) : null;
			// {title}|{category}|{url}|{img}|{shortDesc}|{desc}
			const [
				title, rawSection, url, rawImg, rawShort, rawDesc,
			] = Utils.splitFirst(targets.join('|'), '|', 5).map(f => f.trim());
			const sectionID = toID(rawSection);
			if (!toID(title)) {
				return this.popupReply(`Invalid title. Must have at least one alphanumeric character.`);
			}
			const section = tours[sectionID];
			if (!section) {
				return this.errorReply(`Invalid section ID: "${sectionID}"`);
			}
			checkCanEdit(user, this, sectionID);
			if (!Chat.isLink(url)) {
				return this.popupReply(`Invalid info URL: "${url}"`);
			}
			let image;
			if (rawImg) {
				if (!Chat.isLink(rawImg)) {
					return this.popupReply(`Invalid image URL: ${rawImg}`);
				}
				try {
					const dimensions = await Chat.fitImage(rawImg, 300, 300);
					image = [rawImg, ...dimensions.slice(0, -1)] as Image;
				} catch (e) {
					return this.popupReply(`Invalid image URL: ${rawImg}`);
				}
			}
			if (!rawShort?.length || !rawDesc?.length) {
				return this.popupReply(`Must provide both a short description and a full description.`);
			}
			const tour: TourEvent = {
				title: Utils.escapeHTML(title),
				url,
				image,
				shortDesc: rawShort,
				desc: rawDesc,
				id: tourID || toID(title),
			};
			if (isEdit) {
				const index = section.tours.findIndex(t => t.id === tour.id);
				if (index < 0) {
					return this.popupReply(`Tour not found. Create one first.`);
				}
				section.tours.splice(index, 1);
			}
			section.tours.push(tour);
			saveTours();
			this.refreshPage(`tournaments-add`);
		},
		end(target, room, user, connection) {
			const [sectionID, tourID] = target.split(',').map(toID).filter(Boolean);
			if (!sectionID || !tourID) {
				return this.parse(`/help smogtours`);
			}
			const section = tours[sectionID];
			if (!section) return this.popupReply(`Invalid section: "${sectionID}"`);
			const idx = section.tours.findIndex(t => t.id === tourID);
			const title = section.tours[idx].title;
			if (idx < 0) {
				return this.popupReply(`Tour with ID "${tourID}" not found.`);
			}
			section.tours.splice(idx, 1);
			for (const page of connection.openPages || []) {
				if (page.startsWith('tournaments-')) this.refreshPage(page);
			}
			this.popupReply(`Tour "${title}" ended.`);
		},
		whitelist(target, room, user) {
			this.checkCan('rangeban');
			const [sectionID, targetID] = target.split(',').map(toID).filter(Boolean);
			if (!sectionID || !targetID) {
				return this.parse(`/help smogtours`);
			}
			const section = tours[sectionID];
			if (!section) {
				return this.errorReply(`Invalid section ID: "${sectionID}". Valid IDs: ${Object.keys(tours).join(', ')}`);
			}
			if (section.whitelist?.includes(targetID)) {
				return this.errorReply(`That user is already whitelisted on that section.`);
			}
			if (!section.whitelist) section.whitelist = [];
			section.whitelist.push(targetID);
			this.privateGlobalModAction(
				`${user.name} whitelisted ${targetID} to manage tours for the ${section.title} section`
			);
			this.globalModlog('TOUR WHITELIST', targetID);
			saveTours();
		},
		unwhitelist(target, room, user) {
			this.checkCan('rangeban');
			const [sectionID, targetID] = target.split(',').map(toID).filter(Boolean);
			if (!sectionID || !targetID) {
				return this.parse(`/help smogtours`);
			}
			const section = tours[sectionID];
			if (!section) {
				return this.errorReply(`Invalid section ID: "${sectionID}". Valid IDs: ${Object.keys(tours).join(', ')}`);
			}
			const idx = section.whitelist?.indexOf(targetID);
			if (!section.whitelist || !idx || idx < 0) {
				return this.errorReply(`${targetID} is not whitelisted in that section.`);
			}
			section.whitelist.splice(idx, 1);
			if (!section.whitelist.length) {
				delete section.whitelist;
			}
			this.privateGlobalModAction(
				`${user.name} removed ${targetID} from the tour management whitelist for the ${section.title} section`
			);
			this.globalModlog('TOUR UNWHITELIST', targetID);
			saveTours();
		},
		view() {
			return this.parse(`/join view-tournaments-all`);
		},
	},
	smogtourshelp: [
		`/smogtours view - View a list of ongoing forum tournaments.`,
		`/smogtours whitelist [section], [user] - Whitelists the given [user] to manage tournaments for the given [section].`,
		`Requires: &`,
		`/smogtours unwhitelist [section], [user] - Removes the given [user] from the [section]'s management whitelist.`,
		`Requires: &`,
	],
};

/** Modifies `inner` in-place to wrap it in the necessary HTML to show a tab on the sidebar. */
function renderTab(inner: string, isTitle?: boolean, isCur?: boolean) {
	isTitle = false;
	let buf = '';
	if (isCur) {
		// the CSS breaks entirely without the folderhacks.
		buf += `<div class="folder cur"><div class="folderhack3"><div class="folderhack1">`;
		buf += `</div><div class="folderhack2"></div>`;
		buf += `<div class="selectFolder">${inner}</div></div></div>`;
	} else {
		if (!isTitle) {
			inner = `<div class="selectFolder">${inner}</div>`;
		}
		buf += `<div class="folder">${inner}</div>`;
	}
	return buf;
}

const refresh = (pageid: string) => (
	`<button class="button" name="send" value="/join ${pageid}" style="float: right">` +
	`<i class="fa fa-refresh"></i> Refresh</button>`
);

export function renderPageChooser(curPage: string, buffer: string, user?: User) {
	let buf = `<div class="folderpane">`;
	buf += `<div class="folderlist">`;
	buf += `<div class="folderlistbefore"></div>`;
	buf += `<div class="foldersep"></div>`;

	const keys = Object.keys(tours);
	buf += keys.map(cat => {
		let innerBuf = '';
		const tourData = tours[cat];
		innerBuf += renderTab(
			`<strong><a target="replace" href="/view-tournaments-section-${cat}">${tourData.title}</a></strong>`,
			true,
			curPage === cat
		);
		if (tourData.tours.length) {
			innerBuf += tourData.tours.map(t => (
				renderTab(
					`<i class="fa fa-trophy"></i><a target="replace" href="/view-tournaments-view-${cat}-${t.id}">${t.title}</a>`,
					false,
					curPage === `${cat}-${t.id}`
				)
			)).join('<div class="foldersep"></div>');
		} else {
			innerBuf += renderTab(`None`, false);
		}
		return innerBuf;
	}).join('<div class="foldersep"></div>');
	if (user && (checkWhitelisted('', user) || user?.can('globalban'))) {
		buf += `<div class="foldersep"></div>`;
		buf += renderTab(
			`<strong>Manage</strong>`, true, curPage === 'manage'
		);
		buf += renderTab(
			`<i class="fa fa-pencil"></i><a target="replace" href="/view-tournaments-start">Start new</a>`,
			false,
			curPage === 'start',
		);
		buf += renderTab(
			`<i class="fa fa-pencil"></i><a target="replace" href="/view-tournaments-edit">Edit existing</a>`,
			false,
			curPage === 'edit',
		);
	}

	buf += `<div class="folderlistafter"></div></div></div><div class="teampane">`;
	buf += `${buffer}</div>`;
	return buf;
}

function error(page: string, message: string, user: User) {
	return renderPageChooser(page, `<div class="message-error">${message}</div>`, user);
}

export const pages: Chat.PageTable = {
	tournaments: {
		all(query, user) {
			let buf = `${refresh(this.pageid)}<br /><h2>Welcome!</h2><hr />`;
			this.title = '[Tournaments] All';
			buf += `<p>Smogon runs official tournaments across their metagames where the strongest and most `;
			buf += `experienced competitors duke it out for prizes and recognition!</p><p>`;
			buf += `You can see a listing of current official tournaments here; `;
			buf += `by clicking any hyperlink, you will be directed to the forum for any given tournament!</p><p>`;
			buf += `Be sure to sign-up if you are eager to participate or `;
			buf += `check it out if you want to spectate the most hyped games out there.</p><p>`;
			buf += `For information on tournament rules and etiquette, check out <a href="https://www.smogon.com/forums/threads/3642760/">this information thread</a>.`;
			buf += `</p>`;
			return renderPageChooser('', buf, user);
		},
		view(query, user) {
			const [categoryID, tourID] = query.map(toID);
			if (!categoryID || !tourID) {
				return error('', 'You must specify a tour category and a tour ID.', user);
			}
			this.title = `[Tournaments] [${categoryID}] `;
			if (!tours[categoryID]) {
				return error('', `Invalid tour section: '${categoryID}'.`, user);
			}
			const tour = getTour(categoryID, tourID);
			if (!tour) {
				return error(categoryID, `Tour '${tourID}' not found.`, user);
			}
			this.title += `${tour.title}`;
			// stuff!
			let buf = `${refresh(this.pageid)}<br />`;
			buf += `<h2><a href="${tour.url}">${tour.title}</a></h2>`;
			if (tour.image) {
				buf += `<img src="${tour.image[0]}" width="${tour.image[1]}" height="${tour.image[2]}" />`;
			}
			buf += `<hr />`;
			buf += Utils.escapeHTML(tour.desc).replace(/\n/ig, '<br />');
			buf += `<br /><br /><a class="button notifying" href="${tour.url}">View information and signups</a>`;
			try {
				checkCanEdit(user, this, categoryID);
				buf += `<br /><br /><details class="readmore"><summary>Manage</summary>`;
				buf += `<button class="button" name="send" value="/smogtours end ${categoryID},${tourID}">End tour</button>`;
				buf += `</details>`;
			} catch {}
			return renderPageChooser(query.join('-'), buf, user);
		},
		section(query, user) {
			const categoryID = toID(query.shift());
			if (!categoryID) {
				return error('', `No section specified.`, user);
			}
			this.title = '[Tournaments] ' + categoryID;
			const category = tours[categoryID];
			if (!category) {
				return error('', Utils.html`Invalid section specified: '${categoryID}'`, user);
			}
			let buf = `${refresh(this.pageid)}<br /><h2>${category.title}</h2>`;
			if (category.icon) {
				buf += `<img src="${category.icon[0]}" width="${category.icon[1]}" height="${category.icon[2]}" /><br />`;
			}
			buf += `${category.desc}<hr />`;
			if (!category.tours.length) {
				buf += `<p>There are currently no tournaments in this section with open signups.</p>`;
				buf += `<p>Check back later for new tours.</p>`;
			} else {
				buf += category.tours.map(tour => {
					let innerBuf = `<div class="infobox">`;
					innerBuf += `<a href="/view-tournaments-view-${categoryID}-${tour.id}">${tour.title}</a><br />`;
					innerBuf += Utils.escapeHTML(tour.shortDesc);
					innerBuf += `</div>`;
					return innerBuf;
				}).join('<br />');
			}
			return renderPageChooser(categoryID, buf, user);
		},
		start(query, user) {
			checkCanEdit(user, this); // broad check first
			let buf = `${refresh(this.pageid)}<br />`;
			this.title = '[Tournaments] Add';
			buf += `<h2>Add new tournament</h2><hr />`;
			buf += `<form data-submitsend="/smogtours add {title}|{category}|{url}|{img}|{shortDesc}|{desc}">`;
			let possibleCategory = Object.keys(tours)[0];
			for (const k in tours) {
				if (tours[k].whitelist?.includes(user.id)) {
					// favor first one where user is whitelisted where applicable
					possibleCategory = k;
					break;
				}
			}
			buf += `Title: <input name="title" /><br />`;
			buf += `Category: <select name="category">`;
			const keys = Utils.sortBy(Object.keys(tours), k => [k === possibleCategory, k]);
			buf += keys.map(k => `<option>${k}</option>`).join('');
			buf += `</select><br />`;
			buf += `Info link: <input name="url" /><br />`;
			buf += `Image link (optional): <input name="img" /><br />`;
			buf += `Short description: <br /><textarea name="shortDesc" rows="6" cols="50"></textarea><br />`;
			buf += `Full description: <br /><textarea name="desc" rows="20" cols="50"></textarea><br />`;
			buf += `<button type="submit" class="button notifying">Create!</button></form>`;
			return renderPageChooser('start', buf, user);
		},
		// edit single
		edit(query, user) {
			this.title = '[Tournaments] Edit ';
			const [sectionID, tourID] = query.map(toID);
			if (!sectionID || !tourID) {
				return Chat.resolvePage(`view-tournaments-manage`, user, this.connection);
			}
			const section = tours[sectionID];
			if (!section) return error('edit', `Invalid section: "${sectionID}"`, user);
			const tour = section.tours.find(t => t.id === tourID);
			if (!tour) return error('edit', `Tour with ID "${tourID}" not found.`, user);
			let buf = `${refresh(this.pageid)}<br /><h2>Edit tournament "${tour.title}"</h2><hr />`;
			buf += `<form data-submitsend="/smogtours edit ${tour.id}|{title}|${section}|{url}|{img}|{shortDesc}|{desc}">`;
			buf += `Title: <input name="title" value="${tour.title}"/><br />`;
			buf += `Info link: <input name="url" value="${tour.url}" /><br />`;
			buf += `Image link (optional): <input name="img" value="${tour.image?.[0] || ""}" /><br />`;
			buf += `Short description: <br />`;
			buf += `<textarea name="shortDesc" rows="6" cols="50">${tour.shortDesc}</textarea><br />`;
			buf += Utils.html`Full description: <br /><textarea name="desc" rows="20" cols="50">${tour.desc}</textarea><br />`;
			buf += `<button type="submit" class="button notifying">Update!</button>`;
			return renderPageChooser('edit', buf, user);
		},
		// panel for all you have perms to edit
		manage(query, user) {
			checkCanEdit(user, this);
			this.title = '[Tournaments] Manage';
			let buf = `${refresh(this.pageid)}<br /><h2>Manage ongoing tournaments</h2><hr />`;
			buf += Object.keys(tours).map(cat => {
				let innerBuf = '';
				try {
					checkCanEdit(user, this, toID(cat));
				} catch {
					return '';
				}
				const section = tours[cat];
				innerBuf += `<strong>${section.title}</strong>:<br />`;
				innerBuf += section.tours.map(
					t => `&bull; <a href="/view-tournaments-edit-${cat}-${t.id}">${t.title}</a>`
				).join('<br />') || "None active.";
				return innerBuf;
			}).filter(Boolean).join('<hr />');
			return renderPageChooser('manage', buf, user);
		},
	},
};

process.nextTick(() => {
	Chat.multiLinePattern.register('/smogtours ');
});
