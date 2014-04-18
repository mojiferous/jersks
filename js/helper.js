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

function playerHit(shot, playerVar) {
  player.damage(shot.shotDamage);
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
  commands = [
    {move: null, fireLeft: 0, fireRight: 0},
    {move: null, fireLeft: 0, fireRight: 0},
    {move: null, fireLeft: 0, fireRight: 0}
  ];
}