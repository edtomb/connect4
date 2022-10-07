# Connect 4
###### [Try it Here](https://ethantomb.github.io/connect4)
This human-vs AI connect 4 game uses a variable-depth minimax algorithm and is guaranteed to make you angry when you lose to it:

Q: What language did you use?

A: The front-end is written in JavaScript. The solver is written in C++ and compiled to WebAssembly using Emscriptein.

Q: How good is it? 

A: currently the bot is not optimized to solve the game completely. The bot searches a max of 1.5 million positions. 

Q: Only 1.5 million?! Thats really bad!

A: Sorry. In the future, I hope to add more optimizations. For example, replacing the current 2d array with a bitboard representation, adding a transposition table, hard coding the first 4 moves.





