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
    'warmup':{width:10,height:10,tileSize:60,borderSize:5,speed:15,area: 600,threshold:40,cleanup:10},
    'classic':{width:20,height:20,tileSize:30,borderSize:4,speed:4,area: 600,threshold:35,cleanup:15},
    'dense':{width:30,height:30,tileSize:20,borderSize:2,speed:3,area: 600,threshold:30,cleanup:20},
    'heavyweight':{width:50,height:50,tileSize:12,borderSize:2,speed:2,area: 600,threshold:25,cleanup:25},
    'marathon':{width:100,height:100,tileSize:6,borderSize:1,speed:1,area: 600,threshold:20,cleanup:30},
}

export default class GameEngine extends EventEmit{

    #state
    #renderer
    #strategist
    #hamiltonian = false
    #interval = null
    #speed = 1

    #board

    constructor(){
        super()
        this.#board = BOARDS.warmup
        this.#state = {
            snake: new Snake(5),
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
        if(this.#state.phase === PHASES.PLAYING){
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
        if(this.#state.apple.position == null){
            this.#state.phase = PHASES.FINISHED
        } else {
            if(scored){
                this.#state.score++
                this.#state.snake.addChain()
                this.#state.occ = this.#state.snake.chain.length/(this.#board.size) * 100
                this.spawnFood()

            }
            
            if(this.#hamiltonian && this.#state.occ == this.#board.threshold &&  this.#state.strategy != STRATEGIES.HAMILTONIAN){
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
        this.emit('message', PHASENAMES[this.#state.phase]+'! SCORE:'+ this.#state.score +' '+ MODENAMES[this.#state.mode] +' | '+STRATEGYNAMES[this.#state.strategy] +'  '+Math.ceil(this.#state.occ)+'% ' )
    }
    reset(){
        this.#state.phase = PHASES.IDLE
        this.#state.score = 0
        this.#state.occ = 0

    }
    
    
    stop(){
        this.emit('message', 'Game Stopped!');
        this.#state.phase = PHASES.IDLE
        clearInterval(this.interval)
    }
    
    start(board,hamiltonian){
        
        this.emit('message', 'Game Initialized!')
        this.reset()
        this.setBoard(BOARDS[board])
        this.#hamiltonian = hamiltonian
        this.#state.phase = PHASES.PLAYING
        this.#state.strategy =  STRATEGIES.GREEDYHUNT
        this.#state.mode =  MODES.HUNTING
        this.#strategist.reset()
        this.spawnFood()
        
        this.advance()
        
        this.interval = setInterval(() => { this.tick() }, this.#speed)
        //this.tick()
    }
    setBoard(board){
        
        board.size = board.width*board.height
        this.#state.snake.setBoard(board)
        this.#state.apple.setBoard(board)
        this.#state.apple.setSize(board.tileSize)
        this.#strategist.setBoard(board)

        this.#speed = board.speed
        this.#state.apple.setPosition([0,0])

        this.#state.snake.setDirections()
        this.#board = board

    }
}