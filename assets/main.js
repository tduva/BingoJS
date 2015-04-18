
function init() {
	buildTable();
	buildCSS();
	addListeners();
	startSaving();
	startAutoUpdate();
	loadFromStorage();
	if (isUpdateEnabled()) {
		getFromServer();
	}
	document.title = meta.title+" - BingoJS";
	setEditKey();
	hideUpdateFunctionsIfDisabled();
}

boxStates = {};
shouldSave = false;
maxId = 0;
hoveredBoxId = null;
hoveredCardId = null;

editKey = "";
editAccess = false;

function startSaving() {
	setInterval(function() {
		saveToStorage();
	}, 5*1000);
}

function startAutoUpdate() {
	if (meta.updateInveral == undefined) {
		return;
	}
	var interval = meta.updateInterval;
	if (inverval == null || interval < 5) {
		return;
	}
	setInterval(function() {
		autoUpdate();
	}, interval*1000);
}

function pushToServer(id, state) {
	var url = meta.editUrl;
	if (url != undefined && url != null) {
		url = url+"?edit_key="+editKey+"&id="+id+"&state="+state;
		$.get(url);
	}
}

function saveToServer() {
	if (editAccess && meta.editUrl != undefined && meta.editUrl != null) {
		setMessage("saving", "Saving..", false);
		var json = JSON.stringify(boxStates);
		var url = meta.editUrl+"?edit_key="+editKey;
		$.post(url, {states: json})
			.done(function(data) {
				console.log("Response: "+data);
				setMessage("saving", "Saved..", true);
			})
			.fail(function(a, b, c) {
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

function isUpdateEnabled() {
	return meta.updateUrl != undefined && meta.updateUrl != null && !meta.noUpdate;
}

function hideUpdateFunctionsIfDisabled() {
	if (!isUpdateEnabled()) {
		$("#updateFunctions").hide();
	}
}

function checkAccess() {
	if (meta.editUrl != undefined && meta.editUrl != null) {
		var url = meta.editUrl+"?edit_key="+editKey;
		$.get(url)
			.done(function() {
				setEditAccessEnabled(true);
			})
			.fail(function(r) {
				if (r.status == 401) {
					setEditAccessEnabled(false);
				}
				console.log("Response: "+r);	
			});
	}
}

function setEditKey() {
	editKey = $("#editKey").val();
	checkAccess();
}

function autoUpdate() {
	if (isEnabled("autoUpdate")) {
		getFromServer();
	}
}

function getFromServer() {
	if (meta.updateUrl != undefined && meta.updateUrl != null) {
		setMessage("updating", "Updating..");
		$.get(meta.updateUrl)
			.done(function(data) {
				loadFromJson(data);	
				setMessage("updating", "Updated..", true);
			})
			.fail(function(abc, d, e) {
				setMessage("updating", "Failed updating: "+d+" ("+e+")", false, true);
			});
	}
}

function isEnabled(type) {
	return $("#"+type).prop("checked");
}

function saveToStorage() {
	if (!shouldSave) {
		return;
	}
	var storageKey = "bingojs.state."+meta.id;
	var dataToStore = JSON.stringify(boxStates);
	if (dataToStore == "{}") {
		console.log("Deleting storage (empty).");
		delete localStorage[storageKey];
	} else {
		console.log("Saving to storage");
		localStorage[storageKey] = dataToStore;
	}
	shouldSave = false;
	if (isEnabled("autoSave")) {
		saveToServer();
		
	}
}

function showSavingMessage() {
	$("#saving").fadeIn(1000, function() {
		$("#saving").fadeOut(4000);
	});
}

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

function getCurrentTime() {
	var now = new Date(Date.now());
	var hours = prependZero(now.getHours());
	var minutes = prependZero(now.getMinutes());
	var seconds = prependZero(now.getSeconds());
	return hours + ":" + minutes + ":" + seconds;
}

function prependZero(input) {
	if (input < 10 || input.length < 2) {
		return "0"+input;
	}
	return input;
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
	//setStateForAll("none");
	var loadedBoxStates = JSON.parse(data);
	for (var card=0;card<maxId;card++) {
		for (var player=0;player<players.length;player++) {
			var id = card+"-"+player;
			if (loadedBoxStates[id] != undefined) {
				setState(id, loadedBoxStates[id]);
			} else {
				setState(id, "none");
			}
		}
	}
	/*
	for (var key in loadedBoxStates) {
		setState(key, loadedBoxStates[key]);
	}*/
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
				html += '<div title="'+players[i]+'" class="bg '+lightColorClass+' p'+i+'" id="box'+id+'-'+i+'"></div>';
				
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
	var css = '.bg { height: '+height+'%; width: 16px; }';
	for (var i=0;i<players.length;i++) {
		var color = playerColors[i];
		css += '.p'+i+' { top: '+(height*i)+'%; }';
		css += '.p'+i+':hover { background-color: '+color+'; }';
		css += '.p'+i+'.color { background-color: '+color+'; }';
	}
	$("<style>").prop("type", "text/css").html(css).appendTo("head");
}

function addListeners() {
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
		console.log("clearAll");
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

function adjustText() {
$('.content').textfill({
					success: function() {
						console.log("yay!")
					},
					minFontPixels: 4,
					maxFontPixels: 14
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
