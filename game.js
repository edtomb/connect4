//CONNECT 4 GAME FRONTEND INTEGRATION
var Depth = 5;
var bothAIPlayers = false;
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * The board representation. 
 * 
 */
class Board {
    /*
    Initialize the board.
    */
    constructor() {
        //Board is an 2D array of 0's
        /**Order:
         8    0 1 2 3 4 5 6
         *  0
         *  1
         *  2
         *  3
         *  4
         *  5       X    
         * X = board[3][5]
         */
        this.board = [];
        for (let i = 0; i < 6; i++) {
            this.board[i] = new Array(7).fill(0);
        }
        //Column Mask - deontes the highest filled cell in each row. 
        this.mask = [6, 6, 6, 6, 6, 6, 6]
        document.getElementById("grid").style.backgroundColor = "blue";
        this.transposTable = {};
        //Determines if human is playing red or yellow using the corresponding radio box
        this.humanPlayingRed = document.querySelector('input[name="color"]:checked').value == "red";
        this.humanTurn = this.humanPlayingRed;
        this.draw();
    }
    /**
     * 
     * @param {number} col : The column(0 through 6) to add the piece to 
     * @param {boolean} red : True=The piece to add will be red
     * @returns 
     */
    add(col, red) {
        //Add the piece to the C++ representation
        cpp_add(col);
        if (this.mask[col] == 0) {
            return `-1`;
        }
        this.mask[col]--;
        let r = this.mask[col];
        //If the piece to add is red, add a 1. Else, add a -1.
        this.board[r][col] = red?1:-1;
        //Return the ID from where the piece is added
        return `${r}${col}`;

    }
    /**
     * Gets the number of moves left, used in this.state
     * @returns The number of empty cells left on the board
     */
    numMovesLeft() {
        let n = 0;
        this.board.forEach((row)=>n += row.filter(e => e == 0).length);
        return n;
    }


    /*
    Returns a tuple with [true, 0] if the game ends in a draw, [true, 1] if player 1 wins, [true, -1] if player 2 wins, and [false, 0] if the game is not over.
    */
    state() {
        //Check for vertical win
        let winEval = 1000 - (42 - this.numMovesLeft());
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 7; j++) {
                if (this.board[i][j] != 0 && this.board[i][j] == this.board[i + 1][j] && this.board[i][j] == this.board[i + 2][j] && this.board[i][j] == this.board[i + 3][j]) {
                    return [true, this.board[i][j] * winEval];
                }
            }
        }
        //Check for horizontal win
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.board[i][j] != 0 && this.board[i][j] == this.board[i][j + 1] && this.board[i][j] == this.board[i][j + 2] && this.board[i][j] == this.board[i][j + 3]) {
                    return [true, this.board[i][j] * winEval];
                }
            }
        }
        //Check for diagonal win
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.board[i][j] != 0 && this.board[i][j] == this.board[i + 1][j + 1] && this.board[i][j] == this.board[i + 2][j + 2] && this.board[i][j] == this.board[i + 3][j + 3]) {
                    return [true, this.board[i][j] * winEval];
                }
            }
        }
        //Check for diagonal win
        for (let i = 3; i < 6; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.board[i][j] != 0 && this.board[i][j] == this.board[i - 1][j + 1] && this.board[i][j] == this.board[i - 2][j + 2] && this.board[i][j] == this.board[i - 3][j + 3]) {
                    return [true, this.board[i][j] * winEval];
                }
            }
        }
        //Check for draw
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 7; j++) {
                if (this.board[i][j] == 0) {
                    return [false, 0];
                }
            }
        }
        return [true, 0];

    }
    /**
     * Draws the board by filling in colors for each player or white for blank tile.
     */
    draw() {
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 7; j++) {
                if (this.board[i][j] == 1) {
                    document.getElementById(`${i}${j}`).style.background = `radial-gradient(#3d0000,#ff0000)`;
                }
                else if (this.board[i][j] == -1) {
                    document.getElementById(`${i}${j}`).style.background = `radial-gradient(#707a02,#ffff00)`;
                }
                else {
                    document.getElementById(`${i}${j}`).style.background = `#ffffff`;
                }
            }
        }
    }

    /**
     * 
     * @param {Int[3]} piece [color,row,col] fo piece
     */
    async animate_fall(piece) {
        for (let i = 0; i <= piece[1]; i++) {
            let colorOut = piece[0] == 1 ? `#ff0000` : `#ffff00`;
            let colorIn = piece[0] == 1 ? `#3d0000` : `#7a7a02`;
            for (let p = 0; p <= 100; p += 10) {
                document.getElementById(`${i}${piece[2]}`).style.background = `radial-gradient(${colorIn},${colorOut})`;
                await sleep(1);
            }
            document.getElementById(`${i}${piece[2]}`).style.background = `#ffffff`;

        }
    }
    /**
     * Fills in the human's move and then plays the robot's move. 
     * @param {String} id 2 characters: The row,col that is clicked
     */
    async processHumanMove(id) {
        if (this.humanTurn) {

            let col = id.substring(1);
            //add returns -1 if a move cannot be played, processHumanMove is called with an invalid ID, nothing happens
            let index = this.add(col, this.humanPlayingRed);
            if (index == "-1") return;
            //3 Tuple storing the piece color, row, collumn 
            let clicked = [this.humanPlayingRed ? 1 : -1, index[0], index[1]];
            this.humanTurn = false;
            await this.animate_fall(clicked);
            this.draw();
            if (this.state()[0]) {
                this.endGame(this.state());
                return;
            }
            if (!this.humanTurn) {
                document.getElementById("playNext").disabled = true;
                if (document.getElementById("HumanVsAI").checked) {
                    let move = getMoveCpp();
                    let evaluation = (this.humanPlayingRed ? -1 : 1) * cpp_geteval();
                    let s = `${evaluation} ${evaluation >= 0 ? "(Favors Red)" : "(Favors Yellow)"}`;
                    document.getElementById("botEval").innerText = s;
                    this.add(move, !this.humanPlayingRed);
                    let aiPiece = [(this.humanPlayingRed ? -1 : 1), this.mask[move], move];
                    await this.animate_fall(aiPiece);
                    this.draw()
                    this.humanTurn = true;
                }
                document.getElementById("playNext").disabled = false;
            }
            if (this.state()[0]) {
                this.endGame(this.state());
                return;
            }
        } else if (document.getElementById("HumanVsHuman").checked) {
            let col = id.substring(1);
            let index = this.add(col, !this.humanPlayingRed);
            if (index == "-1") return;
            let clicked = [this.humanPlayingRed ? -1 : 1, index[0], index[1]];
            this.humanTurn = true;
            await this.animate_fall(clicked);
            this.draw();

            if (this.state()[0]) {
                this.endGame(this.state());
                return;
            }
        }
    }


    /**
     * Disables moving, greys out the Con4 board, and displays the game outcome modal. 
     * @param {[boolean,number]} gState - The game state: [gameEnded, winnerID]. 
     *                                                      gameEnded: true= The game is over; false= The game is not over.
     *                                                      winnerID: 0=Draw; 1=Red Wins; -1=Yellow Wins
     */
    endGame(gState) {
        let humanWon = (this.humanPlayingRed - !this.humanPlayingRed) * gState[1] > 0 ? "Niceeee" : "Better luck next time...";
        this.humanTurn = false;
        document.getElementById("grid").style.backgroundColor = "grey";
        let out = document.getElementById("outcome_text");
        if (gState[1] > 0) {
            out.innerHTML = "Red Wins!";
        } else if (gState[1] < 0) {
            out.innerHTML = "Yellow Wins!";
        } else {
            out.innerHTML = "Draw?!";
        }
        out.innerHTML += `\n${humanWon}`;
        document.getElementById("outcome").style.display = "block";
        document.getElementById("botEval").innerText = "";
    }
}
/**
 * Times and retrieves the best move from the C++ solver
 * @returns The best column for the current player
 */
function getMoveCpp() {
    let tNow = performance.now();
    let i = cpp_best_move();
    console.log(`Finished in ${performance.now() - tNow}`);
    return i;
}

var humanTurn = true;
var teamRed = true;
/**
 * Handles the user clicking on a circle on the board. 
 * @param {String} id - 2 Characters. The row,col of the board. 
 */
function processClick(id) {
    if (game) {
        game.processHumanMove(id);
    }
}
/**
 * Gets device type to provide the correct layout. 
 * @returns The device type
 */
function getDeviceType() {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return "tablet";
    }
    else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
        return "mobile";
    }
    return "desktop";
}

//CPP Function declarations
var cpp_best_move, cpp_add, cpp_init, cpp_set_depth, cpp_geteval;
/**
 * Set up event listeners and initialize C++ imports. 
 */
window.onload = function () {
    //CPP function definitions. Emscripten is goated. 
    cpp_best_move = Module.cwrap('getBestMove', ["number"]);
    cpp_add = Module.cwrap('playMove', ["number"], ["number"]);
    cpp_init = Module.cwrap('newGame', ["number"], ["number"]);
    cpp_set_depth = Module.cwrap('setDepth', ["number"], ["number"]);
    cpp_geteval = Module.cwrap('getBotScore', ["number"]);
    initGrid();
    /**
     * Event Listeners
     */
    document.getElementById("close").onclick = function () {
        closeModal();
    }

    document.getElementById("SetDepth").oninput = function () {
        setDepth();
    };
    document.getElementById("playNext").addEventListener("click", playNextMove);
}
function initGrid() {
    //Get slot border width, splice off the "px", if it works it works. 
    let borderWidth = $(".grid-item").css("border-left-width").slice(0, -2);
    let grid = document.getElementById("grid");
    let gridWidth = Math.min(window.innerWidth, window.innerHeight);
    grid.style.width = gridWidth + "px";
    let slotDiameter = ((gridWidth / 7) - 2 * borderWidth) << 0;
    let gridItems = document.getElementsByClassName("grid-item");
    for (let i = 0; i < gridItems.length; i++) {
        gridItems[i].style.height = slotDiameter + "px";
        gridItems[i].style.width = slotDiameter + "px";
    }
    grid.style.height = 6 * gridWidth / 7 + "px";
}
/**
 * Gets the depth slider value and saves it
 */
function setDepth() {
    Depth = document.getElementById("SetDepth").value;
    cpp_set_depth(Depth);
    document.getElementById('output').innerHTML = `(${Depth})`;
}
var game;
/**
 * Resets the bard and starts the game. 
 */
async function start() {
    //Initialize the C++ representation.
    cpp_init(Depth);
    game = new Board();
    //If the AI is playing the first move, play in the center column. 
    if (!game.humanPlayingRed && document.getElementById("HumanVsAI").checked) {
        game.add(3, true);
        await game.animate_fall([1, 5, 3]);
        game.draw();
        game.humanTurn = true;
    }
}
/**
 * Handles the next move button, plays the human's move for them. 
 */
function playNextMove() {
    let c = cpp_best_move();
    game.processHumanMove(`${game.mask[c]}${c}`);
}
/**
 * Closes the game outcome modal that appears after the game ends. 
 */
function closeModal() {
    document.getElementById("outcome").style.display = "none";
    document.getElementById("startButton").disabled = false;
}
