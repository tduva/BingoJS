# BingoJS

Bingo sheet entirely rendered using JavaScript, with the following goals:

* Ability to open and use it locally in your browser, without a webserver.
* Change the state for each player using the mouse and shortcuts (no drawing on an image).
* Adjust number of player/playernames and goals via config file.
* Each card has the state for each player at the same relative position, so if you can't tell
  the colors apart that well you can still tell it apart from that.

Advanced:

* Share your current state with others (requires webserver with PHP).

## Getting started

### Files

* `bingosheet.html`: The actual sheet you open in your browser (you can rename this).
* `config.js`: Change basic settings here (enter goals, players and more).
* `bingo_save_state.php`: The PHP file that writes the state into a file so others viewing the
   same sheet can download it (only required if you have a webserver and want to share the state).
* `assets/jquery-*.js`: jQuery library providing some functions used.
* `assets/main.js`: The main behind-the-scenes logic for building the bingo sheet (you normally
   shouldn't need to change this, but feel free to tinker with it if you know what you're doing).
* `style.css`: The style for the sheet, you can change this if you know CSS and need to adjust the
   style (some styles are generated dynamically in addition to this).
* `util.js`: Some general utility functions.
* Some image files

### Basic Usage

* Put all files in a folder.
* Edit the `config.js` with the settings, goals/description, the players and colors (the file
  contains comments and example data that should make clear how it works).
* Open the `bingosheet.html` in your browser.

#### Notes

* The Bingo state (which goal has which marker for which player) is saved to HTML5 local storage
  every few seconds so reloading the page should restore the state (although closing the Browser
  doesn't retain the data in all Browsers if you use the `file://` protocol instead of having it
  on a webserver).

### Sharing State

If you want others to see the same state as you edit (which player finished which goal etc.), you
have to put the sheet on a webserver. Since JavaScript runs locally and can't save a file on the
webserver that others can then download, this needs a serverside component in form of the PHP
script. The bingosheet sends a POST request to the PHP script with the current state, which then
saves it to a file (if the correct edit key is provided of course).

* Put all files on a webserver.
* Edit the `bingo_save_state.php`:
  * Change the `edit_key` variable to a secure key (this is the password for saving the data).
  * *Optional:* Change the name of the file to save to.
* Edit the `config.js`:
  * For the sheet to *edit* with: Make sure the `editUrl` option points to the PHP file (if this
    is empty the save form won't even show up on the sheet).
  * For the sheet to *view* with: Make sure the `updateUrl` option points to the correct file.
* Open the bingosheet in edit mode by appending the appropriate parameter to it:
  `..bingosheet.html#mode=editserver` (if you don't do this the save form won't show up).
* Then, as the person to edit, enter the edit key you edited into the PHP file into the textfield
  and click on `Set edit key`, which should give you a response as to whether the key is correct.
  * If the key was correct, you can then manually or automatically save the state into the file
    via the PHP file and others having the sheet open can automatically load the state from it
    (local changes are overwritten when updated from the server).
* Make sure only one person is saving the state to the server at the time, because the state for
  the whole sheet is always completely overwritten, so it doesn't make much sense to fight over
  whose state actually appears.

## Parameters

You can append several parameters to the bingo sheet when opening it in your browser to change
some settings. All parameters have to be specified as hash parameters because they are designed to
be accessed from JavaScript, for example: `bingosheet.html#mode=view&autoupdate=0`.

* `mode=<mode>`: The mode of the sheet, which sets some basic settings. The default mode for the
  sheet (what it should be without specifiying a parameter) can be changed in the `config.js`.
  * `minimal`: Only the table, with auto-update, local editing disabled.
  * `view`: Table and update-controls, auto-update by default, local editing disabled.
  * `default`: Like view, but you can edit the table locally, auto-update off by default.
  * `editserver`: Like default, but includes the form to enter the edit key to enable server
    write access.
* `autoupdate=1`: Force auto loading the state from the server to on (1) or off (0).
* `playersinfo=0`: Show (1) or hide (0) the player info (list of players below the sheet).

When you edit a parameter in your browser address bar while already having the page loaded you may
have to reload the page (F5) for them to take effect.
