//Other metas plugin by Spandan
'use strict';

exports.commands = {
	mixandmega: 'mnm',
	mnm: function(target, room, user) {
		if (!this.runBroadcast()) return;
		if (!target || toId(target) === "" || !target.includes('@')) return this.parse('/help mixandmega');
		let sep = target.split('@');
		let stone = toId(sep[1]), template = toId(sep[0]);
		if ((!Tools.data.Items[stone] || !Tools.data.Items[stone].megaEvolves) && !Tools.data.Items[stone].onPrimal) {
			return this.errorReply('Error: Mega Stone not found');
		}
		if (!Tools.data.Pokedex[toId(template)]) {
			return this.errorReply("Error: Pokemon not found");
		}
		template = Object.assign({}, Tools.getTemplate(template));
		stone = Object.assign({}, Tools.getItem(stone));
		if (template.isMega || (template.evos && Object.keys(template.evos).length > 0)) {
			return this.errorReply(`You cannot mega evolve ${template.name} in Mix and Mega.`);
		}
		let deltas; //This hack is, yes, terribluh.
		let baseTemplate = Tools.getTemplate(stone.megaEvolves), megaTemplate = Tools.getTemplate(stone.megaStone);
		if (stone.id === 'redorb') {
			megaTemplate = Tools.getTemplate("Groudon-Primal");
			baseTemplate = Tools.getTemplate("Groudon");
		} else if (stone.id === 'blueorb') {
			megaTemplate = Tools.getTemplate("Kyogre-Primal");
			baseTemplate = Tools.getTemplate("Kyogre");
		}
		//Get Mega Deltas.
		deltas = {
			ability: megaTemplate.abilities['0'],
			baseStats: {},
			weightkg: megaTemplate.weightkg - baseTemplate.weightkg,
		};
		for (let statId in megaTemplate.baseStats) {
			deltas.baseStats[statId] = megaTemplate.baseStats[statId] - baseTemplate.baseStats[statId];
		}
		if (megaTemplate.types.length > baseTemplate.types.length) {
			deltas.type = megaTemplate.types[1];
		} else if (megaTemplate.types.length < baseTemplate.types.length) {
			deltas.type = baseTemplate.types[0];
		} else if (megaTemplate.types[1] !== baseTemplate.types[1]) {
			deltas.type = megaTemplate.types[1];
		}
		//////////////////////////////////////////
		let ability = deltas.ability, types = template.types, baseStats = Object.assign({}, template.baseStats);
		if (types[0] === deltas.type) {
			types = [deltas.type];
		} else if (deltas.type) {
			types = [types[0], deltas.type];
		}
		for (let statName in baseStats) { //Add stats
			baseStats[statName] = Tools.clampIntRange(baseStats[statName] + deltas.baseStats[statName], 1, 255);
		}
		let weightkg = Math.max(0.1, template.weightkg + deltas.weightkg);
		let type = '<span class="col typecol">';
		for (let i = 0; i < types.length; i++) {
			type = `${type}<img src="https://play.pokemonshowdown.com/sprites/types/${types[i]}.png" alt="${types[i]}" height="14" width="32">`;
		}
		type = type + "</span>";
		let gnbp = 20;
		if (weightkg >= 200) {
			gnbp = 120;
		} else if (weightkg >= 100) {
			gnbp = 100;
		} else if (weightkg >= 50) {
			gnbp = 80;
		} else if (weightkg >= 25) {
			gnbp = 60;
		} else if (weightkg >= 10) {
			gnbp = 40;
		}
		let bst = baseStats['hp'] + baseStats['atk'] + baseStats['def'] + baseStats['spa'] + baseStats['spd'] + baseStats['spe'];
		let text = `<b>Stats</b>: ${baseStats['hp']}/${baseStats['atk']}/${baseStats['def']}/${baseStats['spa']}/${baseStats['spd']}/${baseStats['spe']}<br /><b>BST</b>:${bst}<br /><b>Type:</b> ${type}<br /><b>Ability</b>: ${ability}<br /><b>Weight</b>: ${weightkg} kg (${gnbp} BP)`;
		return this.sendReplyBox(text);
	},
	mixandmegahelp: ["/mnm <pokemon> @ <mega stone> - Shows the mix and mega evolved Pokemon's type and stats."],
};
