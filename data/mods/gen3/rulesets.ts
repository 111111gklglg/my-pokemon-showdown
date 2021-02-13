export const Formats: {[k: string]: ModdedFormatData} = {
	standard: {
		effectType: 'ValidatorRule',
		name: 'Standard',
		desc: "The standard ruleset for all offical Smogon singles tiers (Ubers, OU, etc.)",
		ruleset: ['Obtainable', 'Sleep Clause Mod', 'Switch Priority Clause Mod', 'Species Clause', 'Nickname Clause', 'OHKO Clause', 'Evasion Moves Clause', 'Endless Battle Clause', 'HP Percentage Mod', 'Cancel Mod', 'Deoxys Camouflage Mod'],
	},
	obtainable: {
		inherit: true,
		// Mostly hardcoded in team-validator.ts
		onValidateTeam(team, format) {
			let deoxysType;
			for (const set of team) {
				if (set.species === 'Deoxys' || set.species === 'Deoxys-Attack' ||
					set.species === 'Deoxys-Defense' || set.species === 'Deoxys-Speed') {
					if (!deoxysType) {
						deoxysType = set.species;
					} else if (deoxysType && deoxysType !== set.species) {
						return [
							`You cannot have more than one forme of Deoxys.`,
							`(The forme of Deoxys you get is dependant on the game you own.)`,
						];
					}
				}
			}
			return [];
		},
	},
};
