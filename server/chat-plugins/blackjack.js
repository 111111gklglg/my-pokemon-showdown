/**
 * Blackjack Game
 * Pokemon Showdown - http://pokemonshowdown.com/
 *
 * This allows users to play the classic blackjack card game.
 * Credits: jd, panpawn
 * Card images by Byron Knoll (released into public domain)
 *
 * @license MIT license
 */
'use strict';

const CARD_IMAGE_PATH = 'http://158.69.63.206:8002/cards/';

class Blackjack extends Rooms.RoomGame {
	constructor(room, user, target) {
		super(room);
		this.room = room;

		this.turnTimeoutMinutes = 1;
		this.timerTickSeconds = 5;

		this.blackjackNumber = 0;
		this.createdBy = user.name;
		this.startedBy = '';
		this.allowRenames = true;

		this.playerCap = 16;
		this.minimumPlayers = 2;
		this.playerScrollWheel = 4;

		this.spectators = Object.create(null);
		this.dealer = new BlackjackDealer();

		this.symbols = {
			'♥': 'H',
			'♦': 'D',
			'♣': 'S',
			'♠': 'C',
		};
		this.deck = new BlackjackDeck().shuffle();

		this.id = this.room.id;
		this.title = `Blackjack (${room.title})`;
		this.blackjack = true;
		this.state = 'signups';

		this.lastMessage = '';
		this.uhtmlChange = '';
		this.curUser = '';
		this.infoboxLimited = '';

		this.button = '<button class="button" name="send" value="/joingame" title="Join Blackjack">Join</button> | <button class="button" name="send" value="/leavegame" title="Leave Blackjack">Leave</button>';
		this.spectateButton = '<button class="button" name="send" value="/blackjack spectate" title="Spectate Blackjack">Spectate</button>';
		this.slideButton = '<button class="button" name="send" value="/blackjack slide" title="Slide the game log down in the chat">(<i class="fa fa-arrow-down" aria-hidden="true"></i> slide)</button>';
		this.atLeastOneJoin = false;

		this.makeGame(target);
	}

	/**
	 * Game Setup
	 * makeGame - configures required settings for creating a game
	 * makePlayer - adds blackjack-specific properties to player object
	 * sendInvite - called when a game is created, or when a player joins/leaves
	 */
	makeGame(target) {
		if (target) target = parseFloat(target);
		if (isNaN(target) || target <= 0) target = '';
		if (target !== '') {
			this.autostart = setTimeout(() => this.start(), (target * 60000));
		}
		if (!this.room.blackjack) this.room.blackjack = 1;
		this.blackjackNumber = this.room.blackjack;

		this.sendInvite();
		this.room.send(`|notify|Blackjack (${this.room.title})|${this.createdBy} created a game of Blackjack!`);
	}
	makePlayer(user) {
		return new BlackjackPlayer(user, this);
	}
	sendInvite() {
		const change = this.uhtmlChange;
		const players = Object.keys(this.playerTable);
		this.room.send(`|uhtml${change}|blackjack-${this.blackjackNumber}|<div class="infobox${this.infoboxLimited}">${this.createdBy} has created a game of Blackjack. ${this.button}<br /><strong>Players:</strong> ${!players.length ? '(None)' : players.join(', ')}</div>`);
		this.uhtmlChange = 'change';
	}

	/**
	 * Joining/Leaving/Viewing
	 * joinGame - joins the game
	 * leaveGame - leaves the game
	 * spectate - spectates the game
	 * unspectate - stops spectating the game
	 */
	joinGame(user) {
		if (!user.named) return this.errorMessage(user, `You must first choose a name to play Blackjack.`);
		if (this.state === 'started') return this.errorMessage(user, `Blackjack has already started.`);
		const joined = this.addPlayer(user, this.playerTable);
		if (!joined) {
			this.errorMessage(user, `You are already in this game.`);
			return false;
		}

		this.sendInvite();

		if (Object.keys(this.playerTable).length === this.playerCap) {
			this.start();
		}
		if (this.spectators[user]) delete this.spectators[user]; // prevent player from spectating
		this.atLeastOneJoin = true;
		return true;
	}
	leaveGame(user) {
		if (this.state === 'started') return this.errorMessage(user, `You cannot leave this game; it has already started.`);
		if (!this.playerTable[user.userid]) return this.errorMessage(user, "You are not in this game to leave.");
		this.removePlayer(user);
		this.sendInvite();
	}
	spectate(user) {
		if (this.spectators[user]) return this.errorMessage(user, `You are already spectating this game.`);
		if (this.playerTable[user]) return this.errorMessage(user, `You don't need to spectate the game; you're playing the game.`);
		this.spectators[user.userid] = user.userid;
		user.sendTo(this.id, `You are now spectating this game.`);
	}
	unspectate(user) {
		if (!this.spectators[user.userid]) return this.errorMessage(user, `You are already not spectating this game.`);
		delete this.spectators[user.userid];
		user.sendTo(this.id, `You are no longer spectating this game.`);
	}

	/**
	 * Utility
	 * errorMessage - sends a user an error message
	 * add - adds/sends text to room
	 * display - displays gameplay to players and spectators
	 * clear - clears a user's gameplay screen
	 * clearAllTimers - clears all possible existing timers pertaining to blackjack
	 * slide - slides the game log down in the chat
	 * onConnect - handles replies to send when a user joins the room, if any
	 * onUpdateConnection - overrides default onUpdateConnection
	 * createTimer - creates a timer with a countdown for a player
	 */
	errorMessage(user, message) {
		user.sendTo(this.room, Chat.html`|html|<div class="message-error">${message}</div>`);
	}
	send(message, clean) {
		const change = this.uhtmlChange;
		this.room.send(`|uhtml${change}|blackjack-${this.blackjackNumber}|<div class="infobox${this.infoboxLimited}">${(clean ? message : this.lastMessage + message)}</div>`);
		this.lastMessage += message;
		this.uhtmlChange = 'change';
	}
	display(text, clean, playerName, noChange) {
		let change = this.uhtmlChange;
		if (noChange) change = '';
		if (clean) this.lastMessage = '';
		const message = `|uhtml${change}|blackjack-${this.blackjackNumber}|<div class="infobox${this.infoboxLimited}">`;
		this.lastMessage += text;

		for (let i in this.playerTable) {
			if (playerName && this.playerTable[i].name === playerName) { // turn highlighting
				this.playerTable[i].gameLog += `<span class="highlighted">${text}</span>`;
				this.playerTable[i].sendRoom(`${message}${this.playerTable[i].gameLog}</div>`);
			} else {
				this.playerTable[i].gameLog += text;
				this.playerTable[i].sendRoom(`${message}${this.playerTable[i].gameLog}</div>`);
			}
		}
		for (let i in this.spectators) {
			let user = Users(this.spectators[i]);
			if (user) user.sendTo(this.id, `${message}${this.lastMessage + text}</div>`);
		}
	}
	clear() {
		const player = this.playerTable[this.curUser];
		if (!player) return; // this should never happen
		player.sendRoom(`|uhtmlchange|user-blackjack-${this.blackjackNumber}|`);
	}
	clearAllTimers() {
		if (this.autostand) {
			clearTimeout(this.autostand);
			this.autostand = null;
		}
		if (this.dqTimer) {
			clearTimeout(this.dqTimer);
			this.dqTimer = null;
		}
		if (this.timerTick) {
			clearInterval(this.timerTick);
			this.timerTick = null;
		}
		if (this.autostart) {
			clearTimeout(this.autostart);
			this.autostart = null;
		}
	}
	slide(user) {
		user.sendTo(this.id, `|uhtml|blackjack-${this.blackjackNumber}|`);
		this.display('', null, user.name);
	}
	onConnect(user) {
		const message = `|uhtml|blackjack-${this.blackjackNumber}|<div class="infobox${this.infoboxLimited}">`;
		if (this.state === 'signups') {
			this.sendInvite();
		} else if (this.state === 'started') {
			const player = this.playerTable[user];
			const spectator = this.spectators[user];
			if (player && user.userid === toID(this.curUser)) { // their turn; send gamelog and game screen
				player.sendRoom(`${message}${player.gameLog}`);
				player.sendRoom(player.playScreen.replace('|uhtmlchange|', '|uhtml|'));
				return;
			} else if (player) { // a player, but not their turn; just send gamelog
				player.sendRoom(`${message}${player.gameLog}`);
				return;
			} else if (spectator) { // spectator; send gamelog
				user.sendTo(this.id, `${message}${this.lastMessage}`);
				return;
			}
		}
	}
	onUpdateConnection() {
		// This happens (runs onConnect) when a connection in the room
		// changes, such as going on a new name. We don't want to do
		// anything for such a situation, so we're overriding this.
	}
	createTimer(player) {
		this.dqTimer = setTimeout(() => {
			let cards = '';
			for (let u in player.cards) cards += `[${player.cards[u]}] `;
			player.status = 'stand';
			this.display(Chat.html`<br /><strong>${player.name}</strong> <u>stands</u> with ${cards} (${player.points}) (Auto-stand: took too long to move)`, null, this.playerTable[this.curUser].name);
			this.clear();
			this.next();
		}, this.turnTimeoutMinutes * 60 * 1000);
		this.timerTick = setInterval(() => {
			let display = player.playScreen.replace('|uhtml|', '|uhtmlchange|');
			if (display !== '') {
				let timeLeft = player.timerTicksLeft - 5;
				let buffer = (String(timeLeft).length === 1 ? '0' : '');
				let half = (timeLeft <= ((this.turnTimeoutMinutes * 60) / 2));
				player.sendRoom(`${display} | <span${half ? ` class="message-error"` : ``}>[<i class="fa fa-hourglass-${half ? 2 : 1}" aria-hidden="true"></i> 0:${buffer}${timeLeft}]</span>`);
				player.timerTicksLeft -= this.timerTickSeconds;
			}
		}, this.timerTickSeconds * 1000);
	}

	/**
	 * Game State Changes
	 * start - starts the game
	 * end - ends the game
	 * destroy - destroys the game
	 */
	start(user) {
		const numberOfPlayers = Object.keys(this.playerTable).length;
		if (numberOfPlayers < this.minimumPlayers) {
			if (this.autostart) {
				clearTimeout(this.autostart);
				this.autostart = null;
			}
			this.send("<br />Not enough players to start; game canceled.");
			this.destroy();
			return;
		}
		if (user) this.startedBy = user.name;
		this.infoboxLimited = (numberOfPlayers >= this.playerScrollWheel ? ' infobox-limited' : '');
		this.send(`[Blackjack has started. ${this.spectateButton}]`, true, true);

		this.curUser = Object.keys(this.playerTable)[0];

		let output = `The game of blackjack has started${(this.startedBy !== '' ? ` (started by ${this.startedBy})` : ``)}. ${this.slideButton}<br />`;
		this.state = 'started';
		for (let player in this.playerTable) {
			this.giveCard(this.playerTable[player]);
			this.giveCard(this.playerTable[player]);
			output += Chat.html`<strong>${this.playerTable[player].name}</strong>: [${this.playerTable[player].cards[0]}] [${this.playerTable[player].cards[1]}] (${this.playerTable[player].points})<br />`;
		}

		this.giveCard('dealer');
		this.giveCard('dealer');
		output += `<strong>${this.dealer.name}</strong>: [${this.dealer.cards[0]}]`;

		this.display(output, true);
		this.next();
	}
	end(user, cmd) {
		const force = (cmd && cmd === 'forceend');
		if (this.state === 'started' && cmd && !force) return this.errorMessage(user, `You can only end this game by using /blackjack forceend.`);
		if (force) {
			this.send(Chat.html`(Blackjack was forcibly ended by ${user.name}.)`, true);
			if (this.curUser !== '') this.clear();
		}
		let winners = [];

		if (!force) {
			if (this.dealer.points > 21) {
				for (let player of Object.keys(this.playerTable)) {
					if (this.playerTable[player].status === 'bust') continue;
					winners.push(this.playerTable[player].name);
				}
			} else if (this.dealer.points !== 21) {
				for (let player of Object.keys(this.playerTable)) {
					if (this.playerTable[player].status === 'bust' || this.playerTable[player].points <= this.dealer.points) continue;
					winners.push(this.playerTable[player].name);
				}
			} else if (this.dealer.points === 21) {
				winners.push(this.dealer.name);
			}
			this.send(`[Blackjack has ended.]`, true);
			if (winners.length < 1) {
				this.display(`<br />There are no winners this time.`);
			} else {
				this.display(Chat.html`<br />Winner${Chat.plural(winners.length)}: ${winners.join(', ')}`);
			}
		}

		if (this.autostart) {
			clearTimeout(this.autostart);
			this.autostart = null;
		}
		this.state = 'ended';

		this.destroy();
	}
	destroy() {
		if (Object.keys(this.playerTable)) {
			for (let player of Object.keys(this.playerTable)) {
				this.playerTable[player].destroy();
			}
		}
		this.room.blackjack++;
		this.clearAllTimers();
		delete this.room.game;
	}

	/**
	 * Gameplay
	 * hit - player decides to get a new card
	 * stand - player decides to keep current cards
	 * giveCard - gives a player a card from the deck
	 * getCardPoints - returns the point value of a user's cards
	 * next - game goes on to the next turn
	 */
	hit(user) {
		if (this.state !== 'started') return this.errorMessage(user, `Blackjack hasn't started yet.`);
		if (!this.playerTable[user]) return this.errorMessage(user, `You aren't a player in this game.`);
		if (this.curUser !== user.userid) return this.errorMessage(user, `It's not your turn.`);
		this.playerTable[user].selfUhtml = 'change';
		this.playerTable[user].resetTimerTicks();

		this.giveCard(user);
	}
	stand(user) {
		const player = this.playerTable[user];
		if (this.state !== 'started') return this.errorMessage(user, `Blackjack hasn't started yet.`);
		if (!player) return this.errorMessage(user, `You aren't a player in this game.`);
		if (this.curUser !== user.userid) return this.errorMessage(user, `It's not your turn.`);
		player.status = 'stand';
		let cards = '';
		for (let card of player.cards) cards += `[${card}] `;
		this.display(Chat.html`<br /><strong>${player.name}</strong> <u>stands</u> with ${cards} (${player.points})`, null, player.name);
		this.clear();

		this.next();
	}
	giveCard(user) {
		if (this.deck.length < 1) this.deck = Dex.shuffle(this.deck);
		const player = (user === 'dealer' ? this.dealer : this.playerTable[user]);
		if (!player) return; // this should never happen
		player.cards.push(this.deck[0]);

		this.deck.shift();

		if (this.deck.length === 0) {
			this.display(`<br />${this.dealer.name} has ran out of cards in the deck; shuffling a new deck...`);
			this.deck = new BlackjackDeck().shuffle();
		}

		player.points = this.getCardPoints(player);

		if (player.cards.length < 3) return;

		if (player.cards.length > 2) this.display(Chat.html`<br /><strong>${player.name}</strong> <u>hit</u> and received [${player.cards[player.cards.length - 1]}] (${player.points})`, null, player.name);

		if (user === 'dealer') {
			if (player.points > 21) {
				let cards = '';
				for (let card of player.cards) cards += `[${card}] `;
				this.display(Chat.html`<br /><strong>${this.dealer.name}</strong> has <u>busted</u> with ${cards} (${player.points})`);
				this.end();
				return;
			} else if (player.points === 21) {
				this.display(`<br /><strong>${this.dealer.name}</strong> has blackjack!`);
				this.end();
				return;
			}
		}

		if (player.points > 21) {
			player.status = 'bust';
			let cards = '';
			for (let card in player.cards) cards += `[${card}] `;
			this.display(Chat.html`<br /><strong>${player.name}</strong> has <u>busted</u> with ${cards} (${player.points})`, null, player.name);
			this.clear();
		}
		if (player.points === 21) {
			player.status = 'stand';
			this.display(Chat.html`<br /><strong>${player.name}</strong> has blackjack!`, null, player.name);
			this.clear();
		}
		if (user !== 'dealer') this.playerTable[user].cards = player.cards;
		this.next();
	}
	getCardPoints(player) {
		let points = 0;
		let aceCount = 0;
		for (let card of player.cards) {
			card = toID(card).toUpperCase();
			if (!isNaN(Number(card))) {
				points += Number(card);
			} else if (['K', 'Q', 'J'].includes(card)) {
				points += 10;
			} else if (card === 'A') {
				points += 11;
				aceCount++;
			}
		}

		// At first, we value aces as 11, however, we will change their value
		// to be 1 if having them as 11 would cause an unnecessary bust. We will
		// do this by subtracting 10 for each ace that would otherwise cause a bust.
		while (points > 21 && aceCount > 0) {
			points -= 10;
			aceCount--;
		}

		return points;
	}
	next() {
		this.clearAllTimers();
		if (Object.keys(this.playerTable)[Object.keys(this.playerTable).length - 1] === this.curUser && this.playerTable[this.curUser].status !== 'playing') {
			if (this.dealer.points < 17) {
				this.giveCard('dealer');
			} else if (this.dealer.points >= 17) {
				let cards = '';
				for (let card of this.dealer.cards) cards += `[${card}] `;
				this.display(`<br /><strong>${this.dealer.name}</strong> <u>stands</u> with ${cards} (${this.dealer.points})`);
				this.end();
			}
			return;
		}
		if (this.playerTable[this.curUser].status !== 'playing') {
			let number = 0;
			while (this.playerTable[Object.keys(this.playerTable)[number]].status !== 'playing') number++;
			this.curUser = Object.keys(this.playerTable)[number];
		}
		let output = `|uhtml${this.playerTable[this.curUser].selfUhtml}|user-blackjack-${this.blackjackNumber}|<div class="infobox">`;
		output += `It's your turn to move, ${this.playerTable[this.curUser].name}<br />`;
		for (let card of this.playerTable[this.curUser].cards) {
			output += `<img src="${CARD_IMAGE_PATH}${toID(card).toUpperCase() + this.symbols[card.substr(-1)]}.png" title="${card}" height="100"/>' `;
		}
		output += `<br />Score: ${this.playerTable[this.curUser].points}${(this.playerTable[this.curUser].points === 21 ? ` (you have blackjack!)` : ``)}`;
		output += `<br /><button class="button" name="send" value="/blackjack hit" title="Hit (get another card)">Hit</button> | <button class="button" name="send" value="/blackjack stand" title="Stand (just keep these cards)">Stand</button>`;

		this.playerTable[this.curUser].sendRoom(`|notify|Blackjack (${this.room.title})|It's your turn to play!`);
		this.playerTable[this.curUser].sendRoom(output);
		this.playerTable[this.curUser].playScreen = output;

		this.createTimer(this.playerTable[this.curUser]);
	}
}

class BlackjackPlayer extends Rooms.RoomGamePlayer {
	constructor(user, game) {
		super(user, game);
		this.game = game;

		this.cards = [];
		this.points = 0;
		this.slide = 0;
		this.status = 'playing';

		this.selfUhtml = '';
		this.gameLog = '';
		this.playScreen = '';
		this.timerTicksLeft = this.game.turnTimeoutMinutes * 60; // to get into seconds-format
	}
	resetTimerTicks() {
		this.timerTicksLeft = this.game.turnTimeoutMinutes * 60;
	}
}

class BlackjackDealer {
	constructor() {
		this.cards = [];
		this.points = 0;
		this.name = 'The Dealer';
	}
}

class BlackjackDeck {
	constructor() {
		this.deck = [
			'A♥', 'A♦', 'A♣', 'A♠', '2♥', '2♦', '2♣', '2♠', '3♥', '3♦', '3♣',
			'3♠', '4♥', '4♦', '4♣', '4♠', '5♥', '5♦', '5♣', '5♠', '6♥', '6♦', '6♣', '6♠',
			'7♥', '7♦', '7♣', '7♠', '8♥', '8♦', '8♣', '8♠', '9♥', '9♦', '9♣', '9♠', '10♥',
			'10♦', '10♣', '10♠', 'J♥', 'J♦', 'J♣', 'J♠', 'Q♥', 'Q♦', 'Q♣', 'Q♠', 'K♥', 'K♦',
			'K♣', 'K♠',
		];
	}
	shuffle() {
		return Dex.shuffle(this.deck);
	}
}

exports.commands = {
	bj: 'blackjack',
	blackjack: {
		new: 'create',
		create(target, room, user) {
			if (!this.can('gamemanagement', null, room)) return;
			if (room.game) return this.errorReply("There is already a game running in this room.");
			if (room.blackjackDisabled) return this.errorReply("Blackjack is currently disabled in this room.");

			this.privateModAction(`(A game of blackjack was created by ${user.name}.)`);
			this.modlog(`BLACKJACK CREATE`);
			room.game = new Blackjack(room, user, target);
		},
		start(target, room, user) {
			if (!this.can('gamemanagement', null, room)) return;
			if (!room.game || !room.game.blackjack) return this.errorReply("There is no game of blackjack currently ongoing in this room.");

			this.privateModAction(`(The game of blackjack was started by ${user.name}.)`);
			this.modlog(`BLACKJACK START`);
			room.game.start(user);
		},
		forceend: 'end',
		end(target, room, user, connection, cmd) {
			if (!this.can('gamemanagement', null, room)) return;
			if (!room.game || !room.game.blackjack) return this.errorReply("There is no game of blackjack currently ongoing in this room.");

			this.privateModAction(`The game of blackjack was ended by ${user.name}.`);
			this.modlog(`BLACKJACK END`);
			room.game.destroy();
		},
		hit(target, room, user) {
			if (!room.game || !room.game.blackjack) return this.errorReply("There is no game of blackjack currently ongoing in this room.");

			room.game.hit(user);
		},
		stand(target, room, user) {
			if (!room.game || !room.game.blackjack) return this.errorReply("There is no game of blackjack currently ongoing in this room.");

			room.game.stand(user);
		},
		slide(target, room, user) { // undocumented (used in UI)
			if (!room.game || !room.game.blackjack) return this.errorReply("There is no game of blackjack currently ongoing in this room.");

			room.game.slide(user);
		},
		j: 'join',
		join(target, room, user) {
			return this.parse('/joingame');
		},
		l: 'leave',
		leave(target, room, user) {
			return this.parse('/leavegame');
		},
		unspectate: 'spectate',
		spectate(target, room, user, connection, cmd) {
			if (!room.game || !room.game.blackjack) return this.errorReply("There is no game of blackjack currently ongoing in this room.");

			if (cmd === 'spectate') {
				room.game.spectate(user);
			} else if (cmd === 'unspectate') {
				room.game.unspectate(user);
			}
		},
		disable(target, room, user) {
			if (!this.can('declare', null, room)) return;
			if (room.blackjackDisabled) return this.errorReply("Blackjack is already disabled in this room.");
			room.blackjackDisabled = true;
			this.privateModAction(`(${user.name} disabled games of blackjack in this room.)`);

			if (room.chatRoomData) {
				room.chatRoomData.blackjackDisabled = room.blackjackDisabled;
				Rooms.global.writeChatRoomData();
			}
		},
		enable(target, room, user) {
			if (!this.can('declare', null, room)) return;
			if (!room.blackjackDisabled) return this.errorReply("Blackjack is already enabled in this room.");
			room.blackjackDisabled = false;
			this.privateModAction(`(${user.name} enabled games of blackjack in this room.)`);

			if (room.chatRoomData) {
				room.chatRoomData.blackjackDisabled = room.blackjackDisabled;
				Rooms.global.writeChatRoomData();
			}
		},
		'': 'help',
		help(target, room, user) {
			return this.parse('/help blackjack');
		},
	},
	blackjackhelp: [
		"/blackjack create - Creates a game of blackjack. Requires: % @ # & ~",
		"/blackjack create [autostart] - Automatically creates a game of blackjack in [autostart] minutes. Requiers: % @ # & ~",
		"/blackjack join - Joins a game of blackjack.",
		"/blackjack leave - Leaves a game of blackjack.",
		"/blackjack spectate - Spectates a game of blackjack.",
		"/blackjack unspectate - Stops spectating a game of blackjack.",
		"/blackjack end - Ends a game of blackjack. Requires: % @ # & ~",
		"/blackjack disable - Prevents games of blackjack from being made in the room. Requires: # & ~",
		"/blackjack enable - Allows games of blackjack from being made in the room. Requires: # & ~",
	],
};
