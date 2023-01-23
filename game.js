//Connect 4 with minimax. 

var Depth = 5;
var bothAIPlayers = false;
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
class Board {
    //connect 4 board constructor
    constructor() {
        this.board = [];
        for (let i = 0; i < 6; i++) {
            this.board[i] = new Array(7).fill(0);
        }
        //Column Mask - deontes the first empty collumn in each row. 
        this.mask = [6, 6, 6, 6, 6, 6, 6]
        document.getElementById("grid").style.backgroundColor = "blue";
        this.transposTable = {};
        this.humanPlayingRed = document.querySelector('input[name="color"]:checked').value == "red";

        this.humanTurn = this.humanPlayingRed;
        this.nextToPlay = true;
        this.draw();

    }
    add(col, red) {
        cpp_add(col);
        if (this.mask[col] == 0) {
            return `-1`;
        }
        this.mask[col]--;
        let r = this.mask[col];
        this.board[r][col] = red - !red;
        this.nextToPlay = !this.nextToPlay;
        return `${r}${col}`;

    }

    numMovesLeft() {
        let n = 0;
        for (const row of this.board) {
            n += row.filter(e => e == 0).length;
        }
        return n;
    }


    //Returns a tuple with [true, 0] if the game ends in a draw, [true, 1] if player 1 wins, [true, -1] if player 2 wins, and [false, 0] if the game is not over.
    //The board is 6 rows by 7 columns, with 0 being an empty space, 1 being a red piece, and -1 being a yellow piece.
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
    
    async processHumanMove(id) {
        //processes the human move
        if (this.humanTurn) {
            let col = id.substring(1);
            let index = this.add(col, this.humanPlayingRed);
            if (index == "-1") return;
            let clicked = [this.humanPlayingRed ? 1 : -1, index[0], index[1]];
            this.humanTurn = false;
            await this.animate_fall(clicked);
            this.draw();
            if (this.state()[0]) {
                this.endGame(this.state());
                return;
            }
            if (!this.humanTurn) {
                document.getElementById("playNext").disabled=true;
                if (document.getElementById("HumanVsAI").checked) {
                    let move = getMoveCpp();
                    let evaluation = (this.humanPlayingRed ? -1 : 1) * cpp_geteval();
                    let s = `${evaluation} ${evaluation>=0?"(Favors Red)":"(Favors Yellow)"}`;
                    document.getElementById("botEval").innerText = s;
                    this.add(move, !this.humanPlayingRed);
                    let aiPiece = [(this.humanPlayingRed ? -1 : 1), this.mask[move], move];
                    await this.animate_fall(aiPiece);
                    this.draw()
                    this.humanTurn = true;
                }
                document.getElementById("playNext").disabled=false;
            }
            if (this.state()[0]) {
                this.endGame(this.state());
                return;
            }
        } else if (document.getElementById("HumanVsHuman").checked) {
            let col = id.substring(1);
            let index = this.add(col, !this.humanPlayingRed);
            if (index == "-1") return;
            let clicked = [this.humanPlayingRed?-1:1, index[0], index[1]];
            this.humanTurn = true;
            await this.animate_fall(clicked);
            this.draw();
           
            if (this.state()[0]) {
                this.endGame(this.state());
                return;
            }
        }
    }



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
        document.getElementById("botEval").innerText = "N/A";
    }
}

function getMoveCpp() {
    let tNow = performance.now();
    let i = cpp_best_move();
    console.log(`Finished in ${performance.now() - tNow}`);
    return i;
}

var humanTurn = true;
var teamRed = true;

function processClick(id) {
    if (game) {
        game.processHumanMove(id);
    }
}
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

//Make the grid container a square that fits inside the screen
var cpp_best_move, cpp_add, cpp_init, cpp_set_depth, cpp_geteval;
window.onload = function () {
    cpp_best_move = Module.cwrap('getBestMove', ["number"]);
    cpp_add = Module.cwrap('playMove', ["number"], ["number"]);

    cpp_init = Module.cwrap('newGame', ["number"], ["number"]);
    cpp_set_depth = Module.cwrap('setDepth', ["number"], ["number"]);
    cpp_geteval = Module.cwrap('getBotScore', ["number"]);
    initGrid();
    document.getElementById("close").onclick = function () {
        closeModal();
    }
    document.getElementById("SetDepth").oninput = function () {
        displaySliderValue();
    };
    document.getElementById("playNext").addEventListener("click",playNextMove);

}
function initGrid() {
    //Get slot border width, splice off the "px"
    let borderWidth = $(".grid-item").css("border-left-width").slice(0, -2);

    let grid = document.getElementById("grid");


    let gridWidth = Math.min(window.innerWidth, window.innerHeight);
    grid.style.width = gridWidth + "px";


    let slotDia = ((gridWidth / 7) - 2 * borderWidth) << 0;
    let gridItems = document.getElementsByClassName("grid-item");
    for (let i = 0; i < gridItems.length; i++) {
        gridItems[i].style.height = slotDia + "px";
        gridItems[i].style.width = slotDia + "px";
    }
    grid.style.height = 6 * gridWidth / 7 + "px";
}

function displaySliderValue() {
    var val = document.getElementById("SetDepth").value;//gets the oninput value
    Depth = val;
    cpp_set_depth(Depth);
    document.getElementById('output').innerHTML = `(${val})`;//displays this value to the html page
}
var game;
async function start() {
    //document.getElementById("GameOutcome").innerHTML = "";
    cpp_init(Depth);
    document.getElementById("WinFound").innerHTML = "";
    game = new Board();
    if (!game.humanPlayingRed && document.getElementById("HumanVsAI").checked) {
        e = document.getElementById("d11_experimental");
        game.add(3, true);
        await game.animate_fall([1, 5, 3]);
        game.draw();
        game.humanTurn = true;
    }
}
function playNextMove(){
    let c = cpp_best_move();

    game.processHumanMove(`${game.mask[c]}${c}`);
}
function closeModal() {
    document.getElementById("outcome").style.display = "none";
    document.getElementById("startButton").disabled = false;
}
