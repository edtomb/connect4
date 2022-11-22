# Connect 4
###### [Try it Here](https://ethantomb.github.io/connect4)
This human-vs AI connect 4 game uses a variable-depth minimax algorithm and is guaranteed to make you angry when you lose to it:

Q: What language did you use?

A: The front-end is written in JavaScript. The solver is written in C++ and compiled to WebAssembly using Emscriptein.

Q: How good is it? 

A: currently the solver is not optimized to solve the game completely. The solver searches an adjustable hard limit of moves, which is set by default to 1.5 million
Preliminary testing suggests a strong linear corelation between hard limit of moves and evaluation time, which would make sense from an algorithmic analysis standpoint. On google chrome, Windows Laptop with an intel core i7, the C++ solver evaluates approximately 730 positions per millisecond:
N(t) = 733.71t + 13673 : N(t) := Number of Positions per t:=ms
R^2 = 0.9986
![Plot](https://raw.githubusercontent.com/ethantomb/connect4/main/img/TimePositionsPlot.png)








