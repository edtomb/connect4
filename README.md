# Connect 4 Solver

I recently wrote a Connect 4 solver using C++. The frontend of the project is written in vanilla JavaScript, while the solver is written in C++ and compiled to webassembly through emscripten. The solver can be found on my GitHub page [here](https://edtomb.github.io/connect4)

## Initial Implementation

My initial implementation used a 2-D array to represent the game board and a minimax solver to determine the best move. However, I quickly realized that this approach was not efficient enough for the large number of possible board positions in Connect 4.

## Optimizations

To improve the performance of the solver, I switched to using a bitboard representation of the game board and implemented a negamax solver. This resulted in significant speed optimizations, as the bitboard representation allows for faster manipulation of the game state.

## Evaluation Time

~~I found that there is a linear correlation between the number of moves made in the game and the evaluation time of the solver.~~ On a Google Chrome browser on a Windows laptop with an Intel Core i7, the C++ solver evaluates approximately 730 positions per millisecond using the old solver. The equation for this is: <br>

N(t) = 733.71t + 13673

where N(t) is the number of positions per ms and t is the number of moves made in the game. <br> <br>
![plot](https://raw.githubusercontent.com/ethantomb/connect4/main/img/TimePositionsPlot.png)<br><br>
~~After the bitboard optimizations, the solver is able to process 4934 positions per millisecond on the same hardware, which yields a 500% increase in speed. the equation is : ~~
~~N(t) (new solver) = 4934*t + 1.09E+06.~~  <br><br>
Edit: The marvelous emscripten O3 compiler flag negates this. The solver evaluates most positions pretty much imediately, and evaluates upwards of 14000 moves per ms. However, there are some cases where the bot will follow the best line, then suddenly veer off and play an incorrect move. I'm still working on fixing this, not sure what is causing it. Its probably a greater than equals somewhere where theres supposed to be a greater than, or something silly like that. That being said, it still instantly outsmarts me
## Limitations

Currently, the solver is not optimized to solve the game completely. However, it is still able to provide a strong AI opponent for the player.
