/**
 *
 * 4/18/14 Mojiferous
 */

/**
 * determine enemy unit commands based on location and direction
 */
function determineAICommands() {
  var playerLoc = calculatePlayerLocation();

  for(var n=0; n<enemies.length; n++) {
    if(enemies[n].exists) {
      //make sure this enemy exists in the board before figuring where it should go

      var myLoc = calculateEnemyLocation(n);

      //rotate the playerLoc location relative to the enemy[n] location, this allows us to use
      //a standard model to move the enemy based on the relative location of the player
      //for example, if the player is to the left and in front of the enemy, the enemy will turn left and fire right
      switch(enemies[n].angle) {
        case 0:
          //enemy facing upwards, at this point we just process the location of the player in relation to this enemy

          break;
        case 90:
          //enemy facing right, rotate the playerLoc once
          playerLoc = transformTargetLocation(myLoc.x, myLoc.y, playerLoc.x, playerLoc.y);
          break;
        case -180:
        case 180:
          //enemy facing downwards, rotate twice
          playerLoc = transformTargetLocation(myLoc.x, myLoc.y, playerLoc.x, playerLoc.y);
          playerLoc = transformTargetLocation(myLoc.x, myLoc.y, playerLoc.x, playerLoc.y);
          break;
        case -90:
        case 270:
          //enemy facing left
          playerLoc = transformTargetLocation(myLoc.x, myLoc.y, playerLoc.x, playerLoc.y);
          playerLoc = transformTargetLocation(myLoc.x, myLoc.y, playerLoc.x, playerLoc.y);
          playerLoc = transformTargetLocation(myLoc.x, myLoc.y, playerLoc.x, playerLoc.y);
          break;
      }

      //change playerLoc to make it relative to enemy, if enemy is at 0,0
      playerLoc.x = (playerLoc.x - myLoc.x);
      playerLoc.y = (playerLoc.y - myLoc.y);

      //ifte pile to determine what moves this enemy should make
      if(playerLoc.y == 0 && playerLoc.x < 0) {
        //the player is immediately to the left of the enemy, shoot twice
        enemyCommands[n][0].fireLeft = 1;
        enemyCommands[n][1].fireLeft = 1;
      } else if(playerLoc.y == 0 && playerLoc.x > 0) {
        //the player is immediately to the right of the enemy, shoot twice
        enemyCommands[n][0].fireRight = 1;
        enemyCommands[n][1].fireRight = 1;
      } else if(playerLoc.x == 0 && playerLoc.y < 0) {
        //the player is above the enemy, turn right, fire twice
        enemyCommands[n][0].move = 'right';
        enemyCommands[n][1].fireLeft = 1;
        enemyCommands[n][2].fireLeft = 1;
      } else if(playerLoc.x == 0 && playerLoc.y > 0) {
        //the player is directly below the enemy, turn right and fire twice
        enemyCommands[n][0].move = 'right';
        enemyCommands[n][1].fireRight = 1;
        enemyCommands[n][2].fireRight = 1;
      } else if(playerLoc.y < 0) {
        //the player is above us, move forward (no matter where they are)
        enemyCommands[n][0].move = 'forward';
        enemyCommands[n][1].move = 'forward';
        enemyCommands[n][2].move = 'forward';

        if(playerLoc.x < 0) {
          //the player is to the left
          enemyCommands[n][0].fireLeft = 1;
          enemyCommands[n][1].fireLeft = 1;
          enemyCommands[n][2].fireLeft = 1;
        } else {
          //the player is to the right
          enemyCommands[n][0].fireRight = 1;
          enemyCommands[n][1].fireRight = 1;
          enemyCommands[n][2].fireRight = 1;
        }

      } else {
        //presumably, the player is "below" or behind us now
        if(playerLoc.x < 0 && playerLoc.x > -3) {
          //the player is near our left
          enemyCommands[n][0].move = 'left';
          enemyCommands[n][1].move = 'forward';
          enemyCommands[n][2].move = 'forward';

          enemyCommands[n][1].fireLeft = 1;
          enemyCommands[n][2].fireLeft = 1;
        } else if(playerLoc.x > 0 && playerLoc.x < 3) {
          //the player is near our right
          enemyCommands[n][0].move = 'right';
          enemyCommands[n][1].move = 'forward';
          enemyCommands[n][2].move = 'forward';

          enemyCommands[n][1].fireRight = 1;
          enemyCommands[n][2].fireRight = 1;
        } else {
          enemyCommands[n][0].move = 'left';
          enemyCommands[n][1].move = 'left';
          enemyCommands[n][2].move = 'forward';
        }
      }

    }
  }
}

/**
 * transforms a targets coordinates 90 degrees left relative to the pivot coordinate
 * Dx = (Px - Tx) + (Ty - Py)
 * Dy = (Px - Tx) + (Py - Ty)
 * @param pivotX
 * @param pivotY
 * @param targetX
 * @param targetY
 * @returns {{x: number, y: number}}
 */
function transformTargetLocation(pivotX, pivotY, targetX, targetY) {
  var retVal = {x: -1, y: -1};

  var xA = pivotX - targetX;
  var xB = targetY - pivotY;

  var Dx = xA + xB;

  var yA = pivotX - targetX;
  var yB = pivotY - targetY;

  var Dy = yA + yB;

  retVal.x = targetX + Dx;
  retVal.y = targetY + Dy;

  return retVal;
}