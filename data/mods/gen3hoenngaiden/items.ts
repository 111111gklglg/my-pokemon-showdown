export const Items: {[k: string]: ModdedItemData} = {
	aguavberry: {
		inherit: true,
		onUpdate() {},
		onResidualOrder: 10,
		onResidualSubOrder: 4,
		onResidual(pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 2) {
				pokemon.eatItem();
			}
		},
	},
	apicotberry: {
		inherit: true,
		onUpdate() {},
		onResidualOrder: 10,
		onResidualSubOrder: 4,
		onResidual(pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 4) {
				pokemon.eatItem();
			}
		},
	},
	berryjuice: {
		inherit: true,
		onUpdate() {},
		onResidualOrder: 10,
		onResidualSubOrder: 4,
		onResidual(pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 2) {
				if (this.runEvent('TryHeal', pokemon) && pokemon.useItem()) {
					this.heal(20);
				}
			}
		},
		isNonstandard: "Unobtainable",
	},
	blackbelt: {
		inherit: true,
		onBasePower() {},
		onModifyAtkPriority: 1,
		onModifyAtk(atk, user, target, move) {
			if (move?.type === 'Fighting') {
				return this.chainModify(1.1);
			}
		},
	},
	blackglasses: {
		inherit: true,
		onBasePower() {},
		onModifySpAPriority: 1,
		onModifySpA(spa, user, target, move) {
			if (move?.type === 'Dark') {
				return this.chainModify(1.1);
			}
		},
	},
	charcoal: {
		inherit: true,
		onBasePower() {},
		onModifySpAPriority: 1,
		onModifySpA(spa, user, target, move) {
			if (move?.type === 'Fire') {
				return this.chainModify(1.1);
			}
		},
	},
	dragonfang: {
		inherit: true,
		onBasePower() {},
		onModifySpAPriority: 1,
		onModifySpA(spa, user, target, move) {
			if (move?.type === 'Dragon') {
				return this.chainModify(1.1);
			}
		},
	},
	enigmaberry: {
		name: "Enigma Berry",
		spritenum: 124,
		isBerry: true,
		num: 208,
		gen: 3,
		isNonstandard: "Unobtainable",
	},
	fastball: {
		inherit: true,
		isNonstandard: "Unobtainable",
	},
	figyberry: {
		inherit: true,
		onUpdate() {},
		onResidualOrder: 10,
		onResidualSubOrder: 4,
		onResidual(pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 2) {
				pokemon.eatItem();
			}
		},
	},
	ganlonberry: {
		inherit: true,
		onUpdate() {},
		onResidualOrder: 10,
		onResidualSubOrder: 4,
		onResidual(pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 4) {
				pokemon.eatItem();
			}
		},
	},
	hardstone: {
		inherit: true,
		onBasePower() {},
		onModifyAtkPriority: 1,
		onModifyAtk(atk, user, target, move) {
			if (move?.type === 'Rock') {
				return this.chainModify(1.1);
			}
		},
	},
	heavyball: {
		inherit: true,
		isNonstandard: "Unobtainable",
	},
	iapapaberry: {
		inherit: true,
		onUpdate() {},
		onResidualOrder: 10,
		onResidualSubOrder: 4,
		onResidual(pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 2) {
				pokemon.eatItem();
			}
		},
	},
	kingsrock: {
		inherit: true,
		onModifyMove(move) {
			const affectedByKingsRock = [
				'aerialace', 'aeroblast', 'aircutter', 'armthrust', 'barrage', 'beatup', 'bide', 'bind', 'blastburn', 'bonerush', 'bonemerang', 'bounce', 'brickbreak', 'bulletseed', 'clamp', 'cometpunch', 'crabhammer', 'crosschop', 'cut', 'dig', 'dive', 'doublekick', 'doubleslap', 'doubleedge', 'dragonbreath', 'dragonclaw', 'dragonrage', 'drillpeck', 'earthquake', 'eggbomb', 'endeavor', 'eruption', 'explosion', 'extremespeed', 'falseswipe', 'feintattack', 'firespin', 'flail', 'fly', 'frenzyplant', 'frustration', 'furyattack', 'furycutter', 'furyswipes', 'gust', 'hiddenpower', 'highjumpkick', 'hornattack', 'hydrocannon', 'hydropump', 'hyperbeam', 'iceball', 'iciclespear', 'jumpkick', 'karatechop', 'leafblade', 'lowkick', 'machpunch', 'magicalleaf', 'magnitude', 'megakick', 'megapunch', 'megahorn', 'meteormash', 'mudshot', 'muddywater', 'nightshade', 'outrage', 'overheat', 'payday', 'peck', 'petaldance', 'pinmissile', 'poisontail', 'pound', 'psychoboost', 'psywave', 'quickattack', 'rage', 'rapidspin', 'razorleaf', 'razorwind', 'return', 'revenge', 'reversal', 'rockblast', 'rockthrow', 'rollingkick', 'rollout', 'sandtomb', 'scratch', 'seismictoss', 'selfdestruct', 'shadowpunch', 'shockwave', 'signalbeam', 'silverwind', 'skullbash', 'skyattack', 'skyuppercut', 'slam', 'slash', 'snore', 'solarbeam', 'sonicboom', 'spikecannon', 'spitup', 'steelwing', 'strength', 'struggle', 'submission', 'surf', 'swift', 'tackle', 'takedown', 'thrash', 'tickle', 'triplekick', 'twister', 'uproar', 'visegrip', 'vinewhip', 'vitalthrow', 'volttackle', 'watergun', 'waterpulse', 'waterfall', 'weatherball', 'whirlpool', 'wingattack', 'wrap',
			];
			if (affectedByKingsRock.includes(move.id)) {
				if (!move.secondaries) move.secondaries = [];
				move.secondaries.push({
					chance: 10,
					volatileStatus: 'flinch',
				});
			}
		},
	},
	lansatberry: {
		inherit: true,
		onUpdate() {},
		onResidualOrder: 10,
		onResidualSubOrder: 4,
		onResidual(pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 4) {
				pokemon.eatItem();
			}
		},
	},
	laxincense: {
		inherit: true,
		onModifyAccuracy(accuracy) {
			if (typeof accuracy !== 'number') return;
			this.debug('lax incense - decreasing accuracy');
			return accuracy * 0.95;
		},
	},
	levelball: {
		inherit: true,
		isNonstandard: "Unobtainable",
	},
	liechiberry: {
		inherit: true,
		onUpdate() {},
		onResidualOrder: 10,
		onResidualSubOrder: 4,
		onResidual(pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 4) {
				pokemon.eatItem();
			}
		},
	},
	lightball: {
		inherit: true,
		onModifySpA(spa, pokemon) {
			if (pokemon.species.name === 'Pikachu') {
				return this.chainModify(2);
			}
		},
		onBasePower() {},
	},
	loveball: {
		inherit: true,
		isNonstandard: "Unobtainable",
	},
	lureball: {
		inherit: true,
		isNonstandard: "Unobtainable",
	},
	magnet: {
		inherit: true,
		onBasePower() {},
		onModifySpAPriority: 1,
		onModifySpA(spa, user, target, move) {
			if (move?.type === 'Electric') {
				return this.chainModify(1.1);
			}
		},
	},
	magoberry: {
		inherit: true,
		onUpdate() {},
		onResidualOrder: 10,
		onResidualSubOrder: 4,
		onResidual(pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 2) {
				pokemon.eatItem();
			}
		},
	},
	metalcoat: {
		inherit: true,
		onBasePower() {},
		onModifyAtkPriority: 1,
		onModifyAtk(atk, user, target, move) {
			if (move?.type === 'Steel') {
				return this.chainModify(1.1);
			}
		},
	},
	miracleseed: {
		inherit: true,
		onBasePower() {},
		onModifySpAPriority: 1,
		onModifySpA(spa, user, target, move) {
			if (move?.type === 'Grass') {
				return this.chainModify(1.1);
			}
		},
	},
	moonball: {
		inherit: true,
		isNonstandard: "Unobtainable",
	},
	mysticwater: {
		inherit: true,
		onBasePower() {},
		onModifySpAPriority: 1,
		onModifySpA(spa, user, target, move) {
			if (move?.type === 'Water') {
				return this.chainModify(1.1);
			}
		},
	},
	nevermeltice: {
		inherit: true,
		onBasePower() {},
		onModifySpAPriority: 1,
		onModifySpA(spa, user, target, move) {
			if (move?.type === 'Ice') {
				return this.chainModify(1.1);
			}
		},
	},
	oranberry: {
		inherit: true,
		onUpdate() {},
		onResidualOrder: 10,
		onResidualSubOrder: 4,
		onResidual(pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 2) {
				pokemon.eatItem();
			}
		},
	},
	petayaberry: {
		inherit: true,
		onUpdate() {},
		onResidualOrder: 10,
		onResidualSubOrder: 4,
		onResidual(pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 4) {
				pokemon.eatItem();
			}
		},
	},
	poisonbarb: {
		inherit: true,
		onBasePower() {},
		onModifyAtkPriority: 1,
		onModifyAtk(atk, user, target, move) {
			if (move?.type === 'Poison') {
				return this.chainModify(1.1);
			}
		},
	},
	quickclaw: {
		inherit: true,
		onFractionalPriority() {},
		// implemented in Pokemon#getActionSpeed()
	},
	salacberry: {
		inherit: true,
		onUpdate() {},
		onResidualOrder: 10,
		onResidualSubOrder: 4,
		onResidual(pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 4) {
				pokemon.eatItem();
			}
		},
	},
	seaincense: {
		inherit: true,
		onBasePower() {},
		onModifySpAPriority: 1,
		onModifySpA(spa, user, target, move) {
			if (move?.type === 'Water') {
				return this.chainModify(1.05);
			}
		},
	},
	sharpbeak: {
		inherit: true,
		onBasePower() {},
		onModifyAtkPriority: 1,
		onModifyAtk(atk, user, target, move) {
			if (move?.type === 'Flying') {
				return this.chainModify(1.1);
			}
		},
	},
	silkscarf: {
		inherit: true,
		onBasePower() {},
		onModifyAtkPriority: 1,
		onModifyAtk(atk, user, target, move) {
			if (move?.type === 'Normal') {
				return this.chainModify(1.1);
			}
		},
	},
	silverpowder: {
		inherit: true,
		onBasePower() {},
		onModifyAtkPriority: 1,
		onModifyAtk(atk, user, target, move) {
			if (move?.type === 'Bug') {
				return this.chainModify(1.1);
			}
		},
	},
	sitrusberry: {
		inherit: true,
		onUpdate() {},
		onResidualOrder: 10,
		onResidualSubOrder: 4,
		onResidual(pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 2) {
				pokemon.eatItem();
			}
		},
		onEat(pokemon) {
			this.heal(30);
		},
	},
	softsand: {
		inherit: true,
		onBasePower() {},
		onModifyAtkPriority: 1,
		onModifyAtk(atk, user, target, move) {
			if (move?.type === 'Ground') {
				return this.chainModify(1.1);
			}
		},
	},
	spelltag: {
		inherit: true,
		onBasePower() {},
		onModifyAtkPriority: 1,
		onModifyAtk(atk, user, target, move) {
			if (move?.type === 'Ghost') {
				return this.chainModify(1.1);
			}
		},
	},
	sportball: {
		inherit: true,
		isNonstandard: "Unobtainable",
	},
	starfberry: {
		inherit: true,
		onUpdate() {},
		onResidualOrder: 10,
		onResidualSubOrder: 4,
		onResidual(pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 4) {
				pokemon.eatItem();
			}
		},
	},
	twistedspoon: {
		inherit: true,
		onBasePower() {},
		onModifySpAPriority: 1,
		onModifySpA(spa, user, target, move) {
			if (move?.type === 'Psychic') {
				return this.chainModify(1.1);
			}
		},
	},
	wikiberry: {
		inherit: true,
		onUpdate() {},
		onResidualOrder: 10,
		onResidualSubOrder: 4,
		onResidual(pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 2) {
				pokemon.eatItem();
			}
		},
	},
	bugmemory: {
		inherit: true,
		gen: 3,
	},
	darkmemory: {
		inherit: true,
		gen: 3,
	},
	dragonmemory: {
		inherit: true,
		gen: 3,
	},
	electricmemory: {
		inherit: true,
		gen: 3,
	},
	fightingmemory: {
		inherit: true,
		gen: 3,
	},
	firememory: {
		inherit: true,
		gen: 3,
	},
	flyingmemory: {
		inherit: true,
		gen: 3,
	},
	ghostmemory: {
		inherit: true,
		gen: 3,
	},
	grassmemory: {
		inherit: true,
		gen: 3,
	},
	groundmemory: {
		inherit: true,
		gen: 3,
	},
	icememory: {
		inherit: true,
		gen: 3,
	},
	poisonmemory: {
		inherit: true,
		gen: 3,
	},
	psychicmemory: {
		inherit: true,
		gen: 3,
	},
	rockmemory: {
		inherit: true,
		gen: 3,
	},
	steelmemory: {
		inherit: true,
		gen: 3,
	},
	watermemory: {
		inherit: true,
		gen: 3,
	},
	expertbelt: {
		name: "Expert Belt",
		spritenum: 132,
		fling: {
			basePower: 10,
		},
		onModifyDamage(damage, source, target, move) {
			if (move && target.getMoveHitData(move).typeMod > 0) {
				return this.chainModify([0x1333, 0x1000]);
			}
		},
		num: 268,
		gen: 3,
	},
	thickclub: {
		name: "Thick Club",
		spritenum: 491,
		fling: {
			basePower: 90,
		},
		onModifyAtkPriority: 1,
		onModifyAtk(atk, pokemon) {
			if (pokemon.baseSpecies.baseSpecies === 'Cubone' || pokemon.baseSpecies.baseSpecies === 'Marowak') {
				return this.chainModify(2);
			}
		},
		itemUser: ["Marowak", "Cubone", "Marowak-Alola"],
		num: 258,
		gen: 2,
	},
	stick: {
		name: "Stick",
		fling: {
			basePower: 60,
		},
		spritenum: 475,
		onModifyCritRatio(critRatio, user) {
			if (["farfetchd", "sirfetchd"].includes(this.toID(user.baseSpecies.baseSpecies))) {
				return critRatio + 2;
			}
		},
		itemUser: ["Farfetch\u2019d", "Farfetch\u2019d-Galar", "Sirfetch\u2019d"],
		num: 259,
		gen: 2,
	},
	occaberry: {
		inherit: true,
		gen: 3,
	},
	passhoberry: {
		inherit: true,
		gen: 3,
	},
	wacanberry: {
		inherit: true,
		gen: 3,
	},
	rindoberry: {
		inherit: true,
		gen: 3,
	},
	yacheberry: {
		inherit: true,
		gen: 3,
	},
	chopleberry: {
		inherit: true,
		gen: 3,
	},
	kebiaberry: {
		inherit: true,
		gen: 3,
	},
	shucaberry: {
		inherit: true,
		gen: 3,
	},
	cobaberry: {
		inherit: true,
		gen: 3,
	},
	payapaberry: {
		inherit: true,
		gen: 3,
	},
	tangaberry: {
		inherit: true,
		gen: 3,
	},
	chartiberry: {
		inherit: true,
		gen: 3,
	},
	kasibberry: {
		inherit: true,
		gen: 3,
	},
	habanberry: {
		inherit: true,
		gen: 3,
	},
	colburberry: {
		inherit: true,
		gen: 3,
	},
	babiriberry: {
		inherit: true,
		gen: 3,
	},
	chilanberry: {
		inherit: true,
		gen: 3,
	},
	custapberry: {
		inherit: true,
		gen: 3,
	},
	airballoon: {
		inherit: true,
		gen: 3,
	},
};
