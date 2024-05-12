import {Movement} from "./Movement.js";
const pacmanState1 = new Image();
pacmanState1.src = "images/pacmanClosed.png";

const pacmanState2 = new Image();
pacmanState2.src = "images/openPacman.png";

const pacmanState3 = new Image();
pacmanState3.src = "images/openFullPacman.png";

const pacmanState4 = new Image();
pacmanState4.src = "images/openPacman.png";

export class Pacman {
  constructor(x, y, tileArea, speed, gameMap) {

    this.tileArea = tileArea;
    this.speed = speed; //speed
    this.gameMap = gameMap; //reference to our gameMap based on constructor for pacman
    this.score = 0;
    this.scoreElement = document.getElementById('score');
    this.movingDirectionNow = null;
    this.wantedMovingDirection = null;
    this.paused = false;
    this.x = x;
    this.y = y;
    this.pacmanAnimateDefault = 10; //how quickly the pacman animates
    this.pacmanAnimateTimer = null;
    this.pacmanRotation = this.Rotation.right;
    this.eatNormalDotSound = new Audio("sounds/eatNormalDot.wav");
    this.powerFoodDotSound = new Audio("sounds/powerFoodDot.wav");
    this.powerFoodDotActivated = false;
    this.powerFoodDotAboutToExpire = false;
    this.timers = []; //array of timers
    this.eatEnemySound = new Audio("sounds/eatEnemy.wav");
    this.initializedGameStart = false; //doesnt start falsely

    document.addEventListener("keydown", this.#keydown);

    this.pacmanStates = [
      pacmanState1,
      pacmanState2,
      pacmanState3,
      pacmanState4,
    ]; //array of our images taken outside as global variables for easier accessibility

    this.pacmanImageIndex = 0; //starts with closed mouth
  }

  Rotation = {
    right: 0,
    down: 1,
    left: 2,
    up: 3,
  }; //rotation constants for pacman mouth rotation

  removeEventListeners = () => {
    document.removeEventListener("keydown", this.#keydown);
  };

  cleanup() {
    this.removeEventListeners();
  }

  #keydown = (event) => {
    // up
    if (event.keyCode === 38 || event.keyCode === 87) {
      event.preventDefault(); //prevents page from moving/scrolling when playing the game keystrokes only apply to game
      this.handleDirectionChange(Movement.down, Movement.up); //takes the current moving direction parameter and the requested direction
    }
    // down
    if (event.keyCode === 40 || event.keyCode === 83) {
      event.preventDefault();
      this.handleDirectionChange(Movement.up, Movement.down);
    }
    // left
    if (event.keyCode === 37 || event.keyCode === 65) {
      event.preventDefault();
      this.handleDirectionChange(Movement.right, Movement.left);
    }
    // right
    if (event.keyCode === 39 || event.keyCode === 68) {
      event.preventDefault();
      this.handleDirectionChange(Movement.left, Movement.right);
    }
    // pause/unpause
    if (event.keyCode === 80) {
      this.paused = !this.paused;
    }
  };

  handleDirectionChange = (directionNow, directionWanted) => {
    if (this.movingDirectionNow === directionNow) {
      this.movingDirectionNow = directionWanted; //sets the movingDirectionNow into the moving direction that is requested using = operator
    }
    this.wantedMovingDirection = directionWanted; //updates the directionWanted
    this.initializedGameStart = true;
  };

  #move() {
    // Check if pacman is on a complete tile and didn't collide with environment
    const isOnCompleteTile = Number.isInteger(this.x / this.tileArea) && Number.isInteger(this.y / this.tileArea);
    const didNotCollide = !this.gameMap.environmentCollider(this.x, this.y, this.wantedMovingDirection);

    // Update movingDirectionNow if wantedMovingDirection is different and there are no collisions
    if (this.movingDirectionNow !== this.wantedMovingDirection && isOnCompleteTile && didNotCollide) {
      this.movingDirectionNow = this.wantedMovingDirection;
    }

    // Check if pacman collided with the environment
    if (this.gameMap.environmentCollider(this.x, this.y, this.movingDirectionNow)) {
      this.pacmanAnimateTimer = null; // Pause the animation
      this.pacmanImageIndex = 1; // Open mouth when collided
      return; // Exit the function
    } else if (this.movingDirectionNow != null && this.pacmanAnimateTimer == null) {
      this.pacmanAnimateTimer = this.pacmanAnimateDefault; // Reset the animation timer
    }

    // Define movement directions and corresponding changes in x, y, and rotation values
    const movementDirections = {
      [Movement.up]: { x: 0, y: -1, rotation: this.Rotation.up }, //object literals to dynamically define the property keys of the Movement.up, down, left, right
      [Movement.down]: { x: 0, y: 1, rotation: this.Rotation.down },
      [Movement.left]: { x: -1, y: 0, rotation: this.Rotation.left },
      [Movement.right]: { x: 1, y: 0, rotation: this.Rotation.right },
    };

    // Retrieve movement values based on the movingDirectionNow
    const movement = movementDirections[this.movingDirectionNow];
    if (movement) {
      // Update the x, y, and pacmanRotation based on the movement values
      this.x += movement.x * this.speed; // Move in the x direction
      this.y += movement.y * this.speed; // Move in the y direction
      this.pacmanRotation = movement.rotation; // Set the rotation
    }
  }



  #animate() {
    if (this.pacmanAnimateTimer !== null) {
      this.pacmanAnimateTimer--; // decrements the timer
      if (this.pacmanAnimateTimer === 0) { //indication that it's time to update the pacman image
        this.pacmanAnimateTimer = this.pacmanAnimateDefault; //resets to default
        this.pacmanImageIndex = (this.pacmanImageIndex + 1) % this.pacmanStates.length; //wraps around the image index if it's the last it will wrap around to the first
      }
    }
  }
  #eatFoodDot() { //private method only can be used within the class
    if (this.gameMap.eatFoodDot(this.x, this.y) && this.initializedGameStart) { //accesses through 'this' keyword within constructor of pacman class
      this.eatNormalDotSound.play(); //play waka sound
      this.score += 10;
      this.updateScoreDisplay();
    }
  }

  #eatPowerFoodDot() {
    if (this.gameMap.eatPowerFoodDot(this.x, this.y)) {    // If the current tile contains a power dot, and it's successfully eaten by Pacman
      this.powerFoodDotSound.play(); // Play the power dot eating sound
      this.powerFoodDotActivated = true;  // Set the flags for power dot status
      this.powerFoodDotAboutToExpire = false;  // Set the flags for power dot status
      this.timers.forEach((timer) => clearTimeout(timer));  // Clear any existing timers
      this.timers = [];
      let powerDotTimer = setTimeout(() => {   // Create a timer to disable the power dot after 5 seconds
        this.powerFoodDotActivated = false;
        this.powerFoodDotAboutToExpire = false;
      }, 5000);

      this.timers.push(powerDotTimer);     // Add the timer to the timers array

      let powerFoodDotAboutToExpireTimer = setTimeout(() => {    // Create a timer to indicate the power dot is about to expire after 2 seconds
        this.powerFoodDotAboutToExpire = true;
      }, 2000);

      this.timers.push(powerFoodDotAboutToExpireTimer);
      // Add the timer to the timers array
      this.score += 20; //update score to add 20 when eating a power dot
      this.updateScoreDisplay();
    }
  }

  #eatEnemy(enemies) {
    if (this.powerFoodDotActivated) { //whether Pacman is currently in a powered-up state or not
      const collideEnemies = enemies.filter((enemy) => enemy.pacmanCollider(this)); //this refers to the current Pacman object, modules bundle together so all that include Movement.js enemy gets access to
      collideEnemies.forEach((enemy) => { //iteration over each enemy within array of collideEnemies
        enemies.splice(enemies.indexOf(enemy), 1); //remove enemy from the array of enemies at a count of 1
        this.eatEnemySound.play();
        this.score += 50;
        this.updateScoreDisplay();
      });
    }
  }

  draw(ctx, pause, enemies) {
    if (!pause) { //when not paused update position and animation
      this.#move();
      this.#animate();
    } //the following 3 are called regardless if the game is paused or not
    this.#eatFoodDot();
    this.#eatPowerFoodDot();
    this.#eatEnemy(enemies);

    const size = this.tileArea / 2; // used for positioning and sizing the pacman image

    ctx.save(); // to preserve the current transformation matrix and styles
    ctx.translate(this.x + size, this.y + size); //translates to the center of the pacman's current position
    ctx.rotate((this.pacmanRotation * 90 * Math.PI) / 180); //rotates by angle, the pacmanRotation is multiplied by 90 degrees and converted into radians 0,1,2,3 * 90
    ctx.drawImage(
        this.pacmanStates[this.pacmanImageIndex], //selects which index draws the pacman image
        -size, //centers the image from top left corner onto center of pacman position
        -size,
        this.tileArea, //the pacman image fits into the size of the tile
        this.tileArea
    );
    ctx.restore(); // restores it to the ctx.save()
  }

  updateScoreDisplay() {
    this.scoreElement.innerText = this.score; //display score
  }
}
