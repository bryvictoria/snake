import Snake, { DIRECTIONS }  from './Snake.js'
import Apple from './Apple.js'
import StarSearch from './StarSearch.js'


const gameObjects = []

const canvas = document.getElementById('game')
const statusP = document.getElementById('status')
const ctx = canvas.getContext('2d')
let lastTime=0
const snake = new Snake(ctx)
const apple = new Apple(ctx)
const starSearch = new StarSearch(ctx,snake.chain,apple)
const status = {
    score:0,
    status:'playing',
    isMoving:false,
    isOver:false
}
let interval = null;
function main(){
    
    

    gameObjects.push(snake);
    
    
    gameObjects.push(apple)
    apple.assignPosition(snake.chain.map(i => i.position))
  //  apple.position = [68,84]
    snake.setPath(starSearch.generatePath())
  //  console.log('snake:'+JSON.stringify(snake.chain.map(i=>i.position)))
    starSearch.generatePath()

    showStatus()
    
    startMoving()

    
    

    document.addEventListener("keyup", (event) => {
        if(event.key == "ArrowDown"){
            snake.changeDirection(DIRECTIONS.DOWN)
        } else if(event.key == "ArrowUp"){
            snake.changeDirection(DIRECTIONS.UP)
        } else if(event.key == "ArrowLeft"){
            snake.changeDirection(DIRECTIONS.LEFT)
        } else if(event.key == "ArrowRight"){
            snake.changeDirection(DIRECTIONS.RIGHT)
        } else if(event.key == " "){
            if(status.isMoving)
                stopMoving()
            else
                startMoving()
        }
        
    });

}

function startMoving(){
    if(status.isOver){
        snake.reset()
        status.score = 0
        status.status = "playing"
        status.isOver = false
    }
    status.isMoving = true
    showStatus()
    //tick()
    interval = setInterval(tick,10)
    
}

function stopMoving(){
    clearInterval(interval)
    status.isMoving=false
    showStatus()
}

function showStatus(){
    statusP.innerHTML = JSON.stringify(status)
    
}



function scored(){
    snake.addChain()
    apple.assignPosition(snake.chain.map(i => i.position))
    console.log('snake:'+JSON.stringify(snake.chain.map(i=>i.position)))
    snake.setPath(starSearch.generatePath())
    
    status.score++
    showStatus()
    
}

function gameOver(){
    status.status = "Game Over"
    status.isOver = true
    stopMoving()
    
}

function tick() {

  
  
  if(snake.headCollidesWith(apple.position)){
    scored()
  }else{
    updateGameObjects()
  }
  if(snake.headHitsBody() || snake.headHitsWall()){
    gameOver()
  }
  
  drawGameObjects()
  starSearch.draw()
}

function updateGameObjects(){
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for(let i in gameObjects){

        gameObjects[i].update()

    }
}

function drawGameObjects(){
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for(let i in gameObjects){

        gameObjects[i].draw()

    }
}

main()