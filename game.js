//Connect 4 with minimax. 
//TODO, add binary optimizations
//figure out transposition table
//organize and comment code
//Try negamax
var maxPositions=1500000;
var Depth=5;
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
        this.mask=[6,6,6,6,6,6,6]
        document.getElementById("grid").style.backgroundColor="blue";
        this.transposTable = {};
        this.humanPlayingRed = document.querySelector('input[name="color"]:checked').value == "red";

        this.humanTurn = this.humanPlayingRed;
        this.draw();

    }
    add(col,red){
        cpp_add(col,red);
        if(this.mask[col]==0){
            return `-1`;
        }
        this.mask[col]--;
        let r=this.mask[col];
        this.board[r][col]=red-!red;
        return `${r}${col}`;

    }
    remove(col){
        cpp_remove(col)
        let r=this.mask[col];
        this.mask[col]++;
        this.board[r][col]=0;
    }
    numMovesLeft() {
        let n = 0;
        for (const row of this.board) {
            n += row.filter(e => e == 0).length;
        }
        return n;
    }
    getString(){
        let s="";
       for(let i=0;i<6;i++) {
        for(let j=0;j<7;j++){
            s+=this.board[i][j]+1;
        }
       }
       return s;
    }
    //generate a hash code for the board
    hash() {
        let hash = 0;
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 7; j++) {
                hash += (this.board[i][j] + 1) * Math.pow(3, i * 7 + j);
            }
        }
        return hash.toString(16);
    }       
    //Returns a tuple with [true, 0] if the game ends in a draw, [true, 1] if player 1 wins, [true, -1] if player 2 wins, and [false, 0] if the game is not over.
    //The board is 6 rows by 7 columns, with 0 being an empty space, 1 being a red piece, and -1 being a yellow piece.
    state() {
        //Check for vertical win
        let winEval = 1000 - (42-this.numMovesLeft());
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
                await sleep(10);
            }
            document.getElementById(`${i}${piece[2]}`).style.background = `#ffffff`;

        }
    }

    async processHumanMove(id) {
        //processes the human move
        if (this.humanTurn) {
            let col = id.substring(1);
            
                let index = this.add(col,this.humanPlayingRed);
                if(index=="-1") return;
                let clicked = [(this.humanPlayingRed -!this.humanPlayingRed), index[0], index[1]]
                
                    this.humanTurn = false;
                    await this.animate_fall(clicked);
                    this.draw();
                
                
            
            let gState = this.state();

            if (gState[0]) {
                this.endGame(gState);
                return;
            }

            if (!this.humanTurn) {

                    let move=getMoveCpp(!this.humanPlayingRed,Depth);
                    this.add(move,!this.humanPlayingRed);
                    let aiPiece = [(this.humanPlayingRed ? -1 : 1), this.mask[move], move];
                    await this.animate_fall(aiPiece);
                    this.draw()
                    this.humanTurn = true;
                }
            
            gState = this.state();
            if (gState[0]) {
                this.endGame(gState);
                return;
            }
        }
    }

    /**
     * Minimax algorithm, negamax would work but this does too so what ever.
     * @param {int} depth - Maximum search tree depth 
     * @param {boolean} maximizing - Playing for a win for yellow or for red?
     * @param {int} alpha 
     * @param {int} beta 
     * @returns board evaluation
     */
    minimax(depth, maximizing, alpha = -1000, beta = 1000) {
        /**
         * D12 Without transpos table - 12.8s, 10s, 34.5s, 2s, 2s, <1s
         */
        /**
         * D12 With transpos table - 37.5s, 5.9s, 11.6s, lost. I did the table wrong. 
         */
        let gameState = this.state();
        //TODO: Transpose table
        if (gameState[0]) {
            //console.table(this.board);
            return gameState[1];
        }
        if (depth <= 0) {
            //console.table(this.board);
            return 0;
        }
        if (maximizing) {

            let bestEval = -1000;
            let thisPos = bestEval;

            for (let j = 0; j < 7; j++) {
                let index=this.add(j,true);
                    if (index!="-1") {

                        
                        thisPos = this.minimax(depth - 1, false, alpha, beta);
                        //this.transposTable[this.hash()]=thisPos;
                        this.remove(j);
                        bestEval = Math.max(thisPos, bestEval);


                        if (bestEval >= beta) {
                            return bestEval;
                        }
                        alpha = Math.max(bestEval, alpha);
                        
                    }
                
            }
            return bestEval;
        }
        else {
            let bestEval = 1000-this.numMovesLeft()-1;
            let thisPos = 1000-this.numMovesLeft()-1;

            for (let j = 0; j < 7; j++) {
                let index=this.add(j,false);
                    if (index!="-1") {

                        
                        thisPos = this.minimax(depth - 1, true, alpha, beta);
                        //this.transposTable[this.hash()]=thisPos;
                        this.remove(j);
                        bestEval = Math.min(thisPos, bestEval);


                        if (bestEval <= alpha) {
                            return bestEval;
                        }
                        beta = Math.min(beta, bestEval);
                        
                    }
                
            }
            return bestEval;
        }
    }
    /**
     * Returns the best move for the computer to play
     * @param {boolean} playingRed - if the computer is playing the red pieces
     * @returns 
     */
    getComputerMove(Depth,playingRed) {
        let bestMove = [-1, -1];
        let bestEval = (playingRed ? -10000 : 10000);
        
        let tStart = performance.now();
        let moves = {}
        for (let j = 0; j < 7; j++) {
            let index=this.add(j,playingRed);
                if (index!="-1") {
                    
                    
                    let thisEval = this.minimax(Depth, !playingRed);
                    moves[index]=thisEval;
                    this.remove(j);
                    if (playingRed) {
                        if (thisEval > bestEval) {
                            
                            bestEval = thisEval;
                        }
                    } else {
                        if (thisEval < bestEval) {
                            
                            bestEval = thisEval;
                        }
                    }
                    
                }
            
        }
        if(bestEval!=0){
            let movesUntilWin = this.numMovesLeft()-(Math.abs(bestEval)-(1000-42));
            document.getElementById("WinFound").innerHTML = `${bestEval<0?"Yellow":"Red"} has a win in ${movesUntilWin/2<<0} moves.`;
        }
        let bestMoves = Object.keys(moves).reduce(function(bestMoves,pos){
            if(moves[pos]==bestEval){
                bestMoves[pos]=moves[pos];
            }
            return bestMoves;
        },{});
        var positions = Object.keys(bestMoves);
        let posChosen = positions[positions.length*Math.random()<<0];
        bestMove = [posChosen[0],posChosen[1]];
        let t = performance.now() - tStart;
        console.log(`Evaluated position in ${t} ms`);
        return bestMove;

    }
    endGame(gState){
        let humanWon = (this.humanPlayingRed-!this.humanPlayingRed)*gState[1]>0?"Niceeee":"Better luck next time...";
        this.humanTurn=false;
        document.getElementById("grid").style.backgroundColor="grey";
        let out = document.getElementById("outcome_text");
        if (gState[1] > 0) {
            out.innerHTML = "Red Wins!";
        } else if (gState[1] < 0) {
            out.innerHTML = "Yellow Wins!";
        } else {
            out.innerHTML = "Draw?!";
        }
        out.innerHTML+=`\n${humanWon}`;
        document.getElementById("outcome").style.display="block";
    }
}

function getMoveCpp(red,searchDepth){ 
    let tNow = performance.now();
    let i=cpp_best_move(red,searchDepth);
    console.log(`Finished in ${performance.now()-tNow}`);
    return i;  
}
//Red is the maximizing team. Red win evaluates to 1000
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
var cpp_best_move,cpp_add_move,cpp_remove,cpp_toString,cpp_init;
window.onload = function () {
    cpp_best_move=Module.cwrap('getBestMove',["number"],["string","boolean","number"]);
cpp_add = Module.cwrap('addMove',["number"],["number","boolean"]);
cpp_remove = Module.cwrap('removeMove',["number"],["number","boolean"]);
cpp_toString = Module.cwrap('boardToString',["string"],[null]);
cpp_init = Module.cwrap('init',[null],["number"]);
    initGrid();
    document.getElementById("d11_experimental").checked=false;
    
    let experimental = document.getElementById("d11_experimental");
    experimental.onclick = function(){
        toggleMaxInput();   
    };
    document.getElementById("close").onclick = function(){
        closeModal();
    }
    document.getElementById("SetDepth").oninput = function () {
        displaySliderValue();
    };
}
function initGrid(){
    //Get slot border width, splice off the "px"
    let borderWidth = $(".grid-item").css("border-left-width").slice(0,-2);
    
    let grid = document.getElementById("grid");
    
    
    let gridWidth = Math.min(window.innerWidth,window.innerHeight);
    grid.style.width =  gridWidth + "px";
    
    
    let slotDia = ((gridWidth/7)-2*borderWidth)<<0;
    let gridItems = document.getElementsByClassName("grid-item");
    for (let i = 0; i < gridItems.length; i++) {
        gridItems[i].style.height = slotDia+ "px";
        gridItems[i].style.width = slotDia + "px";
    }
    grid.style.height = 6*gridWidth/7 + "px";
}
function toggleMaxInput(){
    let CHK=document.getElementById("d11_experimental");
    let SLD = document.getElementById("SetDepth");
    if(CHK.checked){
        SLD.step=1;
        SLD.max=14;
        document.getElementById("maxDepth").innerHTML="14";
        
    }else{
    SLD.step=1;
    
    document.getElementById("maxDepth").innerHTML="11";
    SLD.max=11;
    }
    SLD.value=Depth;
        
    displaySliderValue();
}
function displaySliderValue() {
    
    var val = document.getElementById("SetDepth").value;//gets the oninput value
    Depth=val;
    document.getElementById('output').innerHTML = `(${val})`;//displays this value to the html page

}
var game;
async function start() {
    //document.getElementById("GameOutcome").innerHTML = "";
    cpp_init(maxPositions);
    document.getElementById("WinFound").innerHTML="";
    game = new Board();
    document.getElementById("d11_experimental").enabled=true;
    //document.getElementById("startButton").disabled=true;
    if (!game.humanPlayingRed) {
        e=document.getElementById("d11_experimental");
        game.add(3,true);
        await game.animate_fall([1, 5, 3]);
        game.draw();
        game.humanTurn = true;
    }   
}
function closeModal(){
    document.getElementById("outcome").style.display="none";
    document.getElementById("startButton").disabled=false;
}
