<?php

/**
 * The edit key has to be send as the URL parameter "edit_key" to save anything.
 *
 * If this is empty, then this script is basicially disabled because no requests
 * will be authorized.
 */
$edit_key = "";

/**
 * The name of the file to save the data info
 */
$file = "bingostate";

if (strlen($edit_key) > 0 && isset($_GET["edit_key"]) && $_GET["edit_key"] == $edit_key) {
	// Can do edit stuff
	if (isset($_GET["id"]) && isset($_GET["state"])) {
		// Edit a single field
		// Not used right now
		//set($file, $_GET["id"],$_GET["state"]);
		//echo "Edited file ".$file;
	} else if (isset($_POST["states"])) {
		// Write all states into file
		$data = $_POST["states"];

		// Check if actually JSON and not too long (just in case)
		if (json_decode($data) == NULL || strlen($data) > 1024*10) {
			echo "Invalid data supplied.";
			httpStatus(400);
		} else {
			file_put_contents($file, $data, LOCK_EX);
			echo "Edited file '".$file."'";
		}
	} else {
		echo "Invalid parameters, but auth ok.";
	}
} else {
	httpStatus(401);
	echo "401 Unauthorized";
}

function httpStatus($code) {
	header('X-PHP-Response-Code: '.$code, true, $code);
}

/*
 * Not used right now
 */
function set($file, $id, $state) {
	$f = fopen($file, "a+");
	
	if (flock($f, LOCK_EX)) {
		$currentSize = filesize($file);
		$current = "";
		if ($currentSize > 0) {
			$current = fread($f, $currentSize);
		}
		$result = addToJson($current, $id, $state);
		ftruncate($f, 0);
		rewind($f);
		fwrite($f, $result);
		fflush($f);
		flock($f, LOCK_UN);
	} else {
		echo "Error: Couldn't acquire lock.";
	}
	fclose($f);
}

function addToJson($json, $id, $state) {
	$decoded = json_decode($json, true);
	$decoded[$id] = $state;
	return json_encode($decoded);
}

?>
