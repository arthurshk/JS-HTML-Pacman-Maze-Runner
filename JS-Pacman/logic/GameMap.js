import {Pacman} from "./Pacman.js";
import {EnemyGhosts} from "./EnemyGhosts.js";
import {Movement} from "./Movement.js";

export class GameMap {
  constructor(tileArea) {
    this.tileArea = tileArea; //constructor initialization
    this.getMeDot = new Image(); //creates memory for new image
    this.getMeDot.src = "images/getMeDot.png";
    this.calmDot = new Image();
    this.calmDot.src = "images/calmDot.png";
    this.wall = new Image();
    this.wall.src = "images/wall.png";
    this.powerDot = this.getMeDot;
    this.powerAnimateDefault = 30;
    this.powerAnimateTimer = this.powerAnimateDefault; //pass by reference
  }

  map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 7, 0, 0, 4, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1],
    [1, 0, 1, 0, 1, 6, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 7, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 6, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 7, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 6, 1],
    [1, 6, 0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 0, 6, 1, 0, 1, 0, 1],
    [1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 7, 0, 1, 0, 1],
    [1, 0, 1, 1, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 6, 0, 0, 1],
    [1, 0, 1, 1, 7, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ];
  //map key

  //0 - dot

  // 1 - wall

  //4 - pacman

  //5 - empty space

  //6 - enemy

  //7 - power dot
  draw(ctx) {
    const { tileArea } = this; //destructuring extracts the value of this.tileArea to a new local variable called tileArea

    for (let row = 0; row < this.map.length; row++) {
      for (let column = 0; column < this.map[row].length; column++) {
        const tile = this.map[row][column]; //assigns each tile a spot for each row all columns are filled followed by the next row

        switch (tile) {
          case 0:
            this.#createDot(ctx, column, row, tileArea); //based on private draw functions
            break;
          case 1:
            this.#createWall(ctx, column, row, tileArea);
            break;
          case 7:
            this.#createPowerDot(ctx, column, row, tileArea);
            break;
          default:
            this.#createVoid(ctx, column, row, tileArea);
            break;
        } //based on the case of the map takes the length of each row column 32 * 32 and draws dot,
        // wall, power dots depending on the values assigned when creating the map field.
      }
    }
  }

  #createDot(ctx, column, row, size) {
    ctx.drawImage(
        this.calmDot,
        column * size,
        row * size,
        size,
        size
    ); //these values are later passed through on the draw method
  }

  didWin() {
    return this.#dotsLeft() === 0; //when no food left player wins
  }

  #dotsLeft() {
    return this.map.flat().filter((tile) => tile === 0).length; //makes the entire array flat into 1s and 0s to detect if no food is left
    // creation of an anonymous lambda function to facilitate
  }

  #createWall(ctx, column, row, size) {
    ctx.drawImage(
        this.wall,
        column * size,
        row * size,
        size,
        size
    );
  }

  #createVoid(ctx, column, row, size) {
    ctx.fillStyle = "black";
    ctx.fillRect(column * size, row * size, size, size); //square with no food utilized to cover when Pacman eats food, returns a black square
  }

  createPacman(speed) {
    let pacman = null;

    // Iterate over each row in the map
    this.map.forEach((row, rowIndex) => {
      // Iterate over each tile in the row
      row.forEach((tile, columnIndex) => {
        // Check if the tile represents Pacman (value of 4)
        if (tile === 4) {
          // Set the tile value to 0 to prevent duplicates
          this.map[rowIndex][columnIndex] = 0;

          // Create a new Pacman object and assign it to the 'pacman' variable
          pacman = new Pacman(
              columnIndex * this.tileArea,
              rowIndex * this.tileArea,
              this.tileArea,
              speed, //gives newly created Pacman object an initial speed
              this //passes the current GameMap object as a reference to the Pacman object, allowing the Pacman object to access and interact with the game map
          );
        }
      });
    });

    // Return the Pacman object
    return pacman;
  }

  createEnemies(speed) {
    //creates an array of ghosts as we want to have more than one
    const enemies = [];

    // Iterate over each row in the map
    this.map.forEach((row, rowIndex) => {
      // Iterate over each tile in the row
      row.forEach((tile, columnIndex) => {
        // Check if the tile represents an enemy (value of 6)
        if (tile === 6) {
          // Set the tile value to 0 to prevent duplicates
          this.map[rowIndex][columnIndex] = 0;

          // Create a new EnemyGhosts object and push it to the 'enemies' array
          enemies.push(
              new EnemyGhosts(
                  columnIndex * this.tileArea,
                  rowIndex * this.tileArea,
                  this.tileArea,
                  speed,
                  this //reference to the enemy object, lets enemy ghosts to interact with game map
              )
          );
        }
      });
    });

    // Return the array of enemy objects
    return enemies;
  }

  setSizeForCanvas(canvas) {
    canvas.width = this.map[0].length * this.tileArea; //number of columns in first row by tile size
    canvas.height = this.map.length * this.tileArea; //number of rows multiplied by tile size
  } //ensures that the game canvas is sized appropriately to accommodate the game map,
  // based on the number of rows and columns in the map and the specified tile size.

  environmentCollider(x, y, direction) {
    if (direction == null) {
      return; //no collision detection and returns without any further execution
    }

    if (
        Number.isInteger(x / this.tileArea) &&
        Number.isInteger(y / this.tileArea) //must be on a tile boundary, cannot be halfway through a wall
    ) {
      let column = 0; //gives initial starting value
      let row = 0;
      let nextColumn = 0;
      let nextRow = 0;

      // Object mapping for movement directions
      const movementDirections = {
        [Movement.right]: {
          // Function to calculate next column and row for right movement
          calculateNext: () => {
            nextColumn = x + this.tileArea; //moving to right adding tileArea to next column
            column = nextColumn / this.tileArea; //gets the column index of the next tile(check for wall)
            row = y / this.tileArea; //same y index as no movement up/down, do not need collision checks
          }
        },
        [Movement.left]: {
          // Function to calculate next column and row for left movement
          calculateNext: () => {
            nextColumn = x - this.tileArea; // moving to left subtracting tileArea to backwards column
            column = nextColumn / this.tileArea; // gets the column index of backwards column
            row = y / this.tileArea; //stays same
          }
        },
        [Movement.up]: {
          // Function to calculate next column and row for up movement
          calculateNext: () => {
            nextRow = y - this.tileArea; // moving up subtracting tileArea, have to minus as up is down in y coordinates
            row = nextRow / this.tileArea; // gets the next row of the complete tileArea integer
            column = x / this.tileArea; //no need for column as no movement left/right
          }
        },
        [Movement.down]: {
          // Function to calculate next column and row for down movement
          calculateNext: () => {
            nextRow = y + this.tileArea; // y goes up when goes down, + 1 tileArea to the y to enable collision
            row = nextRow / this.tileArea; // finds the next row
            column = x / this.tileArea; //no need to update
          }
        }
      };

      // Retrieve the movement object based on the direction
      const movement = movementDirections[direction];
      if (movement) {

        movement.calculateNext(); // Call the corresponding calculateNext function to perform calculations
        const tile = this.map[row][column]; //assigns tile
        if (tile === 1) {
          return true; //we've hit a wall
        }
      }
    }

    return false;
  }

  #createPowerDot(ctx, column, row, size) {
    this.powerAnimateTimer--;
    if (this.powerAnimateTimer === 0) {
      this.powerAnimateTimer = this.powerAnimateDefault;
      this.powerDot = this.powerDot === this.getMeDot ? this.calmDot : this.getMeDot;
    }
    ctx.drawImage(this.powerDot, column * size, row * size, size, size);
  }
  eatPowerFoodDot(x, y) {
    const row = y / this.tileArea;
    const column = x / this.tileArea;

    // Check if the row and column are whole numbers with no decimals
    const isWholeNumber = Number.isInteger(row) && Number.isInteger(column);

    if (isWholeNumber) {
      const tile = this.map[row][column];

      // Check if the tile contains a power dot (value 7)
      if (tile === 7) {
        this.map[row][column] = 5; // Set it to an empty square with no power dot
        return true;
      }
    }

    return false; // No execution
  }

  eatFoodDot(x, y) {
    const row = y / this.tileArea;
    const column = x / this.tileArea;

    // Check if the row and column are whole numbers with no decimals
    const isWholeNumber = Number.isInteger(row) && Number.isInteger(column);

    if (isWholeNumber) {
      const tile = this.map[row][column];

      // Check if the tile contains a dot (value 0)
      if (tile === 0) {
        this.map[row][column] = 5; // It is eaten and set to an empty space
        return true;
      }
    }

    return false;
  }
}
