import {Movement} from "./Movement.js";

export class EnemyGhosts {
  constructor(x, y, tileArea, speed, gameMap) {

    this.tileArea = tileArea;
    this.speed = speed; // speed of travel
    this.gameMap = gameMap;
    this.x = x;
    this.y = y;
    this.loadImages();
    this.byDefaultDirectTimer = this.random(10, 20); // gives a default timer to 10 to 20 which decreases by 1 each frame per second
    this.directTimer = this.byDefaultDirectTimer;
    this.aboutToExpireDefault = 10;
    this.aboutToExpireTimer = this.aboutToExpireDefault;
    this.currentMover = Math.floor(
        Math.random() * Object.keys(Movement).length
    ); //calculates a random moving direction for each enemy ghost
  }

  loadImages() {
    this.calmGhost = new Image();
    this.calmGhost.src = "images/calmGhost.png";

    this.spookedGhost = new Image();
    this.spookedGhost.src = "images/spookedGhost.png";

    this.spookedGhost2 = new Image();
    this.spookedGhost2.src = "images/spookedGhost2.png";

    this.image = this.calmGhost;
  }

  draw(ctx, pause, pacman) {
    if (!pause) {
      this.move();
      this.switchEnemyDirections();
    }
    this.setImage(ctx, pacman); //regardless if paused
  }

  pacmanCollider(pacman) {
    const size = this.tileArea / 2;
    return (
        this.x < pacman.x + size && //ghosts x position is less than pacman x position + half the tile ghost's left side is to the left of Pacman's right side
        this.x + size > pacman.x && //ghosts x + half the tile is more than pacman x ghost's right side is to the right of Pacman's left side
        this.y < pacman.y + size && //ghosts y is less than pacman y position + half the tile ghost's top side is above Pacman's bottom side
        this.y + size > pacman.y //ghosts y + half tile is more than pacman y ghost's bottom side is below Pacman's top side
    ); // all 4 must be returned true to indicate a collision between a ghost and pacman
  }

  powerActiveImage(pacman) {
    if (pacman.powerFoodDotAboutToExpire) {
      this.aboutToExpireTimer--;

      // Check if the aboutToExpireTimer has expired
      const isTimerExpired = this.aboutToExpireTimer === 0;

      // Reset the timer and interchange the image if the timer has expired
      if (isTimerExpired) {
        this.aboutToExpireTimer = this.aboutToExpireDefault;
        this.image = this.image === this.spookedGhost ? this.spookedGhost2 : this.spookedGhost; //allows the ghost to flash between states
      }
    } else {
      this.image = this.spookedGhost;
    }
  }

  switchEnemyDirections() {
    this.directTimer--;
    // Check if the direction timer has expired
    if (this.directTimer === 0) {
      this.directTimer = this.byDefaultDirectTimer;
      // Generate a new random moving direction
      const newMoveDirection = Math.floor(Math.random() * Object.keys(Movement).length);
      // Check if the new direction is valid and there is no collision
      const isValidDirection = (
          newMoveDirection !== null &&
          this.currentMover !== newMoveDirection &&
          Number.isInteger(this.x / this.tileArea) &&
          Number.isInteger(this.y / this.tileArea) &&
          !this.gameMap.environmentCollider(this.x, this.y, newMoveDirection)
      );
      // Assign the new moving direction if it is valid
      if (isValidDirection) {
        this.currentMover = newMoveDirection;
      }
    }
  }

  move() {
    if (
        !this.gameMap.environmentCollider(
            this.x,
            this.y,
            this.currentMover
        )
    ) {
      const moveFunctions = {
        [Movement.up]: () => { this.y -= this.speed; },
        [Movement.down]: () => { this.y += this.speed; },
        [Movement.left]: () => { this.x -= this.speed; },
        [Movement.right]: () => { this.x += this.speed; }
      };

      moveFunctions[this.currentMover](); //uses the current moving direction to update the position of the ghost accordingly
    }
  }

  setImage(ctx, pacman) {
    if (pacman.powerFoodDotActivated) {
      this.powerActiveImage(pacman);
    } else {
      this.image = this.calmGhost; //else the image is the regular ghost
    }
    ctx.drawImage(this.image, this.x, this.y, this.tileArea, this.tileArea); //positioning based on the tile size
  }

  random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}