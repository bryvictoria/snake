import EventEmit from './EventEmit.js'
import GameRenderer from './GameRenderer.js'
import StrategyManager, { STRATEGIES, STRATEGYNAMES, MODES, MODENAMES }  from './StrategyManager.js'
import Snake, { DIRECTIONS,SNAKE_STATUSES }  from './Snake.js'
import Apple from './Apple.js'

export const PHASES = {PLAYING:1,PAUSED:2,GAMEOVER:3,IDLE:4}

export default class GameEngine extends EventEmit{

    #state
    #renderer
    #strategist

    #interval = null
    #speed = 1

    constructor(){
        super()

        this.#state = {
            board:{
                width:100,
                height:100,
                tileSize:4,
                area:1000
            },
            snake: new Snake(10),
            apple: new Apple(),
            score: 0,
            phase: PHASES.IDLE,
            strategy: STRATEGIES.GREEDYHUNT,
            mode: MODES.HUNTING
        }
        this.#renderer = new GameRenderer()
        this.#strategist = new StrategyManager()
        
    
    }

    tick(){

        let startTime = performance.now()
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
            this.#strategist.draw()
            
        }
        let endTime = performance.now()
        //console.log('Tick:'+(endTime-startTime)+'ms')
    }

    advance(scored = false){
        if(scored){
            this.spawnFood()
            this.#state.score++
            this.#state.snake.addChain()
        }
        console.log('ADVANCE! ' + scored)
        this.#state.snake.setPath(this.#strategist.getNextMove(this.#state))

        this.showGameStatus()
    }
    start(){
        this.emit('message', 'Game Initialized!')
        this.reset()
        this.#state.phase = PHASES.PLAYING
        this.#state.strategy =  STRATEGIES.GREEDYHUNT
        this.#state.mode =  MODES.HUNTING
        //this.spawnFood()
        
        this.#state.apple.setPosition([116,228])
        //this.#state.apple.setPosition([196,116])
        //this.#state.apple.setPosition([300,100])
        this.advance()
        
        //this.interval = setInterval(() => { this.tick() }, this.#speed)
        this.tick()
        
    }
    spawnFood(){
        this.#state.apple.assignPosition(this.#state.snake.chain.map(i => i.position))
    }
    
    gameOver(){
        this.emit('message', 'SCORE:'+this.#state.score+' Game Over! ')
        this.#state.phase = PHASES.GAME_OVER
        
    }

    showGameStatus(){
        this.emit('message', 'SCORE:'+this.#state.score+'  '+MODENAMES[this.#state.mode] +' | '+STRATEGYNAMES[this.#state.strategy])
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
}