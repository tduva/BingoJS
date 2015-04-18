<?php

$edit_key = "abcde";
$file = "bingostate";

print_r($_POST);

if (isset($_GET["edit_key"]) && $_GET["edit_key"] == $edit_key) {
	// Can do edit stuff
	if (isset($_GET["id"]) && isset($_GET["state"])) {
		set($file, $_GET["id"],$_GET["state"]);
		echo "Edited file ".$file;
	} else if (isset($_POST["states"])) {
		file_put_contents($file, $_POST["states"]);
	} else {
		echo "Invalid parameters";
	}
} else {
	httpStatus(401);
	echo "401 Unauthorized";
}

function httpStatus($code) {
	header('X-PHP-Response-Code: '.$code, true, $code);
}

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
