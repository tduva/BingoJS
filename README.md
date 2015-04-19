# BingoJS

Bingo sheet that is created by JavaScript, so it can be used offline.
You can cycle through different states (doing/cant do/done) for each player and goal using the mouse.

## Get started

* Put all the files in a folder
* Edit the `data.js` to define some settings, the cards (goals/description), the players and playercolors
* Open the `bingosheet.html` in your browser
* If you want to have the state of the sheet be accessible by others, put all the files on a webserver, set an edit key in the `bingo.php` and enter that key into the correct form on `bingosheet.html#mode=editserver` (as the person wanting to edit the sheet for others of course, don't make the edit key public). Make sure the file that the `bingo.php` writes to and the file that is defined to update from in the `data.js` match.
  * Use the appropriate save to server functions to push your current state of the sheet to the `bingo.php` so it gets saved to the file and others can update their sheet from it.

## How this works

* You define the goals and players in the `data.js` from which JavaScript builds the table with listeners that react on mouseclicks/keys to change the state of the player's boxes for each goal.
* The Bingo state (which goal has which marker for which player) is saved to HTML5 local storage every few seconds so
reloading the page should restore the state (although closing the Browser doesn't retain the data in all Browsers if you use the `file://` protocol instead of having it on a webserver).
* In addition, the state can also be loaded from a file, so you can put the Bingo on a server and have others view the updated state. Local changes to the state will be overwriten when it is updated from the server.
  * For that purpose, the included `bingo.php` script accepts a POST request from the `bingosheet.html` with the state and saves it to a file (if the correct edit key is provided of course).
