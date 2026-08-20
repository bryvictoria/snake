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

### 4. Phase 4 Strategies

**4.1 Standard A\* for greedy hunt and tail-chase**
Replaced the original greedy implementation with proper A\* using open sets, closed sets, and a priority queue for optimal pathfinding.

**4.2 Capped DFS coiling**
DFS heuristic starts by targeting farthest from apple (coiling behavior), but after 2000 forward steps it switches to nearest to apple. Coil for space, then strike.

**4.3 ~~Quadrant containment~~ (scrapped)**
Idea was to bias or restrict pathfinding to the quadrant where the apple appears, either via `isPassable` blocking or adding a penalty of +10 to `h` for tiles outside the active quadrant. Scrapped — the containment itself risked trapping the snake inside the quadrant.

**4.4 Periodic board defrag via depth-capped DFS cleanup**
Every 100 points, a `dfsCleanup` routine automatically triggers. The original plan explored a textbook BFS flood-fill capped by depth, but that required a separate DFS pass to connect all touched nodes — so that was scrapped. Instead, the existing DFS was extended to support depth-capping natively. With no goal set, DFS just goes as deep as it can and naturally coils against whichever wall it reaches first. The result defragments the board and returns to greedy hunt from a clean, open position.

**4.5 dfsCleanup as last-resort when tail is unreachable**
Tail-chase survival mode breaks down when the tail itself is unreachable — there is nowhere safe to go. `dfsCleanup` was extended to handle this case: when both the apple and the tail are blocked, the cleanup routine takes over as the last-resort fallback, coiling the snake out of the deadlock.

**4.6 BFS pre-check before A\* in survival mode (planned)**
While in survival mode, re-attempting full A* to the apple on every step burns CPU even when the apple is obviously still unreachable. Plan: every nth step, run a cheap BFS reachability check to the apple first; only fall through to A* once BFS confirms the apple can be reached. Cuts wasted A* calls during long survival stretches.

**4.7 Capped BFS enclosure check on apple (planned)**
Still within survival mode: before committing to a hunt, run a capped BFS flood-fill starting from the apple to check whether it's sitting in an enclosed pocket (surrounded by snake body/walls with too little free space). If the apple is enclosed, skip hunting it and stay in survival/cleanup instead of wasting a path attempt on an apple that would trap the snake.

**4.8 Phase 4 final benchmark**
Phase 4 (A*/DFS/BFS survival strategy work) closed out with a per-board benchmark run, measured against a self-set transition threshold of 30% occupancy on the 100x100 board, 40% on the 50x50 board, and 50% on everything smaller. All boards cleared their threshold, all runs ended the same way — trapped during `dfsCleanup`/`DEFRAGGING`:

| Board | Size | Score | Occupancy | Threshold |
|---|---|---|---|---|
| warmup | 10x10 | 62 | 72% | 50% |
| classic | 20x20 | 299 | 78% | 50% |
| dense | 30x30 | 525 | 60% | 50% |
| heavyweight | 50x50 | 1393 | 56.12% | 40% |
| marathon | 100x100 | 3626 | 37% | 30% |

### 5. Hamiltonian Cycle (planned)
A path that visits every cell on the board exactly once. When all other strategies fail, the snake follows this cycle indefinitely — guaranteed never to die.

## Future Improvements & Known Limitations

Every benchmark run in 4.8 died the same way — trapped during `dfsCleanup`/`DEFRAGGING`. Three specific gaps in the strategy explain the ceiling:

1. **Greedy hunt isn't time-aware.** A* checks whether a cell is occupied *now*, not whether it'll be occupied by the time the snake actually arrives there — causing unnecessary scattering. Fix: implement Time-Space A* for greedy hunt, where occupancy is checked against the specific time step of arrival.

2. **Proactive survival's look-ahead doesn't check for enclosure.** The tail-test only verifies *a* path to the tail exists — not whether the resulting pocket of space is actually big enough to hold the snake's full body. Fix: add a flood-fill check on top of the tail-test — pass only if a BFS flood-fill shows enough free space for the snake's length, and a simulation of the snake moving through it actually reaches the tail.

3. **Reactive survival is missing the tail-to-head retrace that proactive survival already has.** That retrace lets the snake safely loop back onto itself when re-approaching its own tail. Proactive survival applies it; reactive survival doesn't — and that asymmetry accounts for the death pattern above: the reactive path runs out and falls through to `dfsCleanup` instead of retracing, not because cleanup itself is flawed. Fix: extend the same tail-to-head retrace to the reactive survival path.

Applying all three is expected to push consistency to roughly 80–90%.

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

Years later, I picked it up again — rewrote it for the browser, built a proper survival strategy on top of A*, discovered the tail-chase trick, and now the snake consistently hunts hundreds of apples. The full solution isn't done yet, but it's a different project now than it was back then.

## Roadmap

- [x] Manual snake game
- [x] A* pathfinding to apple
- [x] DFS tail-chase survival mode
- [x] Real-time obstacle simulation on A*
- [x] Real-time obstacle simulation on DFS
- [ ] Safety look-ahead before grabbing apple
- [ ] Longest path stalling
- [ ] Hamiltonian cycle fallback

Here is the updated benchmark table including the **Min Board Coverage (%)** for each grid size:

## Snake AI Benchmark Results

| Grid Size | Max Board Capacity | Run Count | Min Score | Max Score | Avg Score | Min Coverage (%) | Avg Coverage (%) | Max Coverage (%) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **10 × 10** | 100 | 10 | 30 | 84 | 64.1 | **40.0%** | 73.3% | **94.0%** |
| **20 × 20** | 400 | 1 | 315 | 315 | 315.0 | **79.3%** | 79.3% | **79.3%** |
| **30 × 30** | 900 | 9 | 260 | 640 | 405.7 | **29.1%** | 45.3% | **71.3%** |
| **50 × 50** | 2,500 | 7 | 575 | 1,850 | 1,306.1 | **23.1%** | 52.4% | **74.4%** |
| **100 × 100** | 10,000 | 1 | 3,626 | 3,626 | 3,626.0 | **36.3%** | 36.3% | **36.3%** |

New BenchMark
10x10
GAMEOVER! SCORE:80 CLEANUP | DEFRAGGING 82.0%
GAMEOVER! SCORE:76 CLEANUP | DEFRAGGING 86.0%
GAMEOVER! SCORE:66 CLEANUP | DEFRAGGING 76.0%
GAMEOVER! SCORE:30 CLEANUP | DEFRAGGING 40.0%
GAMEOVER! SCORE:45 CLEANUP | DEFRAGGING 55.0%
GAMEOVER! SCORE:84 CLEANUP | DEFRAGGING 94.0%
GAMEOVER! SCORE:66 CLEANUP | DEFRAGGING 76.0%
GAMEOVER! SCORE:58 CLEANUP | DEFRAGGING 68.0%
GAMEOVER! SCORE:66 CLEANUP | DEFRAGGING 76.0%
GAMEOVER! SCORE:70 CLEANUP | DEFRAGGING 80.0%

20x20
GAMEOVER! SCORE:315 CLEANUP | DEFRAGGING 79.3%
GAMEOVER! SCORE:358 CLEANUP | DEFRAGGING 91.8%
GAMEOVER! SCORE:270 CLEANUP | DEFRAGGING 69.8%
GAMEOVER! SCORE:300 CLEANUP | DEFRAGGING 77.3%

30x30
GAMEOVER! SCORE:380 CLEANUP | DEFRAGGING 42.4%
GAMEOVER! SCORE:320 CLEANUP | DEFRAGGING 35.8%
GAMEOVER! SCORE:460 CLEANUP | DEFRAGGING 51.3%
GAMEOVER! SCORE:261 CLEANUP | DEFRAGGING 29.2%
GAMEOVER! SCORE:440 CLEANUP | DEFRAGGING 49.1%
GAMEOVER! SCORE:640 CLEANUP | DEFRAGGING 71.3%
GAMEOVER! SCORE:321 CLEANUP | DEFRAGGING 35.9%
GAMEOVER! SCORE:569 CLEANUP | DEFRAGGING 63.4%
GAMEOVER! SCORE:260 CLEANUP | DEFRAGGING 29.1%

50x50
GAMEOVER! SCORE:575 CLEANUP | DEFRAGGING 23.1%
GAMEOVER! SCORE:1426 CLEANUP | DEFRAGGING 57.1%
GAMEOVER! SCORE:975 CLEANUP | DEFRAGGING 39.1%
GAMEOVER! SCORE:1317 CLEANUP | DEFRAGGING 52.8%
GAMEOVER! SCORE:1250 CLEANUP | DEFRAGGING 50.1%
GAMEOVER! SCORE:1750 CLEANUP | DEFRAGGING 70.1%
GAMEOVER! SCORE:1850 CLEANUP | DEFRAGGING 74.4%

100x100
GAMEOVER! SCORE:3626 CLEANUP | DEFRAGGING 36.3%
