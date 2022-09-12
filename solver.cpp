// max example
#include <iostream> 
#include <algorithm>
#include <string.h>
#include <vector>
using namespace std;
class connect4Board
{
public:
    connect4Board(const string s1, const string s2,int maxSearchPositions=1500000)
    {
        //C++ sucks!
        maxPositions=maxSearchPositions;
        string startingposition=s1+s2;
        
        if (startingposition.size() != 42)
        {
            
            
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
       
    }
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
    }
    int add(int col, bool playingRed)
    {
        if (mask[col] == 0)
        {
            return -1;
        }
        mask[col]--;
        int row = mask[col];
        board[row][col] = playingRed - !playingRed;
        return row;
    }
    void remove(int col)
    {
        board[mask[col]][col] = 0;
        mask[col]++;
    }
    int numMovesPlayed()
    {
        int n = 0;
        for (int i = 0; i < 6; i++)
        {
            for (int j = 0; j < 7; j++)
            {
                n += board[i][j] == 0;
            }
        }
        return 42 - n;
    }
    bool isWinningMove(int col, bool red)
    {
        if (add(col, red) == -1)
            return false;

        int var[2];
        state(var);
        remove(col);
        // Return game is over at position and evaluation is winnning
        return var[0] && var[1] * (red - !red) > 0;
    }
    // Expects var to be a pointer to a 2d array of ints
    // var[0]: 0=no winner 1=winner.
    // var[1]: rows*cols-number of moves left * 1 if red wins, -1 if yellow wins
    void state(int *var)
    {
        int eval = (rows * cols - numMovesPlayed() + 1) / 2;
        for (int i = 0; i < 6; i++)
        {
            for (int j = 0; j < 7; j++)
            {
                if (board[i][j] == 0)
                {
                    continue;
                }
                int color = board[i][j];
                int count = 1;
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
        var[0] = 0;
        var[1] = 0;
    }
    // Finds current board eval
    int minimax(bool maximizing, int depth, int alpha = -1000, int beta = 1000)
    {
        numevaluated+=1;
        int var[2];
        state(var);
        if (var[0] == 1)
        {
            return var[1];
        }
        int best;
        //Check if any of the next  moves would win on the spot
        if (maximizing)
        {
            
            
            for (int i = 0; i < 7; i++)
            {
                if (isWinningMove(i, true))
                {
                    return (rows * cols - numMovesPlayed() + 1) / 2;
                }
            }
        }
        else{
            
            int maxscore = -(rows * cols - numMovesPlayed() - 1) / 2;
            for (int i = 0; i < 7; i++)
            {
                if (isWinningMove(i, false))
                {
                    return -(rows * cols - numMovesPlayed() + 1) / 2;
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
           
            int maxscore = (rows * cols - numMovesPlayed() - 1) / 2;
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
            int maxscore = -(rows * cols - numMovesPlayed() - 1) / 2;
            
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
    // Finds best move
    // bool: red - true, yellow - false
    int bestMove(bool color, int depth)
    {
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
    int maxPositions;
    int numevaluated=0;
    int rows = 6, cols = 7;
    int board[6][7];
    int mask[7] = {6, 6, 6, 6, 6, 6, 6};
};
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

int main()
{

    string encodedPos = "101111112111111011111121111112101110222001";
    connect4Board *boardFromString = new connect4Board(encodedPos,"");

    cout << boardFromString->toString() << endl;
    cout << boardFromString->bestMove(true, 12) << endl;
    cout << boardFromString->bestMove(false, 12) << endl;
    // boardFromString->add(0, true);
    cout << boardFromString->toString() << endl;

    return 0;
};