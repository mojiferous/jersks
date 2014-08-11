/**
 *
 * 4/18/14 Mojiferous
 */

function determineAICommands() {
  var playerLoc = calculatePlayerLocation();

  for(var n=0; n<enemies.length; n++) {
    if(enemies[n].exists) {
      //make sure this enemy exists in the board before figuring where it should go

      var myLoc = calculateEnemyLocation(n);

      switch(enemies[n].angle) {
        case 0:
          //enemy facing upwards
          if(playerLoc.y < myLoc.y) {
            //the player is above the enemy, let's move upwards

          } else if(playerLoc.y == myLoc.y) {
            //we're on the same y plane, shoot them. shoot them so good
            if(playerLoc.x < myLoc.x) {
              //the player is to the left
              enemyCommands[n][0].fireLeft = 1;
              enemyCommands[n][1].fireLeft = 1;

              //determine which way the player is facing
              switch (player.angle) {
                case 0:
                  break;
                case 90:
                  break;
                case -180:
                  break;
                case -90:
                  break;
              }


            } else {
              //the player is to the right
              enemyCommands[n][0].fireRight = 1;
              enemyCommands[n][1].fireRight = 1;
            }

          } else {
            //the player is below

          }

          break;
        case 90:
          //enemy facing right
          break;
        case -180:
          //enemy facing downwards
          break;
        case -90:
          //enemy facing left
          break;
      }
    }
  }
}