/**
 *
 * Helper functions for jersks
 * 4/18/14 Mojiferous
 */

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
 * player has been hit by an enemy projectile
 * @param shot
 * @param playerVar
 */
function playerHit(shot, playerVar) {
  player.damage(shot.shotDamage);
  shot.x = -50;
  shot.y = -50;
}

/**
 * helper function to show or hide a div
 * @param divId
 * @param show
 */
function showHideDiv(divId, show) {
  if(show) {
    $(divId).show();
  } else {
    $(divId).hide();
  }
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
 * check tilemap to see if the user can move onto the tile
 * @param x
 * @param y
 * @returns {boolean}
 */
function playerCanMoveToLocation(x, y) {
  if(x<0 || y<0 || x>=mapSize || y>= mapSize) {
    return false;
  }
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
 * return an object with the enemy's x and y location relative to the tilemap
 * specific enemy determined by enemyNum
 * @param enemyNum
 * @returns {{}}
 */
function calculateEnemyLocation(enemyNum) {
  var retVal = {x: -1, y: -1};

  if(enemies[enemyNum] != undefined && enemies[enemyNum].exists) {
    retVal.x = Math.floor(enemies[enemyNum].x/30);
    retVal.y = Math.floor(enemies[enemyNum].y/30);
  }

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

/**
 * resets the commands array for a new round
 */
function resetCommands() {
  playerCommands = [
    {move: null, fireLeft: 0, fireRight: 0},
    {move: null, fireLeft: 0, fireRight: 0},
    {move: null, fireLeft: 0, fireRight: 0}
  ];

  for(var n=0; n<enemies.length; n++) {
    enemyCommands[n] = [
      {move: null, fireLeft: 0, fireRight: 0},
      {move: null, fireLeft: 0, fireRight: 0},
      {move: null, fireLeft: 0, fireRight: 0}
    ];

    enemyPos[n] = [
      {x: 0, y: 0},
      {x: 0, y: 0},
      {x: 0, y: 0}
    ];
  }
}

/**
 * calculates if enemy unit can move onto location, to prevent enemy from moving onto warp tiles
 * @param x
 * @param y
 * @returns {boolean}
 */
function enemyCanMoveToLocation(x, y) {
  if(x<0 || y<0 || x>=mapSize || y>= mapSize) {
    return false;
  }
  return (mainMap.getTile(x, y).index == 0);
}