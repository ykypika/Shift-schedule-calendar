import days from "./days-data.js"

const morningDay = days.find(day => day.graphicType === "cal-mdg");
const nightDay = days.find(day => day.graphicType === "cal-ndg");
const dayOff = days.find(day => day.graphicType === "day-off");
const morning8hDay = days.find(day => day.graphicType === "cal-8h-mdg");
const dayOff8h = days.find(day => day.graphicType === "day-off-8h");

const patterns = {
	"3md-3do": [[morningDay, 3], [dayOff, 3]],
	"3md-3do-3nd-3do": [[morningDay, 3], [dayOff, 3], [nightDay, 3], [dayOff, 3]],
	"5md8h-2do8h":  [[morning8hDay, 5], [dayOff8h, 2]],
};

const graphics = {
	"14.1": {
		descr: "График 14 смена 1",
		startDate: "2000/01/04",
		pattern: patterns["3md-3do"],
	},
	"14.2": {
		descr: "График 14 смена 2",
		startDate: "2000/01/07",
		pattern: patterns["3md-3do"],
	},
	"16.1-1": {
		descr: "График 16 смена 1-1",
		startDate: "2000/01/10",
		pattern: patterns["3md-3do-3nd-3do"],
	},
	"16.1-2": {
		descr: "График 16 смена 1-2",
		startDate: "2000/01/04",
		pattern: patterns["3md-3do-3nd-3do"],
	},
	"16.2-1": {
		descr: "График 16 смена 2-1",
		startDate: "2000/01/01",
		pattern: patterns["3md-3do-3nd-3do"],
	},
	"16.2-2": {
		descr: "График 16 смена 2-2",
		startDate: "2000/01/07",
		pattern: patterns["3md-3do-3nd-3do"],
	},
	"5/2": {
		descr: "График 5/2",
		startDate: "2000/01/03",
		pattern: patterns["5md8h-2do8h"],
	},
};

export default graphics;
