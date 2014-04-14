/**
 * Jersks game controller file
 * 2/25/14 Mojiferous
 */

var mapObj; //< overviewMap object
var mainMap; //< phaser tilemap object
var mainLayer; //< phaser layer object for the overview map

var player;
var enemies = [];
var maxEnemies = 6;

var playerShot = [];
var enemyShot = [];
var defaultShotDamage = 50;

var commands;
var commandNum = 0;

var tileSize = 30;
var mapSize = 20;

var level = 0;

window.onload = function() {

  $('#submit_moves').click(function() {
    //handle clicks on the submit moves button
    resetCommands();
    if($('#left_fire1').is(':checked')) {
      commands[0].fireLeft = 1;
    }
    if($('#left_fire2').is(':checked')) {
      commands[1].fireLeft = 1;
    }
    if($('#left_fire3').is(':checked')) {
      commands[2].fireLeft = 1;
    }
    if($('#right_fire1').is(':checked')) {
      commands[0].fireRight = 1;
    }
    if($('#right_fire2').is(':checked')) {
      commands[1].fireRight = 1;
    }
    if($('#right_fire3').is(':checked')) {
      commands[2].fireRight = 1;
    }
    commands[0].move = $("input[name='move1']:checked").val();
    commands[1].move = $("input[name='move2']:checked").val();
    commands[2].move = $("input[name='move3']:checked").val();

    commandNum = 0;

    handleCommand();

    //reset the radio buttons
    $("input[type='radio']").prop('checked', false);
    $("input[type='checkbox']").prop('checked', false);

  });

  var game = new Phaser.Game(600, 600, Phaser.AUTO, 'jersks-game', { preload: preload, create: create, update: update });

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

    for(var n=0; n<6; n++) {
      playerShot[n] = game.add.sprite(-50, -50, 'shot');
      game.physics.enable(playerShot[n], Phaser.Physics.ARCADE);
    }

//    game.input.onDown.add(mapClick, this);

    placePlayer();
    initBoard();

  }

  /**
   * called on frame update from phaser
   */
  function update() {

    for(var n=0; n<playerShot.length; n++) {
      if(playerShot[n].body.velocity.x  != 0) {
        if(playerShot[n].x < 0 || playerShot[n].x > 600) {
          playerShot[n].x = -50;
          playerShot[n].y = -50;
          playerShot[n].body.velocity.x = 0;
          playerShot[n].body.velocity.y = 0;
        }
      }
      if(playerShot[n].body.velocity.y  != 0) {
        if(playerShot[n].y < 0 || playerShot[n].y > 600) {
          playerShot[n].x = -50;
          playerShot[n].y = -50;
          playerShot[n].body.velocity.x = 0;
          playerShot[n].body.velocity.y = 0;
        }
      }

      for(var r=0; r<maxEnemies; r++) {
        game.physics.arcade.collide(playerShot[n], enemies[r], enemyHit);
      }

    }

  }

  /**
   * initialize the board
   */
  function initBoard() {
    var xpos;
    var ypos;

    for(var n=0; n<maxEnemies; n++) {
      xpos = ((Math.floor(Math.random()*18)+1)*tileSize)+15;
      ypos = ((Math.floor(Math.random()*10)+1)*tileSize)+15;
      if(enemies[n] == undefined) {
        enemies.push(game.add.sprite(xpos,ypos, 'enemy_sprite'));
        enemies[n].anchor.setTo(0.5, 0.5);
        game.physics.enable(enemies[n], Phaser.Physics.ARCADE);
        enemies[n].body.collideWorldBounds = true;
        enemies[n].body.immovable = true;
        enemies[n].events.onKilled.add(enemyDead, this);
      } else {
        enemies[n].x = xpos;
        enemies[n].y = ypos;
      }

      enemies[n].angle = 180;
      enemies[n].health = 100;
    }

  }

  /**
   * place the player on a random spot at the bottom of the board and set up default variables
   */
  function placePlayer() {
    var xpos = ((Math.floor(Math.random()*18)+1)*tileSize)+15;
    var ypos = (18*tileSize)+15;
    player = game.add.sprite(xpos, ypos, 'player_sprite');
    player.anchor.setTo(0.5, 0.5);
    game.physics.enable(player, Phaser.Physics.ARCADE);
    player.body.collideWorldBounds = true;
    player.body.immovable = true;
    player.body.bounce.setTo(1, 1);
    player.events.onKilled.add(playerDead, this);

    player.angle = 0;
    player.health = 100;
    player.shotDamage = defaultShotDamage;
  }

  /**
   * moves the player based on which side of the board the warp tile was on
   * pass -1 for the bottom and right sides of the board
   * and 1 for the top and left sides
   * passing 0 for a variable does not change the value
   *
   * so if the player touches a warp tile at the top of the board, they should be located at the bottom of the board
   * for the next level, so newLevelPlayerPlacement(0,1) would relocate them from the top to the bottom of the board
   * on the same x position, making it appear that they have moved to the next board "up" from the current
   * @param xChange
   * @param yChange
   */
  function newLevelPlayerPlacement(xChange, yChange) {
    var newX = player.x + (xChange*(19*tileSize));
    var newY = player.y + (yChange*(19*tileSize));

    player.x = newX;
    player.y = newY;
    player.angle = 0;
  }

  /**
   * collision callback for enemy hit by player projectile
   * @param shot
   * @param enemy
   */
  function enemyHit(shot, enemy) {
    enemy.damage(player.shotDamage);
    shot.x = -50;
    shot.y = -50;
  }

  /**
   * event callback when player dies
   */
  function playerDead() {

  }

  /**
   * event callback for enemy death
   * @param deadEnemy
   */
  function enemyDead(deadEnemy) {

  }

  /**
   * handle commands passed
   */
  function handleCommand() {
    var tween = game.add.tween(player);
    switch(commands[commandNum].move) {
      case 'left':
        tween.to({angle: player.angle-90}, 500, Phaser.Easing.Linear.None, true);
        break;
      case 'forward':
        //get the player's current location
        var currentLocation = calculatePlayerLocation();

        switch (player.angle) {
          case 0:
            if(playerCanMoveToLocation(currentLocation.x, currentLocation.y-1)) {
              tween.to({y: player.y-30}, 500, Phaser.Easing.Linear.None, true);
            }
            break;
          case 90:
            if(playerCanMoveToLocation(currentLocation.x+1, currentLocation.y)) {
              tween.to({x: player.x+30}, 500, Phaser.Easing.Linear.None, true);
            }
            break;
          case -180:
            if(playerCanMoveToLocation(currentLocation.x, currentLocation.y+1)) {
              tween.to({y: player.y+30}, 500, Phaser.Easing.Linear.None, true);
            }
            break;
          case -90:
            if(playerCanMoveToLocation(currentLocation.x-1, currentLocation.y)) {
              tween.to({x: player.x-30}, 500, Phaser.Easing.Linear.None, true);
            }
            break;
        }
        break;
      case 'right':
        tween.to({angle: player.angle+90}, 500, Phaser.Easing.Linear.None, true);
        break;
      default:
        tween.to({x: player.x}, 500, Phaser.Easing.Linear.None, true);
        break;
    }

    tween.onComplete.add(handleFire, this);
  }

  /**
   * check tilemap to see if the user can move onto the tile
   * @param x
   * @param y
   * @returns {boolean}
   */
  function playerCanMoveToLocation(x, y) {
    return !(mainMap.getTile(x, y).index == 1);
  }

  /**
   * return an object with the players x and y location relative to the tilemap
   * @returns object
   */
  function calculatePlayerLocation() {
    var retVal = {};
    retVal.x = Math.floor(player.x/30);
    retVal.y = Math.floor(player.y/30);

    return retVal;
  }

  /**
   * checks if all enemies are dead
   * @returns {boolean}
   */
  function everyoneDead() {
    var retVal = true;
    for(var n=0; n<enemies.length; n++) {
      if(enemies[n].exists) {
        retVal = false;
      }
    }

    return retVal;
  }

  function endOfTurn() {
    if(everyoneDead()) {
      //all the enemies are destroyed
      var playerLoc = calculatePlayerLocation();
      if(mainMap.getTile(playerLoc.x, playerLoc.y).index == 2) {
        //and the player is on a warp tile
      }
    }
  }

  /**
   * handle fire commands
   */
  function handleFire() {
    var leftProjectileNum = commandNum*2;
    var rightProjectileNum = leftProjectileNum+1;

    playerShot[leftProjectileNum].angle = player.angle+90;
    playerShot[rightProjectileNum].angle = player.angle+90;

    if(commands[commandNum].fireLeft == 1) {
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

    if(commands[commandNum].fireRight == 1) {
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
      handleCommand();
    } else {
      //this is the last move, handle checks for end of game
      endOfTurn();
    }
  }


};

/**
 * resets the commands array for a new round
 */
function resetCommands() {
  commands = [
    {move: null, fireLeft: 0, fireRight: 0},
    {move: null, fireLeft: 0, fireRight: 0},
    {move: null, fireLeft: 0, fireRight: 0}
  ];
}