import type { Translations } from "../../server/chat";

export const translations: Translations = {
	strings: {
		"The announcement has ended.": "De mededeling is voorbij.",
		"Battles do not support announcements.": "Mededelingen worden in gevechten niet ondersteund.",
		"You are not allowed to use filtered words in announcements.": "Je mag geen gefilterde woorden gebruiken in mededelingen.",
		"There is already a poll or announcement in progress in this room.": "Er loopt al een poll of mededeling in deze room.",
		"An announcement was started by ${user.name}.": "${user.name}. heeft een mededeling aangemaakt.",
		"There is no announcement running in this room.": "Er zijn momenteel geen mededelingen in deze room.",
		"There is no timer to clear.": "Er loopt momenteel geen timer om de mededeling verwijderen.",
		"The announcement timer was turned off.": "De mededelingtimer is uitgezet.",
		"Invalid time given.": "Ongeldige tijd opgegeven.",
		"The announcement timer is off.": "De mededelingtimer staat uit.",
		"The announcement was ended by ${user.name}.": "De mededeling is beëindigd door ${user.name}.",
		"Accepts the following commands:": "De volgende commando's worden geaccepteerd:",

		"That option is not selected.": "Die optie is niet geselecteerd.",
		"You have already voted for this poll.": "Je hebt al gestemd op deze poll.",
		"No options selected.": "Geen opties geselecteerd.",
		"you will not be able to vote after viewing results": "als je de uitslag hebt gezien kun je niet meer stemmen",
		"View results": "Bekijk de uitslag",
		"You can't vote after viewing results": "Je kunt niet stemmen nadat je de uitslag gezien hebt",
		"The poll has ended &ndash; scroll down to see the results": "De poll is voorbij &ndash; scroll naar beneden om de uitslag te zien",
		"Vote for ${num}": "Stem op optie ${num}",
		"Submit your vote": "Breng je stem uit",
		"Quiz": "Quiz",
		"Poll": "Poll",
		"Submit": "Verzenden",
		"ended": "beëindigd",
		"votes": "stemmen",
		"delete": "verwijder",
		"Poll too long.": "De poll is te lang.",
		"Battles do not support polls.": "Polls worden in gevechten niet ondersteund.",
		"You are not allowed to use filtered words in polls.": "Je mag geen gefilterde woorden gebruiken in polls.",
		"Not enough arguments for /poll new.": "Onvoldoende argumenten (antwoordmogelijkheden) opgegeven voor /poll new.",
		"Too many options for poll (maximum is 8).": "Te veel antwoordmogelijkheden voor een poll (de limiet is 8).",
		"There are duplicate options in the poll.": "De poll bevat twee of meer identieke opties.",
		"${user.name} queued a poll.": "${user.name} heeft een poll in de wachtrij gezet.",
		"A poll was started by ${user.name}.": "${user.name} heeft een poll aangemaakt.",
		"The queue is already empty.": "De wachtrij is al leeg.",
		"Cleared poll queue.": "Wachtrij leeggemaakt.",
		"Room \"${roomid}\" not found.": "Room \"${roomid}\" is niet gevonden.",
		"Can't delete poll at slot ${slotString} - \"${slotString}\" is not a number.": "Kan poll op plek ${slotString} niet verwijderen - \"${slotString}\" is geen geldig getal.",
		"There is no poll in queue at slot ${slot}.": "Er staat geen poll op plek ${slot} van de wachtrij.",
		"(${user.name} deleted the queued poll in slot ${slot}.)": "(${user.name} heeft de poll op plek ${slot} van de wachtrij verwijderd.)",
		"There is no poll running in this room.": "Er loopt momenteel geen poll in deze room.",
		"To vote, specify the number of the option.": "Specificeer het nummer van de optie om te stemmen.",
		"Option not in poll.": "Deze optie staat niet in de poll.",
		"The poll timer was turned off.": "De polltimer is uitgezet.",
		"The queued poll was started.": "De poll uit de wachtrij is gestart.",
		"The poll timer was turned on: the poll will end in ${timeout} minute(s).": "De polltimer is aangezet: de poll zal over ${timeout} minuten eindigen.",
		"The poll timer was set to ${timeout} minute(s) by ${user.name}.": "${user.name} heeft de polltimer op ${timeout} minuten gezet.",
		"The poll timer is on and will end in ${poll.timeoutMins} minute(s).": "De polltimer staat aan en de poll zal over ${poll.timeoutMins} minuten eindigen.",
		"The poll timer is off.": "De polltimer staat uit.",
		"The poll was ended by ${user.name}.": "${user.name} heeft de poll beëindigd.",
		"Queued polls:": "Polls in de wachtrij:",
		"Refresh": "Vernieuwen",
		"No polls queued.": "Geen polls in de wachtrij.",
		"#${number} in queue": "Plaats ${number} in de wachtrij.",
	},
};
