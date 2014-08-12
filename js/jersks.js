/**
 * Jersks game controller file
 * 2/25/14 Mojiferous
 */

var mainMap; //< phaser tilemap object
var mainLayer; //< phaser layer object for the overview map

var player;
var enemies = [];
var maxEnemies = 6;

var playerShot = [];
var enemyShot = [];
var defaultShotDamage = 50;

var playerCommands;
var enemyCommands = [];
var commandNum = 0;
var maxTurns = 6;
var enemyPos = [];

var tileSize = 30;
var mapSize = 20;

var level = 0;
var levelMaps = [];
var playerMapX = 0;
var playerMapY = 0;

var game;

window.onload = function() {

  $('#submit_moves').click(function() {
    //handle clicks on the submit moves button
    resetCommands();
    if($('#left_fire1').is(':checked')) {
      playerCommands[0].fireLeft = 1;
    }
    if($('#left_fire2').is(':checked')) {
      playerCommands[1].fireLeft = 1;
    }
    if($('#left_fire3').is(':checked')) {
      playerCommands[2].fireLeft = 1;
    }
    if($('#right_fire1').is(':checked')) {
      playerCommands[0].fireRight = 1;
    }
    if($('#right_fire2').is(':checked')) {
      playerCommands[1].fireRight = 1;
    }
    if($('#right_fire3').is(':checked')) {
      playerCommands[2].fireRight = 1;
    }
    playerCommands[0].move = $("input[name='move1']:checked").val();
    playerCommands[1].move = $("input[name='move2']:checked").val();
    playerCommands[2].move = $("input[name='move3']:checked").val();

    commandNum = 0;

    handleCommand();

    //reset the radio buttons
    $("input[type='radio']").prop('checked', false);
    $("input[type='checkbox']").prop('checked', false);

  });

  game = new Phaser.Game(600, 600, Phaser.AUTO, 'jersks-game', { preload: preload, create: create, update: update });

};

/**
 * preload phaser
 */
function preload () {

  game.load.tilemap('map', 'assets/jersks.csv', null, Phaser.Tilemap.CSV);
  game.load.image('overview_background', 'assets/maptiles.png');
  game.load.image('player_sprite', 'assets/player.png');
  game.load.image('enemy_sprite', 'assets/enemy.png');
  game.load.image('shot', 'assets/shot.png');

}

/**
 * called on instantiation of phaser object
 */
function create () {

  game.stage.backgroundColor = '#000000';

  mainMap = game.add.tilemap('map', tileSize, tileSize);

  mainMap.addTilesetImage('overview_background');

  mainLayer = mainMap.createLayer(0);
  mainLayer.resizeWorld();

  for(var n=0; n<maxTurns; n++) {
    playerShot[n] = game.add.sprite(-50, -50, 'shot');
    game.physics.enable(playerShot[n], Phaser.Physics.ARCADE);
  }
  for(var r=0; r<(maxEnemies*maxTurns); r++) {
    enemyShot[r] = game.add.sprite(-50, -50, 'shot');
    game.physics.enable(enemyShot[r], Phaser.Physics.ARCADE);
  }

  //add our default map
  addMapOfType([1,0,0,0]);
  placePlayer();
  initBoard();
}

/**
 * called on frame update from phaser
 */
function update() {

  for(var n=0; n<playerShot.length; n++) {

    //stop the player's shot if it exits the screen and is moving

    //check the velocity so we can easily check the x or y location
    if(playerShot[n].body.velocity.x  != 0) {
      if(playerShot[n].x < 0 || playerShot[n].x > 600) {
        stopShot(playerShot[n]);
      }
    }
    if(playerShot[n].body.velocity.y  != 0) {
      if(playerShot[n].y < 0 || playerShot[n].y > 600) {
        stopShot(playerShot[n]);
      }
    }

    for(var r=0; r<maxTurns; r++) {
      //collide player shots with enemies, triggering enemyHit
      game.physics.arcade.collide(playerShot[n], enemies[r], enemyHit);
    }

  }

  for(var t=0; t<enemyShot.length; t++) {

    //collide enemy shots with the player, triggering playerHit
    game.physics.arcade.collide(enemyShot[t], player, playerHit);
  }

}

/**
 * stop shot objects by setting their x and y positions off screen and setting their velocity to 0
 * @param shotVal
 */
function stopShot(shotVal) {
  shotVal.x = -50;
  shotVal.y = -50;
  shotVal.body.velocity.x = 0;
  shotVal.body.velocity.y = 0;
}

/**
 * handle commands passed, based on commandNum global variable
 * called from click of submit_moves button, from handleFire command if commandNum < max commands
 */
function handleCommand() {
  //add a tween for the player object, allowing us to manipulate the sprite
  var playerTween = game.add.tween(player);
  switch(playerCommands[commandNum].move) {
    case 'left':
      playerTween.to({angle: player.angle-90}, 500, Phaser.Easing.Linear.None, true);
      break;
    case 'forward':
      //get the player's current location
      var currentLocation = calculatePlayerLocation();

      switch (player.angle) {
        case 0:
          if(playerCanMoveToLocation(currentLocation.x, currentLocation.y-1)) {
            playerTween.to({y: player.y-30}, 500, Phaser.Easing.Linear.None, true);
          } else {
            playerTween.to({x: player.x}, 500, Phaser.Easing.Linear.None, true);
          }
          break;
        case 90:
          if(playerCanMoveToLocation(currentLocation.x+1, currentLocation.y)) {
            playerTween.to({x: player.x+30}, 500, Phaser.Easing.Linear.None, true);
          } else {
            playerTween.to({x: player.x}, 500, Phaser.Easing.Linear.None, true);
          }
          break;
        case -180:
          if(playerCanMoveToLocation(currentLocation.x, currentLocation.y+1)) {
            playerTween.to({y: player.y+30}, 500, Phaser.Easing.Linear.None, true);
          } else {
            playerTween.to({x: player.x}, 500, Phaser.Easing.Linear.None, true);
          }
          break;
        case -90:
          if(playerCanMoveToLocation(currentLocation.x-1, currentLocation.y)) {
            playerTween.to({x: player.x-30}, 500, Phaser.Easing.Linear.None, true);
          } else {
            playerTween.to({x: player.x}, 500, Phaser.Easing.Linear.None, true);
          }
          break;
      }
      break;
    case 'right':
      playerTween.to({angle: player.angle+90}, 500, Phaser.Easing.Linear.None, true);
      break;
    default:
      playerTween.to({x: player.x}, 500, Phaser.Easing.Linear.None, true);
      break;
  }

  //execute the tween, and then run handleFire at the end
  playerTween.onComplete.add(handleFire, this);
}

/**
 * handle the end of each turn, check to see if everyone is dead, and then check to see if the player is
 * on a warp tile
 */
function endOfTurn() {
  if(everyoneDead()) {
    //all the enemies are destroyed
    var playerLoc = calculatePlayerLocation();
    if(mainMap.getTile(playerLoc.x, playerLoc.y).index == 2) {
      //and the player is on a warp tile

      //direction variable, 0 is top, 1 is right, 2 is bottom, 3 is left
      var changeDir = 0;

      if(playerLoc.x  == 0) {
        //this is a left tile
        changeDir = 3;
        //playerMapX and playerMapY are global variables that determine where in the levelMaps array we are
        playerMapX--;
        //move the player to the opposite side (so it appears the player exits the level on the left and
        //enters the new level on the right
        newLevelPlayerPlacement(-1,0);
      } else if(playerLoc.x > 18) {
        //this is a right tile
        changeDir = 1;
        playerMapX++;
        newLevelPlayerPlacement(1,0);
      } else if(playerLoc.y == 0) {
        //this is a top tile
        changeDir = 0;
        playerMapY--;
        newLevelPlayerPlacement(0,1);
      } else {
        //this is a bottom tile
        playerMapY++;
        newLevelPlayerPlacement(0,-1);
      }

      if(levelMaps[playerMapX] == undefined) {
        levelMaps[playerMapX] = [];
      }
      if(levelMaps[playerMapX][playerMapY] == undefined) {
        //there is no map for this map yet
        levelMaps[playerMapX][playerMapY] = returnNewMapFromDirection(changeDir);
      }

      level++;
      //set the tile graphics
      setTileMap();
      //place enemies on the board
      initBoard();
    }
  }
}

/**
 * handle player fire commands
 */
function handleFire() {
  //these two numbers ensure that left projectiles will always be even and right odd numbers in the array
  var leftProjectileNum = commandNum*2;
  var rightProjectileNum = leftProjectileNum+1;

  playerShot[leftProjectileNum].angle = player.angle+90;
  playerShot[rightProjectileNum].angle = player.angle+90;

  if(playerCommands[commandNum].fireLeft == 1) {
    playerShot[leftProjectileNum].x = player.x;
    playerShot[leftProjectileNum].y = player.y;
    switch (player.angle) {
      case 0:
        playerShot[leftProjectileNum].body.velocity.x = -500;
        break;
      case 90:
        playerShot[leftProjectileNum].body.velocity.y = -500;
        break;
      case -180:
        playerShot[leftProjectileNum].body.velocity.x = 500;
        break;
      case -90:
        playerShot[leftProjectileNum].body.velocity.y = 500;
        break;
    }
  }

  if(playerCommands[commandNum].fireRight == 1) {
    playerShot[rightProjectileNum].x = player.x;
    playerShot[rightProjectileNum].y = player.y;
    switch (player.angle) {
      case 0:
        playerShot[rightProjectileNum].body.velocity.x = 500;
        break;
      case 90:
        playerShot[rightProjectileNum].body.velocity.y = 500;
        break;
      case -180:
        playerShot[rightProjectileNum].body.velocity.x = -500;
        break;
      case -90:
        playerShot[rightProjectileNum].body.velocity.y = -500;
        break;
    }
  }

  commandNum++;
  if(commandNum<3) {
    //execute handleCommand again with the iterated commandNum
    handleCommand();
  } else {
    //this is the last move, handle checks for end of game
    endOfTurn();
  }
}