
function init() {
	$("label[for='autoUpdate']").text("Auto-update ("+meta.updateInterval+"s)");
	buildTable();
	parameters = parseHash();
	loadSettings();
	buildCSS();
	addListeners();
	startCheckForChangesTimer();
	startAutoUpdate();
	loadFromStorage();
	if (settings.autoUpdate) {
		getFromServer();
		if (meta.done) {
			settings.autoUpdate = false;
			settings.updateSettings = false;
		}
	}
	initStuff();
	document.title = meta.title+" - BingoJS";
	if (meta.done) {
		document.title = "[Done] "+document.title;
	}
	$.ajaxSetup({cache:false});
	buildInfo();
}

function loadSettings() {
	settings.mode = meta.defaultMode;
	if (parameters.mode != undefined) {
		settings.mode = parameters.mode;
	}

	initMode();

	// Parameters override mode settings
	if (parameters["autoupdate"] != undefined) {
		settings.autoUpdate = parameters["autoupdate"];
	}
	if (parameters["playersinfo"] != undefined) {
		settings.playersInfo = parameters["playersinfo"];
	}
	
	if (!isUpdateAvailable()) {
		settings.autoUpdate = false;
		settings.updateSettings = false;
	}
	if (!isEditingAvailable()) {
		settings.editServer = false;
	}
}

function initMode() {
	// Default
	settings.autoUpdate = false;
	settings.editServer = false;
	settings.edit = true;
	settings.playersInfo = true;
	settings.updateSettings = true;
	settings.serverAutoSave = false;

	// Other
	if (settings.mode == "minimal") {
		settings.autoUpdate = true;
		settings.edit = false;
		settings.updateSettings = false;
		settings.playersInfo = false;
	} else if (settings.mode == "view") {
		settings.autoUpdate = true;
		settings.editServer = false;
		settings.edit = false;
		settings.updateSettings = true;
		settings.playersInfo = true;
	} else if (settings.mode == "editserver") {
		settings.autoUpdate = false;
		settings.editServer = true;
		settings.edit = true;
		settings.updateSettings = true;
		settings.playersInfo = true;
	}
}

function initStuff() {
	setVisible("#localEditBox", settings.edit);
	setVisible(".localEditInfo", settings.edit);
	if (settings.edit) {
		addEditListeners();
	}
	setVisible("#editServerBox", settings.editServer);
	setVisible("#updateSettingsBox", settings.updateSettings);
	$("#autoUpdate").prop("checked", settings.autoUpdate);
	$("#serverAutoSave").prop("checked", settings.serverAutoSave);
	setVisible("#playersInfo", settings.playersInfo);

	if (parameters.nomargin) {
		minCSS();
	}
	if (settings.mode == "minimal") {
		setVisible("#more", false);
	}
}

function setVisible(selector, visible) {
	if (visible) {
		$(selector).show();
	} else {
		$(selector).hide();
	}
}

function setAutoUpdate(enabled) {
	hashSet("autoupdate", enabled);
	settings.autoUpdate = enabled;
}

function setServerAutoSave(enabled) {
	settings.serverAutoSave = enabled;
}

parameters = {};
settings = {};

function hashSet(key, value) {
	parameters[key] = value;
	updateHash(parameters);
}

function hashContains(value) {
	var hash = document.location.hash.substr(1);
	var hashParts = hash.split(",");
	return $.inArray(value, hashParts) != -1;
}

function setInHash(value, included) {
	var hash = document.location.hash.substr(1);
	var hashParts = hash.split(",");
	if (hash.length == 0) {
		hashParts = [];
	}
	var index = $.inArray(value, hashParts);
	console.log(index+" "+included);
	if (included) {
		if (index == -1) {
			hashParts[hashParts.length] = value;
		}
	} else {
		hashParts.splice(index, 1);
	}
	document.location.hash = hashParts.join();
}

boxStates = {};
shouldSave = false; // Set to true if a box state has changed
maxId = 0;
hoveredBoxId = null;
hoveredCardId = null;

editKey = "";
editAccess = false;

function startCheckForChangesTimer() {
	setInterval(function() {
		checkForChanges();
	}, 3*1000);
}

/**
 * Runs on a timer to check if something changed an the
 * appropriate actions taken.
 */
function checkForChanges() {
	if (!shouldSave) {
		return;
	}
	saveToStorage();
	buildInfo();
	shouldSave = false;
	if (settings.serverAutoSave) {
		saveToServer();
	}
}

function startAutoUpdate() {
	var interval = meta.updateInterval;
	if (interval == undefined || interval == null || interval < 5) {
		return;
	}
	setInterval(function() {
		autoUpdate();
	}, interval*1000);
}

/*
function pushToServer(id, state) {
	var url = meta.editUrl;
	if (url != undefined && url != null) {
		url = url+"?edit_key="+editKey+"&id="+id+"&state="+state;
		$.get(url);
	}
}
*/

function saveToServer() {
	if (editAccess && isEditingAvailable()) {
		setMessage("saving", "Saving..", false);
		var json = JSON.stringify(boxStates);
		var url = meta.editUrl+"?edit_key="+editKey;
		$.post(url, {states: json})
			.done(function(data) {
				console.log("Response: "+data);
				setMessage("saving", "Saved..", true);
			})
			.fail(function(a, b, c) {
				console.log("Response: "+c);
				setMessage("saving", "Saving failed: "+b+" ("+c+")", false, true);	
			});
	} else {
		setEditAccessEnabled(false);
	}
}

function setEditAccessEnabled(enabled) {
	editAccess = enabled;
	if (enabled) {
		$("#editFunctions").fadeIn(1000);
	} else {
		$("#editFunctions").fadeOut(2000);
	}
}

function isUpdateAvailable() {
	return meta.updateUrl != undefined && meta.updateUrl != null && !meta.noUpdate;
}

function isEditingAvailable() {
	return meta.editUrl != undefined && meta.editUrl != null;
}

function checkAccess() {
	if (isEditingAvailable()) {
		if (editKey.length == 0) {
			setError("accessInfo", "Error: No edit key entered");
			return;
		}
		setMessage("accessInfo", "Checking access..");
		var url = meta.editUrl+"?edit_key="+editKey;
		$.get(url)
			.done(function() {
				setEditAccessEnabled(true);
				setMessage("accessInfo", "Access granted.", true);
			})
			.fail(function(r, b, data) {
				if (r.status == 401) {
					setEditAccessEnabled(false);
					setMessage("accessInfo", "Access denied.", false, true);
				} else {
					setMessage("accessInfo", "An error occured", false, true);
				}
				console.log("Response: "+data);	
			});
	}
}

function setEditKey() {
	editKey = $("#editKey").val();
	checkAccess();
}

function autoUpdate() {
	if (settings.autoUpdate) {
		getFromServer();
	}
}

function getFromServer() {
	if (isUpdateAvailable()) {
		setMessage("updating", "Updating..");
		$.get(meta.updateUrl, null, null, "text")
			.done(function(data) {
				if (loadFromJson(data)) {
					setMessage("updating", "Updated..", true);
				} else {
					setError("updating", "Error parsing response.");
				}
			})
			.fail(function(abc, d, e) {
				setMessage("updating", "Failed updating: "+d+" ("+e+")", false, true);
			});
	}
}

/**
 * Saves the current box states into HTML5 local storage.
 */
function saveToStorage() {
	var storageKey = "bingojs.state."+meta.id;
	var dataToStore = JSON.stringify(boxStates);
	if (dataToStore == "{}") {
		console.log("Deleting storage (empty).");
		delete localStorage[storageKey];
	} else {
		console.log("Saving to storage");
		localStorage[storageKey] = dataToStore;
	}
}



function loadFromStorage() {
	console.log("Loading from storage");
	var dataFromStore = localStorage["bingojs.state."+meta.id];
	if (dataFromStore == undefined || dataFromStore == null) {
		console.log("No data in storage.");
		return;
	}
	loadFromJson(dataFromStore);
	console.log("Done loading from storage");
}

function loadFromJson(data) {
	var loadedBoxStates;
	try {
		loadedBoxStates = JSON.parse(data);
	} catch (err) {
		console.log("Error parsing JSON: "+err.message);
		return false;
	}
	for (var card=0;card<=maxId;card++) {
		for (var player=0;player<players.length;player++) {
			var id = card+"-"+player;
			if (loadedBoxStates[id] != undefined) {
				setState(id, loadedBoxStates[id]);
			} else {
				setState(id, "none");
			}
		}
	}
	return true;
}

/**
 * Sets the message of the given type, fading it.
 *
 * @param type The type of the message (element id)
 * @param message The actual message
 * @param fadeOut Whether to fade out after setting the message
 * @param timestamp Whether to prepend the message with a timestamp
 */
function setMessage(type, message, fadeOut, timestamp) {
	var elem = $("#"+type);
	if (timestamp) {
		message = "["+getCurrentTime()+"] "+message;
	}
	elem.text(message);
	if (fadeOut) {
		elem.fadeOut(4000);
		
	} else {
		elem.fadeIn(1000);
	}
}

/**
 * Sets an error message for the given type. An error message doesn't
 * fade out and has a timestamp.
 *
 * @param type The type of the message (element id)
 */
function setError(type, message) {
	setMessage(type, message, false, true);
}

function buildTable() {
	var html = '<table>';
	var id = 0;
	for (var row=0;row<data.length;row++) {
		html += '<tr>';
		for (var column=0;column<data[row].length;column++) {
			var cellData = data[row][column];
			html += '<td class="card" id="card'+id+'">';
			html += '<div class="boxes">';
			for (var i=0;i<players.length;i++) {
				var color = playerColors[i];
				var lightColorClass = "";
				if ($.inArray(color, lightColors) != -1) {
					lightColorClass = "lightcolor";
				}
				html += '<div title="'+players[i]+'" class="box '+lightColorClass+' p'+i+'" id="box'+id+'-'+i+'"></div>';
				
			}
			html += '</div>';
			var info = "";
			if (cellData.info != null && cellData.info.length > 0) {
				var infoSize = '';
				if (cellData.infoSize != null) {
					infoSize = ' style="font-size:'+cellData.infoSize+'"';
				}
				info = '<br /><span class="info"'+infoSize+'>('+cellData.info+')</span>';
			}
			html += '<div class="content">'+cellData.name+info+'</div>';
			html += '</td>';
			id++;
		}
		html += '</tr>';
	}
	maxId = id-1;
	html += '</table>';
	$('#bingoTable').append($(html));
}

function buildCSS() {
	var height = 100 / players.length;
	var css = '.box { height: '+height+'%;  }';
	for (var i=0;i<players.length;i++) {
		var color = playerColors[i];
		css += '.p'+i+' { top: '+(height*i)+'%; }';
		css += '.p'+i+':hover { background-color: '+color+'; }';
		css += '.p'+i+'.color { background-color: '+color+'; }';
	}
	$("<style>").prop("type", "text/css").html(css).appendTo("head");
}

function minCSS() {
	$("<style>").prop("type", "text/css").html("body { margin:0 }").appendTo("head");
}

function buildInfo() {
	var html = "<p>";
	var doneCount = {};
	for (var key in boxStates) {
		if (!boxStates.hasOwnProperty(key)) {
			continue;
		}
		var value = boxStates[key];
		var player = Number(key.split("-")[1]);
		if (value == "done") {
			if (doneCount[player] == undefined) {
				doneCount[player] = 1;
			} else {
				doneCount[player] += 1;
			}
		}
	}
	for (var i=0;i<players.length;i++) {
		var numDone = doneCount[i];
		if (numDone == undefined) {
			numDone = 0;
		}
		html += '<span style="background-color:'+playerColors[i]+'">&nbsp;&nbsp;&nbsp;</span> '+players[i]+" ("+numDone+')&nbsp;&nbsp;';
	}
	html += '</p>';
	html += '';
	$('#playersInfo').html($(html));
}



function getState(elem) {
	if (elem.hasClass("done")) {
			return "done";
		}
		else if (elem.hasClass("cantDo")) {
			return "cantDo";
		}
		else if (elem.hasClass("doing")) {
			return "doing";
		}
		else {
			return "none";
		}
}

function clearAll() {
	if (confirm("Reset all card states?")) {
		setStateForAll("none");
	}
}

function setStateForAll(state) {
	for (var i=0;i<=maxId;i++) {
		setStateForAllOnCard(i, state);
	}
}

function setStateForAllOnCard(cardId, state) {
	for (var player=0;player<players.length;player++) {
		setState(cardId+'-'+player,state);
	}
}

function getCardId(elem) {
	return elem.attr("id").substring(4);
}

function getBoxId(elem) {
	return elem.attr("id").substring(3);
}

function setState(boxId, state) {
	var elem = $("#box"+boxId);
	if (getState(elem) == state) {
		return;
	}
	elem.removeClass("done");
	elem.removeClass("doing");
	elem.removeClass("cantDo");
	elem.removeClass("color");
	if (state != "none") {
		elem.addClass("color");
	}
	if (state == "doing") {
		elem.addClass("doing");
	}
	else if (state == "done") {
		elem.addClass("done");
	}
	else if (state == "cantDo") {
		elem.addClass("cantDo");
	}
	if (state == "none") {
		boxStates[boxId] = undefined;
	}
	else {
		boxStates[boxId] = state;
	}
	shouldSave = true;
	//pushToServer(boxId, state);
}

function addEditListeners() {
	$(".boxes div").click(function(event) {
		var elem = $(this);
		var boxId = getBoxId(elem);
		if (elem.hasClass("done")) {
			setState(boxId, "none");
		}
		else if (elem.hasClass("cantDo")) {
			setState(boxId, "done");
		}
		else if (elem.hasClass("doing")) {
			setState(boxId, "cantDo");
		}
		else {
			setState(boxId, "doing");
		}
	});

	$(".boxes div").hover(
		function() {
			hoveredBoxId = getBoxId($(this));
		}, function() {
			hoveredBoxId = null;
		}
	);
	$("td.card").hover(
		function() {
			hoveredCardId = getCardId($(this));
		}, function() {
			hoveredCardId = null;
		}
	);
}

function addListeners() {
	$("#autoUpdate").change(function(event) {
		setAutoUpdate(this.checked);
	});
	$("#serverAutoSave").change(function(event) {
		setServerAutoSave(this.checked);
	});
}

window.addEventListener("keydown", checkKeyPressed, false);

function checkKeyPressed(e) {
	if (hoveredBoxId != null) {
		keyBoxAction(e.keyCode);
	} else if (hoveredCardId != null) {
		keyCardAction(e.keyCode);
	}
}

function keyBoxAction(keyCode) {
	if (keyCode == 67 || keyCode == 83) { // c or s
		setState(hoveredBoxId, "none");
	} else if (keyCode == 88 || keyCode == 65) { // x or a
		setState(hoveredBoxId, "cantDo");
	} else if (keyCode == 68) { // d
		setState(hoveredBoxId, "done");
	} else if (keyCode == 69 || keyCode == 87) { // e or w
		setState(hoveredBoxId, "doing");
	}
}

function keyCardAction(keyCode) {
	if (keyCode == "67") { // c
		setStateForAllOnCard(hoveredCardId, "none");
	}
}
