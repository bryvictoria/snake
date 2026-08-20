import StarSearch  from './StarSearch.js'
import BreadthFirstSearch  from './BreadthFirstSearch.js'
import DepthFirstSearch  from './DepthFirstSearch.js'
import Hamiltonian from './Hamiltonian.js'

export default class PathManager{
    #starSearch
    #dfSearch
    #bfSearch
    #hamiltonian
    #board
    ctx
    constructor(){

        let canvas = document.getElementById('game')
        this.ctx = canvas.getContext('2d')
        
        this.#starSearch = new StarSearch()
        this.#bfSearch = new BreadthFirstSearch()
        this.#dfSearch = new DepthFirstSearch()
        this.#hamiltonian = new Hamiltonian()

        

        
    }


    setBoard(board){
        this.#starSearch.setBoard(board)
        this.#dfSearch.setBoard(board)
        this.#bfSearch.setBoard(board)
        this.#hamiltonian.setBoard(board)
        this.#board = board
    }
    generateHamiltonianPath(){
        return this.#hamiltonian.generateCombPath()
    }
    getHamiltonianSequence(){
        return this.#hamiltonian.getPosSequence()
    }

    
    getHamiltonianMove(state){
        
        if(!this.#hamiltonian.hasPath()){
            // this path finder must decide which pattern to do cause its the path finder. if later on implemented random, maze, whirlpool, or burdpeouten pattern
            this.#hamiltonian.generateCombPath()
        }
        return this.#hamiltonian.getPathToTarget(state.snake.chain.map(i => i.position),state.apple.position)
    }

    getHamiltonianPath(chain,target){
        
        return this.#hamiltonian.getApplePath(chain,target)
    }

    getHuntPath(state){
        this.#starSearch.setTarget(state.apple)
        this.#starSearch.setChain(state.snake.chain)
        let startTime = performance.now()
        let path = this.#starSearch.generatePath()
        
        let endTime = performance.now()

        return path
    }

    getStarPath(chain,goal){

        this.#starSearch.setTarget({position:goal})
        this.#starSearch.setChain(chain)
        
        const path = this.#starSearch.generatePath()
        const reached = this.#starSearch.isGoalFound()

        return {path,reached}
    }

    getShortestPath(chain,goal){
        
        this.#dfSearch.nudge = false
        this.#dfSearch.setTarget({position:goal})
        this.#dfSearch.setMaxCoiling(0)
        this.#dfSearch.setChain(chain)
        this.#dfSearch.setAnchor(null)
        this.#dfSearch.setBounded(false)
        const path = this.#dfSearch.generatePath()
        const reached = this.#dfSearch.isGoalFound()
        return {path,reached}
    }

    isAdjacent(from,to){
        return this.#starSearch.computeManhattanDistance(from,to) === this.#board.tileSize
    }

    getFloodFill(chain,max){
        this.#bfSearch.setTarget({position:[-4,-4]})
        this.#bfSearch.setChain(chain)
        const path = this.#bfSearch.generatePath(max)
        const reached = this.#bfSearch.isGoalFound()
        const nodes = this.#bfSearch.getNodeCount()
        return {path,reached,nodes}
    }

    getBreadthPath(chain,goal){
        this.#bfSearch.setTarget({position:goal})
        this.#bfSearch.setChain(chain)
        const path = this.#bfSearch.generatePath()
        const reached = this.#bfSearch.isGoalFound()
        const nodes = this.#bfSearch.getNodeCount()
        
        return {path,reached,nodes}
    }

    
    getDepthFirstPath(chain,goal,anchor = null,obstacle = false){
        this.#dfSearch.nudge = false
        this.#dfSearch.setTarget(goal)
        this.#dfSearch.setMaxCoiling(chain.length)
        this.#dfSearch.setChain(chain)
        this.#dfSearch.setAnchor(anchor)
        this.#dfSearch.setBounded(false)
        if(obstacle)
            this.#dfSearch.setObstacle(chain.map(i => i.position))
        const path = this.#dfSearch.generatePath()
        const reached = this.#dfSearch.isGoalFound()

        return {path,reached}
    }

    getTransitionPath(snake,obstacle = [],cap){
        
        this.#dfSearch.setCap(snake.chain.length * 1)
        this.#dfSearch.setChain(snake.chain)
        this.#dfSearch.setTarget({position:[-4,300]})
        this.#dfSearch.setAnchor({position:[-4,300]})
        this.#dfSearch.setBounded(true)
        this.#dfSearch.setMaxCoiling(10000)
        this.#dfSearch.setObstacle(obstacle)
        
        let path = this.#dfSearch.generatePath()
        this.#dfSearch.setBounded(false)

        return path
    }
    getCleanupPath(snake){
        
        this.#dfSearch.setCap(snake.chain.length * 1.5)
        this.#dfSearch.setChain(snake.chain)
        this.#dfSearch.setTarget({position:[-4,-4]})
        this.#dfSearch.setBounded(true)
        
        let path = this.#dfSearch.generatePath()
        this.#dfSearch.setBounded(false)

        return path
    }
    draw(ctx){

        this.#starSearch.draw(this.ctx)
        this.#bfSearch.draw(this.ctx)
        this.#dfSearch.draw(this.ctx)
        this.#hamiltonian.draw(this.ctx)
    }

}