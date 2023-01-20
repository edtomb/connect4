
#include <iostream> 
#include <algorithm>
#include <string>
#include <vector>
#include<unordered_map>
using namespace std;
/**
 * @brief The class for the connect 4 board. Contains the board and the methods to play the game.
 *
 * 
 */
class connect4Board
{
public:
    /**
     * @brief Construct a new connect4 Board object from string
     * 
     * @param s1 - First half of the string
     * @param s2 - Second half of the string - for some reason, the JS code sent a broken string, so halving the length fixed that problem
     * @param maxSearchPositions - Maximum number of positions that the minimax algorithm will search, regardless of the depth
     */
    connect4Board(const string s1, const string s2,int maxSearchPositions=1500000)
    {
        
        maxPositions=maxSearchPositions;
        string startingposition=s1+s2;
        
        if (startingposition.size() != 42)
        {
            cout << "Invalid starting position" << endl;
            return;  
        }
        int nextI = 0;
        char nextC;
        for (int i = 0; i < 6; i++)
        {
            for (int j = 0; j < 7; j++)
            {
                nextC = startingposition.at(nextI);
                if (!(nextC == '0' || nextC == '1' || nextC == '2'))
                {
                    cout << "Invalid starting position" << endl;
                    return;
                }
                // 0 is 48, 1 is 49. WTF?
                board[i][j] = (int)nextC - 1 - 48;
                nextI++;
            }
        }

        // make the mask for the board. The mask is an array of 7 ints, each int is the highest row that is not empty
        for (int i = 0; i < 7; i++)
        {
            for (int j = 0; j < 6; j++)
            {
                if (board[j][i] != 0)
                {
                    mask[i] = j;
                    break;
                }
            }
        }
        for (int i = 0; i < 6; i++)
        {
            for (int j = 0; j < 7; j++)
            {
                for (int k = 0; k < 2; k++)
                {
                    zobristTable[i][j][k] = rand();
                }
            }
        }
       
    }
    /**
     * @brief Default board constructor 
     * 
     * @param maxSearchPositions - Maximum number of positions that the minimax algorithm will search, regardless of the depth
     */
    connect4Board(int maxSearchPositions=1500000)
    {
        maxPositions=maxSearchPositions;
        for (int i = 0; i < 6; i++)
        {
            for (int j = 0; j < 7; j++)
            {
                board[i][j] = 0;
            }
        }
        for (int i = 0; i < 6; i++)
        {
            for (int j = 0; j < 7; j++)
            {
                for (int k = 0; k < 2; k++)
                {
                    zobristTable[i][j][k] = rand();
                }
            }
        }
    }
    /**
     * @brief Add a piece to the board
     * 
     * @param col - column to place the piece in
     * @param playingRed 
     * @return int - the row that the piece was placed in or -1 if attempting to add to a full collumn
     */
    int add(int col, bool playingRed)
    {
        // check if the column is full
        if (mask[col] == 0)
        {
            return -1;
        }
        //decrement the mask to signify a row shift up
        //The board is laid out such that the the bottom row is row 5, and the top row is row 0
        mask[col]--;
        int row = mask[col];
        //If playing red is true, this expression evaluates to 1-0, otherwise it evaluates to 0-1.
        board[row][col] = playingRed - !playingRed;
        nMovesPlayed+=1;
        return row;
    }
    /**
     * @brief Removes the top piece from a given collumn. This breaks if you try to call remove on an empty collumn, but that should never happen
     * 
     * @param col - The column to remove from
     */
    void remove(int col)
    {
        board[mask[col]][col] = 0;
        nMovesPlayed-=1;
        mask[col]++;
    }
    /**
     * @brief Returns the number of 0s left on the board. This slows my algorithm down a LOT in hindsight.... 
     * 
     * @return int - number of 0s left on the board
     */
    int numMovesPlayed()
    {
        return nMovesPlayed;
    }
    /**
    bool isInTranspositionTable(){
        return transpositionTable.find(hash())!=transpositionTable.end();
    }
    **/
    /**
     * @brief Checks if a given move wins the game for a given player
     * 
     * @param col - The column to play
     * @param red - True if the player is red, false if the player is yellow
     * @return true if the move wins the game
     * @return false if the move does not win the game
     */
    bool isWinningMove(int col, bool red)
    {
        if (add(col, red) == -1)
            return false;

        
        state(var);
        remove(col);
        // Return game is over at position and evaluation is winnning
        return var[0] && var[1] * (red - !red) > 0;
    }
    /**
     * @brief Returns the static evaluation of a position.
     * 
     * @param var - A pointer to an array of 2 ints. state will set var[0] to 1 if the game is over, 
     *              and var[1] to 0 for draw or game not over, or eavl= ((rows*cols)-numMovesPlayed)/2 if red wins, or -eval if yellow wins
     */
    void state(int *var)
    {
        int posContains0=1;
        int eval = (rows * cols - nMovesPlayed + 1) / 2;
        for (int i = 0; i < 6; i++)
        {
            for (int j = 0; j < 7; j++)
            {
                
                if (board[i][j] == 0)
                {
                    posContains0=0;
                    continue;
                }
                int color = board[i][j];
                int count = 1;
                // check horizontal
                for (int k = 1; k < 4; k++)
                {
                    if (j + k < 7 && board[i][j + k] == color)
                    {
                        count++;
                    }
                    else
                    {
                        break;
                    }
                }
                if (count == 4)
                {
                    var[0] = 1;
                    var[1] = eval * color;
                    return;
                }
                count = 1;
                // check vertical
                for (int k = 1; k < 4; k++)
                {
                    if (i + k < 6 && board[i + k][j] == color)
                    {
                        count++;
                    }
                    else
                    {
                        break;
                    }
                }
                if (count == 4)
                {
                    var[0] = 1;
                    var[1] = eval * color;
                    return;
                }
                count = 1;
                // check diagonal down
                for (int k = 1; k < 4; k++)
                {
                    if (i + k < 6 && j + k < 7 && board[i + k][j + k] == color)
                    {
                        count++;
                    }
                    else
                    {
                        break;
                    }
                }
                if (count == 4)
                {
                    var[0] = 1;
                    var[1] = eval * color;
                    return;
                }
                count = 1;
                // check diagonal up
                for (int k = 1; k < 4; k++)
                {
                    if (i + k < 6 && j - k >= 0 && board[i + k][j - k] == color)
                    {
                        count++;
                    }
                    else
                    {
                        break;
                    }
                }
                if (count == 4)
                {
                    var[0] = 1;
                    var[1] = eval * color;
                    return;
                }
            }
        }
        // If we get here, the game is not over
        var[0] = posContains0;
        var[1] = 0;
    }
    unsigned long int hash()
    {
        
        unsigned long long int hash = 0;
        for (int i = 0; i < 6; i++)
        {
            for (int j = 0; j < 7; j++)
            {
                hash ^= zobristTable[i][j][board[i][j]];
            }
        }
        return hash;
    }
    /**
     * @brief Evaluates the board for a given player
     * 
     * @param maximizing - Checking for a win for the maximizing player
     * @param depth - The depth of the search
     * @param alpha - The alpha value for alpha-beta pruning
     * @param beta  - The beta value for alpha-beta pruning
     * @return int - The evaluation of the board
     */
    int minimax(bool maximizing, int depth, int alpha = -1000, int beta = 1000)
    {
        numevaluated+=1;
        state(var);
        if (var[0] == 1)
        {
            //transpositionTable[hash()] = var[1];
            return var[1];
        }
        //if(isInTranspositionTable()){
        //    return transpositionTable[hash()];
        //}
        int best;
        //Check if any of the next  moves would win on the spot
        if (maximizing)
        {
            for (int i = 0; i < 7; i++)
            {
                if (isWinningMove(i, true))
                {
                    //transpositionTable[hash()] = (rows * cols - nMovesPlayed + 1) / 2;
                    return (rows * cols - nMovesPlayed + 1) / 2;
                }
            }
        }
        else{
            
            int maxscore = -(rows * cols - nMovesPlayed - 1) / 2;
            for (int i = 0; i < 7; i++)
            {
                if (isWinningMove(i, false))
                {
                    //transpositionTable[hash()] = -(rows * cols - nMovesPlayed + 1) / 2;
                    return -(rows * cols - nMovesPlayed + 1) / 2;
                }
            }
        }
        //End if max depth is reached or computational load is too high.
        if (depth == 0||numevaluated>maxPositions)
        {
            return 0;
        }

        
        if (maximizing)
        {
            best = -1000;
           
            int maxscore = (rows * cols - nMovesPlayed - 1) / 2;
            if (beta > maxscore)
            {
                beta = maxscore; // there is no need to keep beta above our max possible score.
                if (alpha >= beta)
                {

                    return beta;
                } // prune the exploration if the [alpha;beta] window is empty.
            }
            for (int i = 0; i < 7; i++)
            {
                if (mask[i] == 0)
                {
                    continue;
                }
                int row = add(i, true);
                best = max(best, minimax(0, depth - 1, alpha, beta));
                remove(i);
                alpha = max(alpha, best);
                if (beta <= alpha)
                {
                    break;
                }
            }
            return best;
        }
        else
        {
            best = 1000;
            int maxscore = -(rows * cols - nMovesPlayed - 1) / 2;
            
            if (alpha < maxscore)
            {
                alpha = maxscore; // there is no need to keep beta above our max possible score.
                if (beta <= alpha)
                {

                    return alpha; // prune the exploration if the [alpha;beta] window is empty.
                }
            }
            for (int i = 0; i < 7; i++)
            {
                if (mask[i] == 0)
                {
                    continue;
                }
                int row = add(i, 0);
                best = min(best, minimax(1, depth - 1, alpha, beta));
                remove(i);
                beta = min(beta, best);
                if (beta <= alpha)
                {
                    break;
                }
            }
            return best;
        }
    }
    /**
     * @brief Finds the best move for a given player by calling the minimax for each collumn
     * 
     * @param color - The color of the player
     * @param depth - The depth of the search
     * @return int - The collumn to play if you wanna win.
     */
    int bestMove(bool color, int depth)
    {
        
        if(nMovesPlayed==0){
            return 3;
        }else if(nMovesPlayed==1){
            for(int i=0;i<7;i++){
                if(mask[i]==5){
                    return bestFirstMoveYellow[i];
                }
            }
        }

        int bestEval = color ? -1000 : 1000;
        int bestCol = 0;
        int evals[7];
        for (int col = 0; col < cols; col++)
        {
            int row = add(col, color);
            if (row != -1)
            {
                evals[col] = minimax(!color, depth);

                remove(col);
                if (color && evals[col] > bestEval)
                {
                    bestEval = evals[col];
                    bestCol = col;
                }
                if (!color && evals[col] < bestEval)
                {
                    bestEval = evals[col];
                    bestCol = col;
                }
            }
        }
        //Debugging console logs.
        cout<<"Evaluated "+to_string(numevaluated)+" positions"<<endl;
        numevaluated=0;
        vector<int> bestMoves;
        cout<<"Best Evaluation: "<<bestEval<<endl;
        for (int i = 0; i < 7; i++)
        {
            if (evals[i] == bestEval && mask[i] != 0)
            {
                bestMoves.push_back(i);
            }
            
        }
       
        return bestMoves[rand() % bestMoves.size()];
    }
    /**
     * @brief String representation of the board.
     * 
     * @return string The board formatted as to make sense to the user.
     */
    string toString()
    {
        string s = "";
        for (int i = 0; i < 6; i++)
        {
            for (int j = 0; j < 7; j++)
            {
                s += to_string(board[i][j])+ " ";
            }
            s += "\n";
        }
        return s;
    }

private:
    //std::unordered_map<long long, int> transpositionTable;
    int zobristTable[6][7][2];
        
    int bestFirstMoveYellow[7] = {3, 2, 3, 3, 2, 4, 4};
    int var[2];
    int maxPositions;
    int nMovesPlayed=0;
    int numevaluated=0;
    int rows = 6, cols = 7;
    int board[6][7];
    int mask[7] = {6, 6, 6, 6, 6, 6, 6};
};
/**
 * @brief Function calls to be exported to webassembly.
 * 
 */
extern "C"
{
    connect4Board *gameboard;
    void init(int maxPositions=1500000){
        gameboard = new connect4Board(maxPositions);
        
    }
    
    int getBestMove(bool color, int depth)
    {
        return gameboard->bestMove(color, depth);
    }
    int addMove(int col, bool color)
    {
        int a=gameboard->add(col, color);
        return a;
    }
    void removeMove(int col)
    {
        gameboard->remove(col);
        
    }
    string boardToString()
    {
        return gameboard->toString();
    }
}
//No Main function >:)
