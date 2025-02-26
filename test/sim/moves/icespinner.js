'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe(`Ice Spinner`, () => {
	afterEach(() => {
		battle.destroy();
	});

	it(`should remove Terrains if the user is active and on the field`, () => {
		battle = common.createBattle([[
			{ species: 'wynaut', moves: ['icespinner'] },
		], [
			{ species: 'registeel', ability: 'psychicsurge', moves: ['sleeptalk'] },
		]]);

		battle.makeChoices();
		assert.false(battle.field.isTerrain('psychicterrain'));
	});

	it(`should remove Terrains if target has a substitute`, function () {
		battle = common.createBattle([[
			{species: 'wynaut', moves: ['sleeptalk', 'icespinner']},
		], [
			{species: 'registeel', ability: 'psychicsurge', moves: ['substitute', 'sleeptalk']},
		]]);

		battle.makeChoices('move sleeptalk', 'move substitute');
		battle.makeChoices('move ice spinner', 'move sleeptalk');
		assert.false(battle.field.isTerrain('psychicterrain'));
	});

	it(`should not remove Terrains if the user faints from Life Orb`, function () {
		battle = common.createBattle([[
			{ species: 'shedinja', item: 'lifeorb', moves: ['icespinner'] },
			{ species: 'wynaut', moves: ['sleeptalk'] },
		], [
			{ species: 'registeel', ability: 'psychicsurge', moves: ['sleeptalk'] },
		]]);

		battle.makeChoices();
		assert(battle.field.isTerrain('psychicterrain'));
	});

	it(`should not remove Terrains if the user faints from Rocky Helmet`, () => {
		battle = common.createBattle([[
			{ species: 'shedinja', moves: ['icespinner'] },
			{ species: 'wynaut', moves: ['sleeptalk'] },
		], [
			{ species: 'registeel', item: 'rockyhelmet', ability: 'psychicsurge', moves: ['sleeptalk'] },
		]]);

		battle.makeChoices();
		assert(battle.field.isTerrain('psychicterrain'));
	});

	it(`should not remove Terrains if the user is forced out via Red Card`, function () {
		battle = common.createBattle([[
			{ species: 'shedinja', moves: ['icespinner'] },
			{ species: 'wynaut', moves: ['sleeptalk'] },
		], [
			{ species: 'registeel', item: 'redcard', ability: 'psychicsurge', moves: ['sleeptalk'] },
		]]);

		battle.makeChoices();
		assert(battle.field.isTerrain('psychicterrain'));
	});
});
