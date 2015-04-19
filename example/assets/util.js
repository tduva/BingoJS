function parseHash() {
	var hash = document.location.hash.substr(1);
	if (hash.length == 0) {
		return {};
	}
	var parts = hash.split("&");
	var result = {};
	for (var i=0; i<parts.length; i++) {
		var paramParts = parts[i].split("=");
		var key = paramParts[0];
		var value = paramParts[1];
		if (value == "1") {
			value = true;
		} else if (value == "0") {
			value = false;
		}
		result[key] = value;
	}
	return result;
}

function updateHash(data) {
	var hash = "";
	var sep = "";
	for (var key in data) {
		console.log(key);
		if (!data.hasOwnProperty(key)) {
			continue;
		}
		var value = data[key];
		if (value == true) {
			value = 1;
		} else if (value == false) {
			value = 0;
		}
		hash += sep+key+"="+value;
		sep = "&";
	}
	document.location.hash = hash;
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
