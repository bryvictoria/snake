import EventEmit from './EventEmit.js'
import GameRenderer from './GameRenderer.js'
import StrategyManager, { STRATEGIES, STRATEGYNAMES, MODES, MODENAMES }  from './StrategyManager.js'
import Snake, { DIRECTIONS,SNAKE_STATUSES }  from './Snake.js'
import Apple from './Apple.js'

export const PHASES = {PLAYING:1,PAUSED:2,GAMEOVER:3,IDLE:4,FINISHED:5}
export const PHASENAMES = Object.fromEntries(
    Object.entries(PHASES).map(([name, value]) => [value, name])
)
export const BOARDS = {
    'warmup':{width:10,height:10,tileSize:60,borderSize:5,speed:15,area: 600,threshold:50,cleanup:10},
    'classic':{width:20,height:20,tileSize:30,borderSize:4,speed:4,area: 600,threshold:100,cleanup:15},
    'dense':{width:30,height:30,tileSize:20,borderSize:2,speed:3,area: 600,threshold:100,cleanup:20},
    'heavyweight':{width:50,height:50,tileSize:12,borderSize:2,speed:2,area: 600,threshold:100,cleanup:25},
    'marathon':{width:100,height:100,tileSize:6,borderSize:1,speed:1,area: 600,threshold:100,cleanup:30},
}

export default class GameEngine extends EventEmit{

    #state
    #renderer
    #strategist

    #interval = null
    #speed = 1

    #board

    constructor(){
        super()
        this.#board = BOARDS.warmup
        this.#state = {
            snake: new Snake(10),
            apple: new Apple(),
            score: 0,
            phase: PHASES.IDLE,
            strategy: STRATEGIES.GREEDYHUNT,
            mode: MODES.HUNTING,
            occ:0
        }
        this.#renderer = new GameRenderer()
        this.#strategist = new StrategyManager()
        
        this.setBoard(BOARDS.warmup)
    }

    tick(){

        console.log(this.#state.snake.chain.length ,this.#board.size)
        if(this.#state.snake.chain.length >= this.#board.size -1){
            this.#state.phase = PHASES.FINISHED
        } else if(this.#state.phase === PHASES.PLAYING){
            let snakeStatus = this.#state.snake.getStatus(this.#state.apple.getPosition())
            if(this.#state.snake.path.length == 0){
                this.advance(snakeStatus === SNAKE_STATUSES.SCORED)

            } else if(snakeStatus === SNAKE_STATUSES.GAMEOVER){
                this.gameOver()

            }else{
                this.#state.snake.move()
            }
            this.#renderer.render(this.#state);
            //this.#strategist.draw()
            
        }
    }

    ctr = 0
    advance(scored = false){
        
        if(scored){
            this.#state.score++
            this.#state.occ = this.#state.snake.chain.length/(this.#board.width*this.#board.height) * 100
            this.#state.snake.addChain()
            this.spawnFood()

        }

        

        window.debugger.log('ADVANCE! ' + scored)

        if(this.#state.occ >= this.#board.threshold){
            this.#state.phase = PHASES.GAMEOVER
            this.#state.strategy = STRATEGIES.HAMILTONIAN
            this.#state.mode = MODES.TRANSITION
        }

        let newPath
        let stopper = 0
        do{
            newPath = this.#strategist.getNextMove(this.#state)

        }while(newPath.length == 0 && stopper++ < 5)

        this.#state.snake.setPath(newPath)
        if(newPath.length == 0){
            this.#state.phase = PHASES.GAMEOVER
        }
        

        this.showGameStatus()
    }
    
    spawnFood(){
        this.#state.apple.assignPosition(this.#state.snake.chain.map(i => i.position))
    }
    
    gameOver(){
        this.emit('message', 'SCORE:'+this.#state.score+' Game Over! ')
        this.#state.phase = PHASES.GAME_OVER
        
    }

    showGameStatus(){
        this.emit('message', PHASENAMES[this.#state.phase]+'! SCORE:'+ this.#state.score +' '+ MODENAMES[this.#state.mode] +' | '+STRATEGYNAMES[this.#state.strategy] +'  '+this.#state.occ.toFixed(1)+'% ' )
    }
    reset(){
        this.#state.phase = PHASES.IDLE
        this.#state.score = 0

        
    }
    
    
    stop(){
        this.emit('message', 'Game Stopped!');
        this.#state.phase = PHASES.IDLE
        clearInterval(this.interval)
    }
    
    start(){
        this.emit('message', 'Game Initialized!')
        this.reset()
        this.#state.phase = PHASES.PLAYING
        this.#state.strategy =  STRATEGIES.GREEDYHUNT
        this.#state.mode =  MODES.HUNTING
        this.spawnFood()
        
        this.advance()
        
        this.interval = setInterval(() => { this.tick() }, this.#speed)
        //this.tick()
    }
    setBoard(board){
        window.debugger.log('main')
        board.size = board.width*board.height
        this.#state.snake.setBoard(board)
        this.#state.apple.setBoard(board)
        this.#state.apple.setSize(board.tileSize)
        this.#strategist.setBoard(board)

        this.#speed = board.speed

        this.#state.snake.setPosition([[0,board.tileSize],[0,board.tileSize*2],[0,board.tileSize*3]])
        this.#state.snake.setDirections()
        window.debugger.log(this.#state.snake.chain)
        this.#board = board

    }
}