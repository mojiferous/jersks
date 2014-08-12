/**
 *
 * functions to update and init the board
 * 4/18/14 Mojiferous
 */


/**
 * initialize the board
 */
function initBoard() {
  var xpos;
  var ypos;

  //the maximum number of enemies should increase as level increases
  var numEnemies = Math.floor(Math.random()*level);
  if(numEnemies < 1) {
    numEnemies = 1;
  }

  //however we never go beyond the global maxEnemies
  for(var n=0; n<maxEnemies; n++) {
    xpos = ((Math.floor(Math.random()*16)+2)*tileSize)+15;
    var maxY = (level == 0) ? 10 : 16;
    ypos = ((Math.floor(Math.random()*maxY)+2)*tileSize)+15;
    if(enemies[n] == undefined) {
      enemies.push(game.add.sprite(xpos,ypos, 'enemy_sprite'));
      enemies[n].anchor.setTo(0.5, 0.5);
      game.physics.enable(enemies[n], Phaser.Physics.ARCADE);
      enemies[n].body.collideWorldBounds = true;
      enemies[n].body.immovable = true;
      enemies[n].events.onKilled.add(enemyDead, this);
      enemies[n].health = 100;
    } else {
      enemies[n].x = xpos;
      enemies[n].y = ypos;
      enemies[n].revive(100);
    }

    enemies[n].angle = 180;

    //enemies beyond the random number set above should not exist
    if(n > (numEnemies-1)) {
      enemies[n].exists = false;
    }

    //set the damage the enemy's shots do
    for(var r=0; r<maxTurns; r++) {
      var shotNum = (n*maxTurns)+r;
      enemyShot[shotNum].shotDamage = defaultShotDamage;
    }
  }

}

/**
 * sets the phaser tile map to match the current levelMap
 * this is used exclusively for rendering so new levels are rendered correctly
 */
function setTileMap() {
  var thisMap = levelMaps[playerMapX][playerMapY];
  var n = 0;

  if(thisMap[0] == 1) {
    //there is a top exit
    if(mainMap.getTile(1,0) != 2) {
      //there is not currently an exit from the top
      for(n=1; n<19; n++) {
        mainMap.putTile(2, n, 0);
      }
    }
  } else {
    //no top exit
    if(mainMap.getTile(1,0) != 1) {
      //there is not currently an closed tile on the top
      for(n=1; n<19; n++) {
        mainMap.putTile(1, n, 0);
      }
    }
  }

  if(thisMap[1] == 1) {
    //there is a right exit
    if(mainMap.getTile(19,1) != 2) {
      for(n=1; n<19; n++) {
        mainMap.putTile(2, 19, n);
      }
    }
  } else {
    if(mainMap.getTile(19,1) != 1) {
      for(n=1; n<19; n++) {
        mainMap.putTile(1, 19, n);
      }
    }
  }

  if(thisMap[2] == 1) {
    //there is a bottom exit
    if(mainMap.getTile(1,19) != 2) {
      for(n=1; n<19; n++) {
        mainMap.putTile(2, n, 19);
      }
    }
  } else {
    if(mainMap.getTile(1,19) != 1) {
      for(n=1; n<19; n++) {
        mainMap.putTile(1, n, 19);
      }
    }
  }

  if(thisMap[3] == 1) {
    //there is a left exit
    if(mainMap.getTile(0,1) != 2) {
      for(n=1; n<19; n++) {
        mainMap.putTile(2, 0, n);
      }
    }
  } else {
    if(mainMap.getTile(0,1) != 1) {
      for(n=1; n<19; n++) {
        mainMap.putTile(1, 0, n);
      }
    }
  }


}

/**
 * instantiate a new passed map of the passed type at the current coordinates
 * @param passedMap
 */
function addMapOfType(passedMap) {
  if(levelMaps[playerMapX] == undefined) {
    levelMaps[playerMapX] = [];
  }

  if(levelMaps[playerMapX][playerMapY] == undefined) {
    //this level map has not been instantiated before
    levelMaps[playerMapX][playerMapY] = passedMap;
  }
}

/**
 * returns a new random map array
 * @param exitDir
 * @returns {number[]}
 */
function returnNewMapFromDirection(exitDir) {
  var exits = 1;
  var newMap = [0,0,0,0];

  switch (exitDir) {
    case 0:
      //player exited the top
      newMap[2] = 1;
      break;
    case 1:
      //player exited the right
      newMap[3] = 1;
      break;
    case 2:
      //player exited the bottom
      newMap[0] = 1;
      break;
    case 3:
      //player exited the left
      newMap[1] = 1;
      break;
  }

  for(var n=0; n<4; n++) {
    var hasExit = Math.floor(Math.random()*100);

    if(hasExit > 75) {
      if(newMap[n] == 0) {
        exits++;
        newMap[n] = 1;
      }
    }
  }

  if(exits == 1) {
    //we need more than one exit for later maps, create an exit opposite the entrance
    newMap[exitDir] = 1;
  }

  return newMap;
}

/**
 * place the player on a random spot at the bottom of the board and set up default variables
 */
function placePlayer() {
  var xpos = ((Math.floor(Math.random()*18)+1)*tileSize)+15;
  var ypos = ((Math.floor(Math.random()*5)+14)*tileSize)+15;
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
  var newX = player.x + (xChange*(18*tileSize));
  var newY = player.y + (yChange*(18*tileSize));

  player.x = newX;
  player.y = newY;
  player.angle = 0;
}