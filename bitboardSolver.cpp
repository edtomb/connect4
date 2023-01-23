#include <iostream>
#include <map>
// Need this to compile on windows with G++ idk why.
#define INT_MIN (-2147483647 - 1)
#define MAX_SIZE 16000000
using namespace std;
const int EXPLORE_ORDER[7] = {3,4,2,1,5,0,6};
/**
 *==============================================================================================================================*
 * The board object                                                                                                             *
 * Stores the max negamax search depth, the current position bitboard, the bitmask, and the number of moves played              *
 *::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::*
 * Convention:                                                                                                                  *
 * (uint64_t) cur_pos:   64 bit unsigned integer representing the board from the current player's perspective.                  *
 *                       Slots are filled in bottom to top, left to right with one buffer on top to make play                   *
 *                       function work there are zeros in every slot where theres a player 2 piece, 1s for                      *
 *                       every player 1 piece                                                                                   *
 *                                                                                                                              *
 * (uint64_t) mask:      64 bit unsigned integer representing the mask. There is a 1 in at every bit where                      *
 *                       there is a piece.                                                                                      *
 *                                                                                                                              *
 * (int) moves:         The number of moves on the board so far.                                                                *
 *                                                                                                                              *
 * (int) DEPTH_MAX:     The maximum search depth for the negamax algorithm                                                      *
 *::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::*
 *==============================================================================================================================*
 */
class Board
{
public:
    /**
     * Board empty constructor.
     * Initializes an empty board with depth_max maximum search depth
     * @param depth_max - Maximum negamax search depth
     */
    Board()
    {
        cur_pos = 0;
        mask = 0;
        moves = 0;
    }
    /**
     * Board copy constructor
     * Initializes a board from a previous position
     * @param oldB - The board to copy from
     */
    Board(Board &oldB)
    {
        cur_pos = oldB.cur_pos;
        mask = oldB.mask;
        moves = oldB.moves;
    }
    /**
     * Resets a board to its default state.
     * @param depth - The max search depth to reset to(User can change it in between games on the front end)
     */
    void reset()
    {
        cur_pos = 0;
        mask = 0;
        moves = 0;
    }
    /**
     * Checks if a column is a valid move
     * @param col: the column to check
     */
    bool canPlay(int col)
    {
        /*A 64 bit int with a 1 the bit position of the  top row of the column being checked.
        If calling canPlay(0), top would look like this: (000...0100000)
        ##uint64_t top = (UINT64_C(1) << 5 << (7 * col));
        I dont know how emscripten compiles, so maybe one lining this will afford some speed improvements.
        Bitwise and operation between the bitmask and the top of the column to check.
        If there is an empty slot in the column being checked, top & mask will contain all zeros
        */
        return ((UINT64_C(1) << 5 << (7 * col)) & mask) == 0;
    }
    /**
     * Plays a move in the given column
     * @param col: The column to play da moov in
     * NOTE: The earth will shatter into a million tiny pieces if this is called on an empty collumn.
     */
    void play(int col)
    {
        /*An int64 with a 1 in the bit position corresponding to the bottom row of a given collumn.
        #uint64_t bot_cell = (UINT64_C(1) << (7 * col));
        Add the bottom cell to the collumn being played, this will shift every bit up by 1. Hence the importance
        of not calling play on a full collumn.
        */
        mask |= mask + (UINT64_C(1) << (7 * col));
        // xor the position with the mask to make the person(or bot) who just played's pieces all ones, and the opponents all zeros
        cur_pos ^= mask;
        moves++;
    }
    /**
     * Check for a win for the current player in O(1) using bit operations
     * NOTE: only checks for the player who just called the Play function.
     */
    bool fourInARow()
    {
        /*
        visual aid
        0 0 0 0 0 1 0
        0 0 0 1 1 0 0
        0 0 0 1 0 0 0
   here 1 1 1 1 0 0 0
        0 0 0 1 0 1 0
        0 0 1 0 1 0 0
        */
        // check horizontal match
        uint64_t check = cur_pos & (cur_pos >> 7);
        // checks for 2 in a row
        // Layers 1 collumn on top of the other. All rows where both cells are 1 stay 1. Otherwize, they become 0.
        // If 2 red pieces are next to each other in the position, Both cells will stay "1" in check.
        if (check & (check >> 14))
        {
            // Layers check on top of itsself again. Checks for 2- 2 in a row.
            return true;
        }
        // check vertical match
        check = cur_pos & (cur_pos >> 1);
        if (check & (check >> 2))
        {
            return true;
        }
        // check diag 1 match
        check = cur_pos & (cur_pos >> 8);
        if (check & (check >> 16))
        {
            return true;
        }
        // check other diag match
        check = cur_pos & (cur_pos >> 6);
        if (check & (check >> 12))
        {
            return true;
        }
        return false;
    }
    /**
     * String rep of the board
     */
    string toString()
    {
        uint64_t cpos = moves % 2 == 0 ? (cur_pos ^ mask) : cur_pos;
        string board = "";
        for (int row = 5; row >= 0; row--)
        {
            for (int col = 0; col < 7; col++)
            {
                int index = col * 7 + row;
                if ((cpos & (1ull << index)) != 0)
                {
                    board += "R";
                }
                else if ((mask & (1ull << index)) != 0)
                {
                    board += "Y";
                }
                else
                {
                    board += "O";
                }
            }
            board += "\n";
        }
        return board;
    }
    // If I wasn't lazy these would be private and have getters and setters
    // Alas, I am lazy.
    uint64_t cur_pos = 0;
    uint64_t mask = 0;
    int moves = 0;
};
int DEPTH_MAX=5;
map<uint64_t, int> table;

int bot_score;
/**
 * Negamax algorithm with alpha-beta pruning
 * Recursively evaluates the score of a position until the position is solved or max depth is reached
 * @param b - The connect 4 board
 * @param alpha - The worst possible score for the current player/best possible score for current player
 * @param beta  - The best possible score for the current player
 * @param depth - The search's current depth
 */
int negamax(Board &b, int alpha, int beta, int depth)
{

    // If board is full, then it is a draw
    if (b.moves == 42)
    {
        return 0;
    }
    // Play each collumn, if we have four in a row then we've won
    for (int i = 0; i < 7; i++)
    {
        if (b.canPlay(i))
        {
            // Make a copy of the board, play a move, if 4 in a row is detected, return
            //([width*height]-current number of played moves)/2, so that earlier winning moves are weighted more positively
            Board b2(b);
            b2.play(i);
            if (b2.fourInARow())
            {
                return (43 - b2.moves) / 2;
            }
        }
    }
    
    int max = (42-b.moves)/2;
    if(beta>max){
        beta=max;
        if(alpha>=beta){
            return beta;
        }
    }
    
    // If max search depth reached, return 0.
    if (depth > DEPTH_MAX)
    {
        return 0;
    }
    // Explore middle-right
    for (int i = 3; i < 7; i++)
    {
        if (b.canPlay(i))
        {
            // Make copy of the board, play a move for us
            Board b2(b);
            b2.play(i);
            // Run negamax for the opponent, our best score is the negative of their best score
            // Our beta(our best) is their alpha(their worst) our alpha(our worst) is their beta(their best)
            // Increment the depth
            int opponentScore = -negamax(b2, -beta, -alpha, depth + 1);
            // If oppoents best option is better than our current worst outcome, then change our worst outcome to reflect this
            
            //If score is better than the upper bound, we dont have to keep wasting time exploring more positions, were happy with this score. 
            if (opponentScore >= beta)
            {
                return opponentScore;
            }
            // Reduce the alpha beta window with more favorable lower bound 
            if (opponentScore > alpha)
            {
                alpha=opponentScore;
            }
        }
    }
    //Explore middle-left
    for(int i=2;i<=0;i--){
        if (b.canPlay(i))
        {
            Board b2(b);
            b2.play(i);
            int opponentScore = -negamax(b2, -beta, -alpha, depth + 1);
            if (opponentScore >= beta)
            {
                return opponentScore;
            }
            if (opponentScore > alpha)
            {
                alpha=opponentScore;
            }
        }
    }
    return alpha;
}
/**
 * Finds the best move for a given position
 * @param board - The current position.
 * @param alpha - The alpha lower bound to run negamax with
 * @param beta  - The beta upper bound to run negamax with
 */
int bestMove(Board &b, int alpha, int beta)
{
    // Initialize the best col to play in (-1 := undefined)  and the best score for us (INT_MIN = horrible outcome)
    int bestMove = -1;
    int bestScore = INT_MIN;
    // play each possible collumn
    //Because the search time converges really quickly, we can probably afford to increase maxdepth as the search continues
    int odm = DEPTH_MAX;
    DEPTH_MAX = DEPTH_MAX + b.moves;
    
    int i;
    for (int x = 0; x < 7; x++)
    {
        i=EXPLORE_ORDER[x];
        if (b.canPlay(i))
        {
            Board b2(b);
            b2.play(i);
            // if we have four in a row, play that
            if (b2.fourInARow())
            {
                return i;
            }
            // Evaluate the position for the opponent
            int score = -negamax(b2, -beta, -alpha, 0);
            // cout<<score<<endl;
            // Take the most favorable route
            if (score > bestScore)
            {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    DEPTH_MAX=odm;
    bot_score=bestScore;
    return bestMove;
}
/**
 * JS EXPORTS
 */
extern "C"
{
    // Initialize board object
    Board b=Board();
    // Gets last played collumn, again this is only for getting the first move response
    int lpCol = 0;
    // The best first moves, its a bit cheeky but whatever
    int bestFirst[] = {3, 2, 2, 3, 2, 4, 5};
    int setDepth(int depth){
        DEPTH_MAX=depth;
        return 0;
    }
    /**
     * Resets the game, returns 0 for literally no reason idk why i added that
     * @param depth - The maximum search depth
     */
    int newGame(int depth)
    {
        setDepth(depth);
        b.reset();
        table.clear();
        return 0;
    }
    /**
     * JavaScript Board::Play wrapper
     * If a move is legal, plays the move, returns -1 if cannot play the move
     */
    int playMove(int col)
    {
        if (b.canPlay(col))
        {
            b.play(col);
            lpCol = col;
            return col;
        }
        return -1;
    }
    /**
     * Javascript bestMove() wrapper, returns the best move
     */
    int getBestMove()
    {
        // cout << "Searching for move with depth " << DEPTH_MAX << endl;
        // cout << "The Current position: \n"<< b.toString() << endl;
        // If its the first move, play the best response. We wont be finding the accurate best moves until deeper into the game. Still not a perfect solver sadge
        if (b.moves == 1)
        {
            return bestFirst[lpCol];
        }
        return bestMove(b, -1000, 1000);
    }
    int getBotScore(){
        return bot_score;
    }
    
}
