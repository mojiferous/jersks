/**
 * Jersks game controller file
 * 2/25/14 Mojiferous
 */

var mapObj; //< overviewMap object
var mainMap; //< phaser tilemap object
var mainLayer; //< phaser layer object for the overview map

var player;
var enemies = [];

var playerShot = [];
var enemyShot = [];

var commands;

var mainMapSize = 30;

var commandNum = 0;

var cursors;


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

    mainMap = game.add.tilemap('map', 30, 30);

    mainMap.addTilesetImage('overview_background');

    mainLayer = mainMap.createLayer(0);
    mainLayer.resizeWorld();

    game.camera.x = 600;
    game.camera.y = 600;

    player = game.add.sprite(315, 315, 'player_sprite');
    player.anchor.setTo(0.5, 0.5);
    game.physics.enable(player, Phaser.Physics.ARCADE);
    player.body.collideWorldBounds = true;
    player.body.immovable = true;
    player.body.bounce.setTo(1, 1);

    enemies.push(game.add.sprite(75,45, 'enemy_sprite'));
    enemies[0].anchor.setTo(0.5, 0.5);
    game.physics.enable(enemies[0], Phaser.Physics.ARCADE);
    enemies[0].body.collideWorldBounds = true;
    enemies[0].body.immovable = true;
    enemies[0].angle = 180;

    for(var n=0; n<6; n++) {
      playerShot[n] = game.add.sprite(-50, -50, 'shot');
      game.physics.enable(playerShot[n], Phaser.Physics.ARCADE);
    }

//    game.input.onDown.add(mapClick, this);

    initBoard();

  }

  /**
   * called on frame update from phaser
   */
  function update() {

    for(var n=0; n<6; n++) {
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

      game.physics.arcade.collide(playerShot[n], enemies[0], enemyHit);
    }

  }

  /**
   * collision callback for enemy hit by player projectile
   * @param shot
   * @param enemy
   */
  function enemyHit(shot, enemy) {
    shot.x = -50;
    shot.y = -50;
  }

  /**
   * initialize the board
   */
  function initBoard() {

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
        switch (player.angle) {
          case 0:
            tween.to({y: player.y-30}, 500, Phaser.Easing.Linear.None, true);
            break;
          case 90:
            tween.to({x: player.x+30}, 500, Phaser.Easing.Linear.None, true);
            break;
          case -180:
            tween.to({y: player.y+30}, 500, Phaser.Easing.Linear.None, true);
            break;
          case -90:
            tween.to({x: player.x-30}, 500, Phaser.Easing.Linear.None, true);
            break;
        }
        break;
      case 'right':
        tween.to({angle: player.angle+90}, 500, Phaser.Easing.Linear.None, true);
        break;
    }

    tween.onComplete.add(handleFire, this);
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