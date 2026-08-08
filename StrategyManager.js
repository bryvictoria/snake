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
    #tailTestFallbackPath // = [[252,384],[252,396],[252,408],[252,420],[252,432],[252,444],[252,456],[252,468],[252,480],[252,492],[252,504],[264,504],[276,504],[288,504],[300,504],[312,504],[324,504],[336,504],[348,504],[360,504],[372,504],[384,504],[396,504],[408,504],[420,504],[432,504],[432,516],[432,528],[432,540],[432,552],[420,552],[408,552],[396,552],[384,552],[372,552],[360,552],[348,552],[336,552],[324,552],[312,552],[300,552],[288,552],[276,552],[264,552],[252,552],[240,552],[228,552],[216,552],[204,552],[192,552],[180,552],[168,552],[156,552],[144,552],[144,540],[144,528],[144,516],[144,504],[132,504],[132,516],[132,528],[132,540],[132,552],[132,564],[144,564],[156,564],[168,564],[180,564],[192,564],[204,564],[216,564],[228,564],[240,564],[252,564],[264,564],[276,564],[288,564],[300,564],[312,564],[324,564],[336,564],[348,564],[360,564],[372,564],[384,564],[396,564],[408,564],[420,564],[432,564],[444,564],[444,552],[444,540],[444,528],[444,516],[444,504],[444,492],[432,492],[420,492],[408,492],[396,492],[384,492],[372,492],[360,492],[348,492],[348,480],[348,468],[348,456],[348,444],[348,432],[348,420],[348,408],[348,396],[348,384],[348,372],[348,360],[348,348],[348,336],[348,324],[336,324],[336,312],[336,300],[336,288],[336,276],[336,264],[336,252],[336,240],[336,228],[336,216],[336,204],[336,192],[336,180],[336,168],[336,156],[336,144],[336,132],[336,120],[348,120],[348,132],[348,144],[348,156],[348,168],[348,180],[348,192],[348,204],[348,216],[348,228],[348,240],[348,252],[348,264],[348,276],[348,288],[348,300],[348,312],[360,312],[360,324],[372,324],[384,324],[396,324],[408,324],[420,324],[432,324],[444,324],[456,324],[468,324],[480,324],[492,324],[504,324],[516,324],[528,324],[528,312],[528,300],[528,288],[528,276],[528,264],[528,252],[528,240],[528,228],[528,216],[528,204],[528,192],[528,180],[528,168],[528,156],[528,144],[528,132],[528,120],[528,108],[528,96],[528,84],[528,72],[528,60],[516,60],[504,60],[492,60],[480,60],[468,60],[456,60],[444,60],[432,60],[420,60],[408,60],[408,72],[408,84],[408,96],[408,108],[408,120],[408,132],[408,144],[408,156],[408,168],[408,180],[408,192],[408,204],[408,216],[408,228],[396,228],[396,216],[396,204],[396,192],[396,180],[396,168],[396,156],[396,144],[396,132],[384,132],[372,132],[360,132],[360,120],[360,108],[360,96],[360,84],[360,72],[360,60],[360,48],[360,36],[360,24],[348,24],[336,24],[324,24],[324,36],[324,48],[324,60],[324,72],[324,84],[324,96],[324,108],[324,120],[324,132],[324,144],[324,156],[324,168],[324,180],[324,192],[324,204],[324,216],[324,228],[324,240],[324,252],[324,264],[324,276],[324,288],[324,300],[324,312],[324,324],[312,324],[312,312],[312,300],[312,288],[312,276],[312,264],[312,252],[312,240],[312,228],[312,216],[312,204],[312,192],[312,180],[312,168],[312,156],[312,144],[312,132],[312,120],[312,108],[312,96],[312,84],[312,72],[312,60],[312,48],[312,36],[312,24],[312,12],[324,12],[336,12],[348,12],[360,12],[372,12],[372,24],[372,36],[372,48],[372,60],[372,72],[372,84],[372,96],[372,108],[372,120],[384,120],[396,120],[396,108],[396,96],[396,84],[396,72],[396,60],[396,48],[408,48],[420,48],[432,48],[444,48],[456,48],[468,48],[480,48],[492,48],[504,48],[516,48],[528,48],[540,48],[540,60],[540,72],[540,84],[540,96],[540,108],[540,120],[540,132],[540,144],[540,156],[540,168],[540,180],[540,192],[540,204],[540,216],[540,228],[540,240],[540,252],[540,264],[540,276],[540,288],[540,300],[540,312],[540,324],[540,336],[540,348],[552,348],[564,348],[576,348],[588,348],[588,336],[588,324],[588,312],[588,300],[588,288],[588,276],[588,264],[588,252],[588,240],[588,228],[588,216],[588,204],[588,192],[588,180],[588,168],[588,156],[588,144],[588,132],[588,120],[588,108],[588,96],[588,84],[588,72],[588,60],[588,48],[588,36],[588,24],[588,12],[588,0],[576,0],[576,12],[576,24],[576,36],[576,48],[576,60],[576,72],[576,84],[576,96],[576,108],[576,120],[576,132],[576,144],[576,156],[576,168],[576,180],[576,192],[576,204],[576,216],[576,228],[576,240],[576,252],[576,264],[576,276],[576,288],[576,300],[576,312],[576,324],[576,336],[564,336],[564,324],[564,312],[564,300],[564,288],[564,276],[564,264],[564,252],[564,240],[564,228],[564,216],[564,204],[564,192],[564,180],[564,168],[564,156],[564,144],[564,132],[564,120],[564,108],[564,96],[564,84],[564,72],[564,60],[564,48],[564,36],[564,24],[564,12],[564,0],[552,0],[552,12],[552,24],[552,36],[540,36],[540,24],[540,12],[540,0],[528,0],[528,12],[528,24],[528,36],[516,36],[516,24],[516,12],[516,0],[504,0],[504,12],[504,24],[504,36],[492,36],[492,24],[492,12],[492,0],[480,0],[480,12],[480,24],[480,36],[468,36],[468,24],[468,12],[468,0],[456,0],[456,12],[456,24],[456,36],[444,36],[444,24],[444,12],[444,0],[432,0],[432,12],[432,24],[432,36],[420,36],[420,24],[420,12],[420,0],[408,0],[408,12],[408,24],[408,36],[396,36],[384,36],[384,24],[384,12],[384,0],[372,0],[360,0],[348,0],[336,0],[324,0],[312,0],[300,0],[288,0],[276,0],[264,0],[252,0],[240,0],[228,0],[216,0],[204,0],[192,0],[180,0],[168,0],[156,0],[144,0],[132,0],[120,0],[108,0],[96,0],[84,0],[72,0],[60,0],[48,0],[36,0],[24,0],[12,0],[0,0],[0,12],[0,24],[0,36],[0,48],[0,60],[0,72],[0,84],[0,96],[0,108],[0,120],[0,132],[0,144],[0,156],[0,168],[0,180],[0,192],[0,204],[0,216],[0,228],[0,240],[0,252],[0,264],[0,276],[0,288],[12,288],[24,288],[36,288],[48,288],[60,288],[72,288],[84,288],[96,288],[108,288],[120,288],[132,288],[144,288],[156,288],[168,288],[180,288],[180,300],[180,312],[180,324],[180,336],[180,348],[180,360],[180,372],[180,384],[180,396],[180,408],[180,420],[180,432],[180,444],[180,456],[192,456],[204,456],[216,456],[228,456],[240,456],[240,444],[240,432],[240,420],[240,408],[240,396],[240,384]]
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

        window.debugger.log('huntResult',JSON.stringify(huntResult))
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
                    huntResult.headTailCollide = true
                    console.log('COLIDE:'+JSON.stringify(lookAhead.path))
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
        return cleanUpPath
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