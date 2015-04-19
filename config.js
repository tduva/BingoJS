var meta = {

	// The id is used for saving to local storage
	id: "test",

	// The title of the sheet
	title: "Test Bingo Sheet",

	/**
	 * The default mode to set the sheet to if no mode is specified via URL (hash)
	 * parameters:
	 *
	 * minimal: Only the table, with auto-update, local editing disabled
	 * view: Table and update-controls, auto-update by default, local editing disabled
	 * default: Like view, but you can edit the table locally, auto-update off by default
	 * editserver: Like default, but includes the form to enter the edit key to enable server write access
	 */
	defaultMode: "default",

	/**
	 * The file that should receive the bingo state to save it. The sate
	 * is send in a POST request.
	 */
	editUrl: "bingo_save_state.php",

	/**
	 * The file to update the bingo state from. If you leave this empty
	 * the update function is disabled.
	 */
	updateUrl: "bingostate",

	// How often to update state from server if auto-update is enabled (seconds)
	updateInterval: 60,

	/**
	 * If set to true, then state is only loaded from server once on load (if enabled),
	 * and the title gets [Done] added to it.
	 */
	done: false,

	/**
	 * Set this to true to disable updating state from server altogether.
	 */
	noUpdate: false
}

/**
 * Defines the data for the sheets.
 *
 * The order of this matters for the saved state, so it shouldn't be changed once the sheet
 * is in use (changing text in place is ok of course).
 *
 * This should be pretty self-explanatory.
 *
 * You can use the "infoSize" property to set a different size for the info text (usually the
 * text explaining the goal a bit further) in case it doesn't fit onto the card.
 *
 * Example:
 * {name:"Yes Fancy Crap", info:"2 USJ after picking up everyone on Salvatore's Called A Meeting", infoSize:"10"}
 */
var data = [
	[
		{name:"Special Delivery", info:"Beat Kingdom Come"},
		{name:"Rhino Saver", info:"Put a Rhino in a garage"},
		{name:"Dodo Master", info:"Fly Dodo for 300s"},
		{name:"Yes Fancy Crap", info:"2 USJ after picking up everyone on Salvatore's Called A Meeting", infoSize:"10"},
		{name:"15 Taxi Fares", info:""}
	],
	[
		{name:"I Hate Gravity", info:"kill yourself from a skyscraper in Staunton"},
		{name:"Worthless Money", info:"get $10,000,000"},
		{name:"Firetruck vs Police", info:"smash into 16 police cars head-on with a firetruck"},
		{name:"No OP Guns", info:"no AK-47 or M16"},
		{name:"Revenge", info:"kill Catalina on The Exchange, credits not required"}
	],
	[
		{name:"Securicar Garage", info:"bring at least one securicar to the garage at the portland docks"},
		{name:"Bribe away 9 Stars", info:""},
		{name:"Multistory Mayem", info:""},
		{name:"OOB Dodo Flight", info:""},
		{name:"Beat A Drop in the Ocean with the cinematic cam", info:""}
	],
	[
		{name:"40 Packages", info:""},
		{name:"Dodo Bait", info:""},
		{name:"Flying Tank", info:"do a USJ while firing backwards in a tank"},
		{name:"12 Rampages", info:""},
		{name:"Finish 4 RC Toyz", info:""}
	],
	[
		{name:"Fly Misty For Me", info:"during Drive Misty For Me, fly Misty around the three islands and finish the mission in a Dodo"},
		{name:"Hike from Phil's Place to Donald Love", info:"no running only walk"},
		{name:"No Replays!", info:""},
		{name:"9 Unique Stunt Jumps", info:""},
		{name:"Get Laid", info:""}
	]
];

/**
 * Define the playernames. The order of these shouldn't be changed once
 * the sheet is in use and state is saved.
 */
var players = [
	"MrNojojojo", "Mhmd_FVC", "Overcooler_", "Menno888"
];

/**
 * The color for the players, based on the order the players are defined
 * in. These can be changed at any time.
 */
var playerColors = [
	"green", "blue", "#EEEE00", "red"
];

/**
 * Tells the script which colors should be considered "light" colors, which
 * means they get a black checkmark/cross instead of a white one for better
 * visibility.
 */
var lightColors = [
	"yellow", "gold", "#EEEE00"
];
