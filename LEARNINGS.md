# Learnings & Technical Insights

Things discovered while building this project.

---

## Performance Optimization: BFS 25ms → 2.4ms, A* 30ms → 5ms (10,000 nodes)

### 1. Integer position ID instead of string keys

The old code used `JSON.stringify([x,y])` or string concatenation (`x + ',' + y`) to identify positions. String operations allocate memory on the heap every time.

The fix: compute a single integer ID for each tile.

```js
_key(pos) {
    return pos[0] / tileSize + pos[1] / tileSize * boardWidth
}
```

One integer math operation replaces string allocation. Every lookup, every comparison, every storage operation becomes cheaper. This ID is used thousands of times per `generatePath()` call — the savings compound.

This works by applying the pagination trick: treat the 2D grid like a flattened 1D array. Each `(x, y)` coordinate maps to a unique integer index the same way page items map to a flat list — `index = col + row * width`. As long as width is fixed, every position gets a unique ID with no collisions, and the 2D array is fully representable as a linear array.

---

### 2. Typed arrays (`Uint8Array`) instead of `Set` for visited tracking

Old: `visitedNodes = new Set()` — dynamic, heap-allocated, hash-based lookup.

New: `visitedNodes = new Uint8Array(10000).fill(0)` — pre-allocated, contiguous memory, O(1) array access.

```js
// Before
visitedNodes.has(JSON.stringify(point))   // string allocation + hash

// After
visitedNodes[posId] === 1                 // direct array index
```

`Uint8Array` lives in a fixed block of memory — no garbage collection, no hashing. Checking or setting a flag is a single memory read/write. `isVisited()` is called for every neighbor of every node — with 10,000 nodes and 4 neighbors each, that's 40,000 calls per search.

---

### 3. Pre-allocated fixed-size array for node storage

Old: nodes stored in a dynamic growing structure — JS had to resize and reallocate as nodes were added.

New: `nodes = new Array(100 * 100).fill(null)` — allocated once at search start, indexed directly by position ID.

```js
nodes[posId] = nodeData   // direct write, no hash, no resize
```

Memory allocation during a hot loop is expensive. Pre-allocating removes all mid-search allocation.

---

### 4. Array-of-primitives instead of object per node (BFS)

Old BFS nodes: `{ x, y, p, g }` — JS objects with named properties, stored on heap.

New BFS nodes: `[x, y, parentId, g]` — plain array, property access by index.

Array index access (`node[0]`) is faster than named property access (`node.x`) because JS engines optimize fixed-index arrays more aggressively than dynamic objects.

---

### 5. `Set` for obstacle lookup instead of linear scan

Old:
```js
for(let obstacle of this.obstacles){
    if(this.collides(obstacle, node)) return false
}
```
O(n) — checks every body segment on every neighbor candidate.

New:
```js
obstacleSet = new Set(obstacles.map(i => _key(i)))
obstacleSet.has(key)   // O(1)
```

As the snake grows to hundreds of segments, the old approach slows down proportionally. The Set makes obstacle checking constant time regardless of snake length.

`Set.has()` is O(1) vs `Array.includes()` which is O(n). The reason: a Set is essentially an associative array where the value itself is hashed and used as the index — so lookup is a direct jump, not a scan.

---

### 6. Inline neighbor loop instead of `map` + `filter`

Old:
```js
directionsMap.map((i, index) => [pos[0]+i[0], pos[1]+i[1]])
             .filter(i => isPassable(i) && !isVisited(i))
```
Creates two intermediate arrays per node — one from `map`, one from `filter`. Both get garbage collected.

New: explicit `for` loop, compute each neighbor inline, check and skip immediately. No intermediate arrays, no GC pressure.

---

### 7. Queue stores integer IDs, not position arrays

Old: `queue.enqueue([x, y, f])` — enqueues an array object.

New: `queue.enqueue(posId, f)` — enqueues a single integer.

Less data per queue entry, less allocation, simpler dequeue.

---

## Preventing Unintended Mutation via Reference Sharing

In JavaScript, arrays and objects are passed by reference. Directly assigning a path position to the snake head meant the head's position and the path node were the same object in memory.

```js
// Before — dangerous
this.chain[0].position = this.path.shift()

// After — safe
this.chain[0].position = [...this.path.shift()]
```

When the tail cascade then copied positions down the chain (`chain[i].position = chain[i-1].position`), all segments ended up pointing to the same reference. Mutating one mutated all.

Spreading (`[...arr]`) or cloning creates a new array with the same values, breaking the shared reference. Same applies to objects — use `{...obj}` or `structuredClone()` when you need a true independent copy.

Also related: `shift()` and `unshift()` are both O(n) — they remove or insert at the front of the array, forcing every remaining element to re-index and bubble up. On large arrays this is a significant cost. A queue implemented with a head pointer or a circular buffer avoids this.

---

## Implementing Search Algorithms from Scratch

A*, BFS, and DFS all have well-documented textbook implementations. As a personal challenge, all three were implemented here based only on their concepts — without following or referencing the standard code.

My version of A* became a **greedy best-first search** — it followed the heuristics straight to the goal. Because A* doesn't backtrack, going straight for the lowest f score sometimes led the snake into a trap with no way out. To address that limitation, a proper A* was implemented with closed sets, open sets, and a priority queue ordered by f.

My version of DFS, however, turned out to be a **legitimate variant** of the standard algorithm. It explores depth-first, backtracks when stuck, and maintains the actual path in real time. The extensions — heuristic-guided neighbor selection, real-time obstacle simulation, depth capping — are built on top of a sound foundation.

---

## General Principles

- **Pre-allocation beats dynamic allocation** — allocate once outside the hot loop, reuse every call.
- **Typed arrays beat Sets/Maps for dense integer keys** — when your key space is bounded and integer-indexed, `Uint8Array` or `Int32Array` is almost always faster than a hash structure.
- **Arrays of primitives beat arrays of objects** — less heap pressure, better engine optimization.
- **O(1) lookups matter at scale** — a linear scan that's fast enough at snake length 10 becomes a bottleneck at length 500.
- **Avoid intermediate allocations in hot loops** — every `map`, `filter`, `JSON.stringify` inside a tight loop creates garbage the GC has to clean up.
- **Basic `for` loop beats array functions on large data** — `map`, `filter`, `forEach` all create intermediate arrays or invoke callbacks with overhead. A plain `for` loop does none of that.
