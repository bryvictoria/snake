import StarSearch  from './StarSearch.js'
import BreadthFirstSearch  from './BreadthFirstSearch.js'
import DepthFirstSearch  from './DepthFirstSearch.js'

export default class PathManager{
    #starSearch
    #dfSearch
    #bfSearch
    ctx
    constructor(){

        let canvas = document.getElementById('game')
        this.ctx = canvas.getContext('2d')
        
        this.#starSearch = new StarSearch()
        this.#bfSearch = new BreadthFirstSearch()
        this.#dfSearch = new DepthFirstSearch()

        

        
    }

    getHuntPath(state){
        this.#starSearch.setTarget(state.apple)
        this.#starSearch.setChain(state.snake.chain)
        let startTime = performance.now()
        let path = this.#starSearch.generatePath()
        
        let endTime = performance.now()
        //console.log('Time:'+(endTime-startTime)+'ms')

        return path
    }

    getStarPath(chain,goal){
        this.#starSearch.setTarget({position:goal})
        this.#starSearch.setChain(chain)
        const path = this.#starSearch.generatePath()
        const reached = this.#starSearch.isGoalFound()

        return {path,reached}
    }

    getBreadthPath(chain,goal){
        this.#bfSearch.setTarget({position:goal})
        this.#bfSearch.setChain(chain)
        const path = this.#bfSearch.generatePath()
        const reached = this.#bfSearch.isGoalFound()

        return {path,reached}
    }

    
    getDepthFirstPath(chain,goal,anchor = null){
        this.#dfSearch.nudge = false
        this.#dfSearch.setTarget(goal)
        this.#dfSearch.setMaxCoiling(chain.length)
        this.#dfSearch.setChain(chain)
        this.#dfSearch.setAnchor(anchor)
        this.#dfSearch.setBounded(false)
        const path = this.#dfSearch.generatePath()
        const reached = this.#dfSearch.isGoalFound()

        return {path,reached}
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
        //this.#starSearch.draw(this.ctx)
        this.#bfSearch.draw(this.ctx)
        this.#dfSearch.draw(this.ctx)

    }

}