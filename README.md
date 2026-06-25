# AI Snake

A self-playing Snake game powered by classical AI search algorithms.

## Demo

**Live:** https://bryvictoria.github.io/snake

The snake plays itself — no human input required. It uses a hierarchy of strategies to survive as long as possible, automatically escalating to more conservative behavior as the board fills up.

## How It Works

The AI operates in layers, each kicking in when the one above it fails:

### 1. A* Search (primary)
The snake's default strategy. On each apple spawn, A* pathfinds from the head to the apple using Manhattan distance as the heuristic, with Euclidean distance as a tiebreaker. A subtle nudge multiplier (`1.0001`) biases paths toward the goal when scores are equal.

As the path is built, the simulated snake body slides forward in real time — cells that will be vacated by the time the snake arrives are treated as passable. This prevents the algorithm from avoiding positions that are only temporarily occupied.

### 2. Survival Mode — Tail Chase via DFS (fallback)
When A* cannot find a path to the apple (the snake has boxed itself in), the game enters survival mode. A Depth-First Search targets the snake's own tail instead, keeping the snake moving safely. The DFS also simulates body movement along the path in real time.

Rather than following the entire tail-chase path at once, the snake takes a random 2–5 steps, then re-attempts A* to see if the apple is reachable again. This gradually repositions the snake until an opening appears.

### 3. Safety Look-ahead (in progress)
Before committing to an A* path to the apple, the AI will simulate eating it and verify: *can the tail still be reached afterward?* If not, it skips the apple and stalls instead. This prevents the most common cause of death — grabbing an apple that leads to a dead end.

### 4. Hamiltonian Cycle (planned)
A path that visits every cell on the board exactly once. When all other strategies fail, the snake follows this cycle indefinitely — guaranteed never to die.

## Controls

| Key | Action |
|-----|--------|
| `Space` | Pause / Resume |
| Arrow keys | Override AI direction |

## Architecture

| File | Role |
|------|------|
| `main.js` | Game loop, scoring, strategy orchestration |
| `Snake.js` | Snake entity, movement, collision detection |
| `StarSearch.js` | A* pathfinding implementation |
| `DepthFirstSearch.js` | DFS pathfinding with backtracking |
| `Apple.js` | Apple entity, random placement |
| `GameObject.js` | Base class for game entities |

## Technical Notes

- Board: 400×400px canvas, 4px tile size (100×100 logical grid)
- Snake body is passed as the obstacle list to both search algorithms
- Both algorithms simulate body movement along the computed path during search, not just at the current frame

## History

This project started in 2013 when I was exploring WPF in .NET — just trying out UI development. One thing led to another and I built Snake. Then I wanted to push it further and tried to make it play itself, learned about A* and wrote my own implementation. It barely scored under 10 apples. I was 22, passionate but still finding my footing as a programmer.

Work got in the way and the AI snake was abandoned.

Years later, I picked it up again — rewrote it for the browser, built a proper survival strategy on top of A*, discovered the tail-chase trick on my own, and now the snake consistently hunts hundreds of apples. The full solution isn't done yet, but it's a different project now than it was back then.

## Roadmap

- [x] Manual snake game
- [x] A* pathfinding to apple
- [x] DFS tail-chase survival mode
- [x] Real-time obstacle simulation on A*
- [x] Real-time obstacle simulation on DFS
- [ ] Safety look-ahead before grabbing apple
- [ ] Longest path stalling
- [ ] Hamiltonian cycle fallback
