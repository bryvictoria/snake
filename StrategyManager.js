export const STRATEGIES = {GREEDYHUNT:1,REACTIVE_SURVIVAL:2,PROACTIVE_SURVIVAL:3,DEFRAGGING:4}
export const STRATEGYNAMES = Object.fromEntries(
    Object.entries(STRATEGIES).map(([name, value]) => [value, name])
)
export const MODES = {HUNTING:1,TAILTEST:2,SURVIVING:3,CLEANUP:4}
export const MODENAMES = Object.fromEntries(
    Object.entries(MODES).map(([name, value]) => [value, name])
)
import PathFinder from './PathFinder.js'
import Snake from './Snake.js'



export default class StrategyManager{
    mode = MODES.HUNTING
    #pathFinder
    #simulationSnake
    #survivalPath = []
    #survivalCounter = false
    #cleanupFrequency = 25

    constructor(){
        this.#pathFinder = new PathFinder()
        this.#simulationSnake = new Snake()
    }

    directHunt(state){


        //if(state.strategy !== STRATEGIES.HUNTING){
            let huntResult = this.#pathFinder.getBreadthPath(state.snake.chain,state.apple.position)
        console.log(huntResult)
        //}
        return [];

        huntResult = this.#pathFinder.getStarPath(state.snake.chain,state.apple.position)

        huntResult.lookAheadFail = false


        if(huntResult.reached){
            console.log('LOOK AHEAD FIRST!')


            let pathTail = huntResult.path.slice(-state.snake.chain.length)

            if(pathTail.length < state.snake.chain.length){
                const len = state.snake.chain.length - pathTail.length

                const tail = state.snake.chain.map(i => i.position).slice(0,len)

                for(let i in tail){
                    const node = tail[i]

                    pathTail.unshift(node)
                }
            }
            pathTail = pathTail.reverse()

            this.#simulationSnake.setPosition(pathTail)
            const targetTail = this.#simulationSnake.chain[this.#simulationSnake.chain.length -1].position
            this.#simulationSnake.chain.pop()
            const lookAhead = this.#pathFinder.getStarPath(this.#simulationSnake.chain,targetTail)

            huntResult.lookAheadFail = !lookAhead.reached
        
        }

        return huntResult
    }
    
    setProactiveSurvivalPath(state){
        let reached = true
        const chain = state.snake.chain
        console.log('GENERATE PROACTIVE PATH!')

        let survivalPathResult = this.#pathFinder.getDepthFirstPath(chain,chain[chain.length - 1],state.apple.position)
        if(survivalPathResult.reached){
            this.#survivalPath = survivalPathResult.path
        }else{
            console.log("proactive tail not reachable, do a cleanup")
            reached = false
        }
        return reached
    }
    getSurvivalSteps(state){
        const chain = state.snake.chain
        console.log('GET SURVIVAL STEPS')

        if(this.#survivalPath.length === 0){
            let survivalPathResult = this.#pathFinder.getDepthFirstPath(chain,chain[chain.length - 1])
            if(survivalPathResult.reached){
                this.#survivalPath = survivalPathResult.path
            }else{
                console.log("tail not reachable, do a cleanup")
                return this.setCleanUp(state)
            }
        }
        
        let steps = Math.floor(Math.random() * (10 - 5 + 1)) + 5
    
        const stepsPath = this.#survivalPath.splice(0, steps);
        console.log('steps:'+JSON.stringify(stepsPath))

        if(stepsPath.length){

            return stepsPath
        
        } 
        return []
    }

    getHuntPath(state){
        state.mode = MODES.HUNTING
        let path = this.#pathFinder.getHuntPath(state)
        console.log(path)
        return path
    }

    setCleanUp(state){
        state.strategy = STRATEGIES.DEFRAGGING
        state.mode = MODES.CLEANUP
        return this.#pathFinder.getCleanupPath(state.snake)
    }

    getNextMove(state){
        //console.log("getNextMove strategy:"+STRATEGYNAMES[state.strategy] +" mode:" + MODENAMES[state.mode]+" score:" + state.score + " snake:"+JSON.stringify(state.snake.chain.map(i=>i.position)))
        let path = []
        let survivalPathSteps = []
        let snakeLength = state.snake.chain.length
        
        if(state.strategy == STRATEGIES.GREEDYHUNT && state.score >= this.#cleanupFrequency && ((state.score % this.#cleanupFrequency) == 0)){
            
            path = this.setCleanUp(state)

        }else{
            
            if(state.mode == MODES.CLEANUP){
                state.strategy = STRATEGIES.GREEDYHUNT
                state.mode = MODES.HUNTING
            }


            if(state.mode == MODES.HUNTING){
                let lookAheadFail = false
                if(state.strategy == STRATEGIES.GREEDYHUNT){
                    let huntResult = this.directHunt(state)
                    lookAheadFail = huntResult.lookAheadFail
                    if(!huntResult.reached) {

                        state.strategy = STRATEGIES.REACTIVE_SURVIVAL
                        let survivalResult = this.getSurvivalSteps(state)
                        path = [...path, ...survivalResult]
                        
                    } else {
                        path = [...path, ...huntResult.path]
                    }
                } else if(state.strategy == STRATEGIES.REACTIVE_SURVIVAL){

                    let huntResult = this.directHunt(state)
                    lookAheadFail = huntResult.lookAheadFail

                    console.log("huntResult",huntResult)
                    if(!huntResult.reached) {
                        let survivalResult = this.getSurvivalSteps(state)
                        path = [...path, ...survivalResult]
                    } else{
                        this.#survivalPath = []
                        state.strategy = STRATEGIES.GREEDYHUNT
                        state.mode = MODES.HUNTING
                        path = [...path, ...huntResult.path]
                    }
                } else if(state.strategy == STRATEGIES.PROACTIVE_SURVIVAL){
                    
                    let huntResult = this.directHunt(state)

                    console.log("PROACTIVE_SURVIVAL huntResult",huntResult)
                    if(!huntResult.reached || huntResult.lookAheadFail) {
                        let survivalResult = this.getSurvivalSteps(state)
                        path = [...path, ...survivalResult]
                    } else{
                        this.#survivalPath = []
                        state.strategy = STRATEGIES.GREEDYHUNT
                        state.mode = MODES.HUNTING
                        path = [...path, ...huntResult.path]
                    }
                }

                if(lookAheadFail){
                    path = []
                    console.log("ITS A TRAP!")
                    state.strategy = STRATEGIES.PROACTIVE_SURVIVAL
                    state.mode = MODES.TAILTEST
                }

            }else  if(state.mode == MODES.TAILTEST){
                
                //generate tailtest here
                console.log('START PROACTIVE_SURVIVAL')
                this.#survivalPath = []
                let reached = this.setProactiveSurvivalPath(state)
                if(reached){
                    state.mode = MODES.HUNTING
                }else{
                    let cleanUpPath = this.setCleanUp(state)
                    path = [...path, ...cleanUpPath]
                }
            }
        }

        console.log(" strategy:"+STRATEGYNAMES[state.strategy] +" mode:" + MODENAMES[state.mode]+" score:" + state.score+" path:"+JSON.stringify(path))
        
        return path
    }

    draw(ctx){
        this.#pathFinder.draw(ctx)
    }


    
}