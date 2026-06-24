import Snake, { DIRECTIONS }  from './Snake.js'
import Apple from './Apple.js'
import StarSearch from './StarSearch.js'
import DepthFirstSearch from './DepthFirstSearch.js'


const gameObjects = []

const canvas = document.getElementById('game')
const statusP = document.getElementById('status')
const ctx = canvas.getContext('2d')
let lastTime=0
const snake = new Snake(ctx)
const apple = new Apple(ctx)
const starSearch = new StarSearch(ctx,snake.chain,apple)
const dfSearch = new DepthFirstSearch(ctx,snake.chain,apple)
const status = {
    score:0,
    status:'playing',
    isMoving:false,
    isOver:false
}
let interval = null;
let isSurvivalMode = false;
let survivalPath = []
function main(){
    
    

    gameObjects.push(snake);
    
    
    gameObjects.push(apple)
    apple.assignPosition(snake.chain.map(i => i.position))
    
    snake.setPath(starSearch.generatePath())
    //snake.setPath(dfSearch.generatePath())
    //console.log('snake:'+JSON.stringify(snake.chain.map(i=>i.position)))
    
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
    interval = setInterval(tick,3)
    
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

    isSurvivalMode = false;
    snake.addChain()
    apple.assignPosition(snake.chain.map(i => i.position))
    
    snake.setPath(starSearch.generatePath())
    
    if(!starSearch.isGoalFound()){
        //console.log('generating survival path')
        
        setSurvivalPath()

        doSurvive()

    }
    
    status.score++
    showStatus()
    
}
function doSurvive(){
    let steps = Math.floor(Math.random() * 4) + 2
    
    const stepsPath = survivalPath.splice(0, steps);
    if(stepsPath.length){
        snake.setPath(stepsPath)
        isSurvivalMode = true;
        //console.log('survival mode ',steps,stepsPath)
    } else {
        //console.log('tail reached. reset')
        setSurvivalPath()
    }
}
function setSurvivalPath(){
    starSearch.nudge = false
    starSearch.setTarget(snake.chain[snake.chain.length - 1])
    starSearch.setChain(snake.chain)
    survivalPath = structuredClone(dfSearch.generatePath())
    //console.log('generated:',survivalPath.length,survivalPath)
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
  
  if(isSurvivalMode && snake.path.length == 0){

    starSearch.setTarget(apple)
    starSearch.setChain(snake.chain)
    starSearch.nudge = true
    let newpath = starSearch.generatePath()
    if(starSearch.isGoalFound())
        snake.setPath(newpath)
    else
        doSurvive()
  }
  drawGameObjects()
  //starSearch.draw()
  //dfSearch.draw()
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