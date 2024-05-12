import {GameMap} from "./GameMap.js";

const tileArea = 32;
const speed = 2; //speed of pacman/ghosts

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const gameOverSound = new Audio("sounds/gameOver.wav");
const gameWinSound = new Audio("sounds/gameWin.wav");
const gameMap = new GameMap(tileArea); //creates constant based on the GameMap class
const pacman = gameMap.createPacman(speed); //gets the pacman from the gameMap object
const enemies = gameMap.createEnemies(speed); //gets the enemies from Pacman object
let finalScore = 0;
//flags
let gameOver = false; //we haven't started yet by default it is false
let gameWin = false;
let scoreSubmitted = false; //hasn't been submitted at start of game
function checkGameWin() {
    if (!gameWin) {
        gameWin = gameMap.didWin(); //checks if 0 dots are left
        if (gameWin) {
            gameWinSound.play();
        }
    }
}

function checkGameOver() {
    if (!gameOver) {
        gameOver = isGameOver();
        if (gameOver) {
            gameOverSound.play();
        }
    }
}

function isGameOver() {
    return enemies.some( // some tests where at least one enemy has hit the pacman
        (enemy) => !pacman.powerFoodDotActivated && enemy.pacmanCollider(pacman) //if the power dot is not active then any collision with pacman is a death and an end to the game
    );
}

function pause() {
    return !pacman.initializedGameStart || gameOver || gameWin;
}

function drawGameEnd() {
    if (gameOver || gameWin) {
        let text = " You Win!";
        if (gameOver) {
            text = "Game Over";
        }

        ctx.fillStyle = "black";
        const rectHeight = 80;
        const rectY = (canvas.height - rectHeight) / 2; //put into middle
        ctx.fillRect(0, rectY, canvas.width, rectHeight);

        ctx.font = "80px san francisco";
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0); //fills with a gradient
        gradient.addColorStop("0", "orange");
        gradient.addColorStop("0.5", "yellow");
        gradient.addColorStop("1.0", "red");

        ctx.fillStyle = gradient;

        const textWidth = ctx.measureText(text).width; //centers into the middle of the screen
        const textX = (canvas.width - textWidth) / 2;
        const textY = rectY + rectHeight / 2 + 30;

        ctx.fillText(text, textX, textY);

    }
}
function gameLoop() {
    if (pacman.paused) { //when paused don't return anything
        return;
    }
    gameMap.draw(ctx); //draws gameMap context
    drawGameEnd(); //when game ends
    pacman.draw(ctx, pause(), enemies); //draws the pacman
    enemies.forEach((enemy) => enemy.draw(ctx, pause(), pacman)); //draws the enemies
    checkGameOver(); //checks
    checkGameWin();
}
const submitScoreForm = document.getElementById("score-form");
submitScoreForm.addEventListener("submit", async (event) => { //async helps move events as they occur
    event.preventDefault();
    if (!gameOver && !gameWin) { //prevents the user from submitting a score before the game has started or is in play
        alert("Score can only be submitted at the end of the game.");
        return; //exit out back to game
    }
    if (scoreSubmitted) { //cannot submit over and over after game finished
        alert("Score has already been submitted.");
        return;
    }
    const playerNameInput = document.getElementById("player-name");
    const playerName = playerNameInput.value.trim(); //remove excess white space from name

    try {
        finalScore = pacman.score; //takes the score attributed from the pacman class

        submitScore(playerName, finalScore);

        playerNameInput.value = ""; //reset field to no characters

        updateLeaderboard();
        scoreSubmitted = true; //puts the flag at true
    } catch (error) {
        console.error(error);
        alert("Error submitting score");
    }
});

const playerNameInput = document.getElementById("player-name");
playerNameInput.addEventListener("keydown", (event) => {
    const blockedKeys = ["w", "a", "s", "d"]; //fixed a bug where user could enter a wasd into player input
    if (
        document.activeElement === playerNameInput && //when the element is selected
        blockedKeys.includes(event.key.toLowerCase())
    ) {
        event.stopPropagation(); //do not make the event move onto other events possibly inhabiting them
    }
});

function submitScore(playerName, score) {
    const scores = JSON.parse(localStorage.getItem("scores")) || []; //retrieves the value of scores from localStorage, parses value from JSON into a js string object
    scores.push({ playerName, score }); //add the player name into the scores arrays
    scores.sort((a, b) => b.score - a.score); //sort them from lowest to highest
    scores.splice(10); //only the top 10 display

    localStorage.setItem("scores", JSON.stringify(scores)); //sets the scores item and converts from json to js strings

}

function updateLeaderboard() {
    const leaderboardElement = document.getElementById("leaderboard");
    const scores = JSON.parse(localStorage.getItem("scores")) || [];

    leaderboardElement.innerHTML = "";

    const table = document.createElement("table"); //creates a table for the score keeping
    table.innerHTML = `
    <tr>
      <th>Rank</th>
      <th>Name</th>
      <th>Score</th>
    </tr>
  `;

    scores.forEach((score, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
      <td>${index + 1}</td>
      <td>${score.playerName}</td>
      <td>${score.score}</td>
    `;
        table.appendChild(row); //keep adding to the table
    });

    leaderboardElement.appendChild(table); //add it to our element
}

gameMap.setSizeForCanvas(canvas);
setInterval(gameLoop, 1000 / 90); //the game keeps running at this speed without required actions

updateLeaderboard();
