export const STRATEGIES = {GREEDYHUNT:1,REACTIVE_SURVIVAL:2,PROACTIVE_SURVIVAL:3,DEFRAGGING:4}
export const STRATEGYNAMES = Object.fromEntries(
    Object.entries(STRATEGIES).map(([name, value]) => [value, name])
)
export const MODES = {HUNTING:1,TAILTEST:2,SURVIVING:3,CLEANUP:4,HEADTAIL_COLLISION:5}
export const MODENAMES = Object.fromEntries(
    Object.entries(MODES).map(([name, value]) => [value, name])
)
import PathFinder from './PathFinder.js'
import Snake from './Snake.js'



export default class StrategyManager{
    mode = MODES.HUNTING
    #pathFinder
    #simulationSnake
    #dummySnake
    #survivalPath = []
    #survivalCounter = false
    #cleanupFrequency = 25
    #isApplePathShorter = false
    #isApplePathChecked = false
    #tailTestFallbackPath 
    board = {width:100,height:100,tileSize:6,area: 600}

    constructor(){
        this.#pathFinder = new PathFinder()
        this.#simulationSnake = new Snake()
        
    }

    preCheckReachability(state){
        window.debugger.log('preCheckReachability')

        this.#dummySnake = new Snake()
        this.#dummySnake.setPosition(state.snake.chain.map(i => i.position))
        this.#dummySnake.chain[0].position = [...state.apple.position]
       
        if(!this.#isApplePathChecked){
            this.#isApplePathShorter = false

            let headPathResult = this.#pathFinder.getBreadthPath(state.snake.chain,state.apple.position)

            let appleHuntResult = this.#pathFinder.getBreadthPath(this.#dummySnake.chain,state.snake.chain[0].position)

            window.debugger.log('apple path test')
            this.#isApplePathChecked = true
            if(appleHuntResult.nodes < headPathResult.nodes){
                window.debugger.log('check by apple')
                this.#isApplePathShorter = true
                return appleHuntResult
            } else {
                window.debugger.log('check by head')
                return headPathResult
            }

        }

        if(this.#isApplePathShorter){
            window.debugger.log('check by apple')
            return this.#pathFinder.getBreadthPath(this.#dummySnake.chain,state.snake.chain[0].position)
        }else{
            window.debugger.log('check by head')
            return this.#pathFinder.getBreadthPath(state.snake.chain,state.apple.position)
        }
        

    }

    directHunt(state,precheck= false){

        if(false && precheck){

            let preHuntCheck = this.preCheckReachability(state)
        
            window.debugger.log('preHuntCheck',JSON.stringify(preHuntCheck))

            if(!preHuntCheck.reached)
                return preHuntCheck
        }
        
        
        
        let huntResult = this.#pathFinder.getStarPath(state.snake.chain,state.apple.position)
        //let huntResult = this.#pathFinder.getShortestPath(state.snake.chain,state.apple.position)
        
        window.debugger.log('huntResult:'+JSON.stringify(huntResult))
        huntResult.lookAheadFail = false

        huntResult.headTailCollide = false
        if(huntResult.reached){

            window.debugger.log('LOOK AHEAD FIRST!')
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
            window.debugger.log('apple',state.apple.position)
            window.debugger.log("simsnake:"+JSON.stringify(pathTail))
            this.#simulationSnake.setPosition(pathTail)
            const targetTail = this.#simulationSnake.chain[this.#simulationSnake.chain.length -1].position
            
            this.#simulationSnake.chain.pop()
            
            const lookAhead = this.#pathFinder.getBreadthPath(this.#simulationSnake.chain,targetTail)

            if(lookAhead.reached){

                if(lookAhead.path.length === 1){
                    console.log("TAIL TEST PASSED BUT HEAD-TAIL IS ADJACENT SO FAIL IT")
                    lookAhead.reached = false
                    this.#tailTestFallbackPath = []
                //    huntResult.headTailCollide = true
                //    console.log('COLIDE:'+JSON.stringify(lookAhead.path))
                } else {
                    this.#tailTestFallbackPath = lookAhead.path.concat(this.#simulationSnake.chain.map(i => i.position).reverse())
                    window.debugger.log("lookAhead:"+JSON.stringify(lookAhead.path))
                    window.debugger.log("testtail:"+JSON.stringify(this.#tailTestFallbackPath))
                }

            }

            huntResult.lookAheadFail = !lookAhead.reached
            
        }

        return huntResult

    }
    
    setProactiveSurvivalPath(state){

        let reached = true
        let path = []
        const chain = state.snake.chain
        window.debugger.log('GENERATE PROACTIVE PATH!')

        let survivalPathResult = this.#pathFinder.getDepthFirstPath(chain,chain[chain.length - 1],state.apple.position)

        if(survivalPathResult.reached){
            window.debugger.log('APPENDING TAIL TO PROACTIVE PATH')
            window.debugger.log("spath:"+JSON.stringify(survivalPathResult.path))
            window.debugger.log("snake:"+JSON.stringify(chain.map(i => i.position).reverse()))
            
            let tailTohead = chain.map(i => i.position).reverse()
            tailTohead.shift()
            this.#survivalPath = survivalPathResult.path.concat(tailTohead)

            
            path = this.#survivalPath.splice(0,3)
            window.debugger.log('survivalPath:'+JSON.stringify(this.#survivalPath))
            
        }else{
            window.debugger.log("proactive tail not reachable, do a cleanup")
            reached = false
        }
        return { path,reached }
    }

    getSurvivalSteps(state){
        const chain = state.snake.chain
        window.debugger.log('GET SURVIVAL STEPS')

        if(this.#survivalPath.length === 0){
            if(this.#tailTestFallbackPath && this.#tailTestFallbackPath.length){
                window.debugger.log("GOING TO TAILTEST FALLBACK!")

                this.#survivalPath = this.#tailTestFallbackPath
                
            }else{
                let survivalPathResult = this.#pathFinder.getDepthFirstPath(chain,chain[chain.length - 1],state.apple.position)
                if(survivalPathResult.reached){
                    this.#survivalPath = survivalPathResult.path
                }else{
                    window.debugger.log("tail not reachable, do a cleanup")
                    return this.setCleanUp(state)
                }
            }
            this.#tailTestFallbackPath = []
        }
        
        let steps = 3;//Math.floor(Math.random() * (10 - 5 + 1)) + 5
    
        const stepsPath = this.#survivalPath.splice(0, steps);
        window.debugger.log('steps:'+JSON.stringify(stepsPath))
        
        if(stepsPath.length){

            return stepsPath
        
        } 
        return []
    }

    getHuntPath(state){
        state.mode = MODES.HUNTING
        let path = this.#pathFinder.getHuntPath(state)
        window.debugger.log(path)
        return path
    }

    setCleanUp(state){
        state.strategy = STRATEGIES.DEFRAGGING
        state.mode = MODES.CLEANUP
        let cleanUpPath = this.#pathFinder.getCleanupPath(state.snake)

        
        let appleIndex = cleanUpPath.map(i => JSON.stringify(i)).findIndex(i => i == JSON.stringify(state.apple.position))
        window.debugger.log('appleIndex',appleIndex,JSON.stringify(cleanUpPath))
        if(appleIndex >= 0){
            
            cleanUpPath = cleanUpPath.slice(0,appleIndex)
            window.debugger.log('APPLE FOUND ON CLEANUP!' + JSON.stringify(cleanUpPath))
        }

        let len = state.snake.chain.length
        let cplen = cleanUpPath.length
        let mergedPath = state.snake.chain.map(i => i.position).reverse().concat(cleanUpPath)
        let currentEnd = mergedPath.length

        let isTrap = true
        do{
            
            //console.log('slice:'+(currentEnd-len)+','+currentEnd+' : '+len +' - '+mergedPath.slice((currentEnd-len),currentEnd).length)
            
            this.#simulationSnake.setPosition(mergedPath.slice((currentEnd-len),currentEnd))
            const targetTail = this.#simulationSnake.chain[this.#simulationSnake.chain.length -1].position
            
            this.#simulationSnake.chain.pop()
            
            const lookAhead = this.#pathFinder.getBreadthPath(this.#simulationSnake.chain,targetTail)

            if(lookAhead.reached){
                isTrap = false
            }

        }while(currentEnd-- > len && isTrap)
       
        //console.log("slice  to:"+0+' to '+(currentEnd-len)+' from:'+cleanUpPath.length)
        return cleanUpPath.slice(0,currentEnd-len)
    }

    resetAppleChecks(){
        this.#isApplePathShorter = false
        this.#isApplePathChecked = false
    }
    getNextMove(state){
        
        
        window.debugger.log("getNextMove strategy:"+STRATEGYNAMES[state.strategy] +" mode:" + MODENAMES[state.mode]+" score:" + state.score + " snake:"+JSON.stringify(state.snake.chain.map(i=>i.position)))
        
        //this.#tailTestFallbackPath = []

        let path = []
        let survivalPathSteps = []

        let snakeLength = state.snake.chain.length
        
        if(state.strategy == STRATEGIES.GREEDYHUNT && state.score >= this.#cleanupFrequency && ((state.score % this.#cleanupFrequency) == 0)){

            window.debugger.log('MODE:CLEANUP BY FREQ')
            this.#tailTestFallbackPath = []
            path = this.setCleanUp(state)

        }else{
            
            if(state.mode == MODES.CLEANUP){
                window.debugger.log('MODE:CLEANUP DONE')
                state.strategy = STRATEGIES.GREEDYHUNT
                state.mode = MODES.HUNTING
            }

            if(state.mode == MODES.HUNTING){
                
                let lookAheadFail = false
                let headTailCollide = false
                if(state.strategy == STRATEGIES.GREEDYHUNT){
                    window.debugger.log('MODE:GREEDYHUNT')
            
                    let huntResult = this.directHunt(state)
                    lookAheadFail = huntResult.lookAheadFail
                    headTailCollide = huntResult.headTailCollide
                    if(lookAheadFail){
                        window.debugger.log('MODE:ITS A TRAP!')
                        path = []
                        state.strategy = STRATEGIES.PROACTIVE_SURVIVAL
                        state.mode = MODES.TAILTEST
                    } else if(!huntResult.reached) {

                        state.strategy = STRATEGIES.REACTIVE_SURVIVAL
                        let survivalResult = this.getSurvivalSteps(state)
                        path = [...path, ...survivalResult]
                        
                    } else {
                        path = [...path, ...huntResult.path]
                    }

                } else if(state.strategy == STRATEGIES.REACTIVE_SURVIVAL || state.strategy == STRATEGIES.PROACTIVE_SURVIVAL){
                    window.debugger.log('MODE:SURVIVAL')
                    let huntResult = this.directHunt(state,true)
                    lookAheadFail = huntResult.lookAheadFail
                    headTailCollide = huntResult.headTailCollide

                    if(!huntResult.reached || lookAheadFail) {
                        let survivalResult = this.getSurvivalSteps(state)
                        path = [...path, ...survivalResult]
                    } else{
                        this.#survivalPath = []
                        state.strategy = STRATEGIES.GREEDYHUNT
                        state.mode = MODES.HUNTING
                        path = [...path, ...huntResult.path]
                    }
                }

                if(headTailCollide){
                    console.log('CLEAR ALL AND RESET HERE!')
                }
/*
                if(lookAheadFail){
                    window.debugger.log('MODE:ITS A TRAP!')
                    path = []
                    state.strategy = STRATEGIES.PROACTIVE_SURVIVAL
                    state.mode = MODES.TAILTEST
                }
*/
            }else  if(state.mode == MODES.TAILTEST){
                
                window.debugger.log('MODE:TAILTEST FAILED')
                state.mode = MODES.HUNTING
                if(state.strategy == STRATEGIES.HUNTING){
                    window.debugger.log('MODE:TAILTEST FAILED - GENERATING NEW PATH')
                    this.#survivalPath = []
                    let proActivePath = this.setProactiveSurvivalPath(state)
                
                    if(proActivePath.reached){
                        path = [...path, ...proActivePath.path]
                    }else{
                        let cleanUpPath = this.setCleanUp(state)
                        path = [...path, ...cleanUpPath]
                    }
                }else{
                    window.debugger.log('MODE:TAILTEST FAILED - GET CHUNK FROM EXISTING PATH')
                    let survivalResult = this.getSurvivalSteps(state)
                    path = [...path, ...survivalResult]
                }
            }
        }

        window.debugger.log(" strategy:"+STRATEGYNAMES[state.strategy] +" mode:" + MODENAMES[state.mode]+" score:" + state.score+" path:"+JSON.stringify(path))
        return path
    }

    draw(ctx){
        this.#pathFinder.draw(ctx)
    }

    setBoard(board){
        this.#pathFinder.setBoard(board)
        this.#simulationSnake.setBoard(this.board)
    }


    
}