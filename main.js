import Snake, { DIRECTIONS }  from './Snake.js'
import Apple from './Apple.js'
import StarSearch from './StarSearch.js'
import GreedyStarSearch from './StarSearch.js'
import DepthFirstSearch from './DepthFirstSearch.js'
import BreadthFirstSearch from './BreadthFirstSearch.js'


const gameObjects = []

const canvas = document.getElementById('game')
const statusP = document.getElementById('status')
const ctx = canvas.getContext('2d')
let lastTime=0
const snake = new Snake(ctx,10)
const shadowSnake = new Snake(ctx)
const apple = new Apple(ctx)
const starSearch = new StarSearch(ctx,snake.chain,apple)
const bfSearch = new BreadthFirstSearch(ctx,snake.chain,apple)
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
    //gameObjects.push(shadowSnake);
    
    
    gameObjects.push(apple)
    apple.assignPosition(snake.chain.map(i => i.position))
    //apple.setPosition([240,356])
    snake.setPath(starSearch.generatePath())
    //snake.setPath(dfSearch.generatePath())
    
    showStatus()
    
    startMoving()
    //tick()
    addArrowControls()

    document.getElementById('play-button').addEventListener('click', startMoving)
    document.getElementById('pause-button').addEventListener('click', stopMoving)
    document.getElementById('tick-button').addEventListener('click', tick)
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
    interval = setInterval(tick,1)
    
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
    //console.log('scored',snake.chain)
    isSurvivalMode = false;
    snake.addChain()
    apple.assignPosition(snake.chain.map(i => i.position))
    
    console.log("new apple spawned - a* to check if reachable")
    starSearch.setTarget(apple)
    const huntPath = starSearch.generatePath()

    //snake.setPath(huntPath)
    
    if(!starSearch.isGoalFound()){
        
        console.log('new apple not reachable, DFS path snake head to tail')
        setSurvivalPath()

        doSurvive()

    }else{
        console.log('new apple reachable, so do a look-ahead check')
        lookAhead(huntPath)

    }
    
    status.score++
    showStatus()
    
}

function lookAhead(huntPath,newSurvivalPath = true){

    const pathTail = huntPath.slice(-snake.chain.length)

    if(pathTail.length < snake.chain.length){
        const len = snake.chain.length - pathTail.length

        const tail = snake.chain.map(i => i.position).slice(0,len)

        for(let i in tail){
            const node = tail[i]

            pathTail.unshift(node)
        }
    }

    shadowSnake.setPosition(pathTail)


    bfSearch.nudge = true
    bfSearch.setTarget(shadowSnake.chain[shadowSnake.chain.length - 1])
    bfSearch.setChain(shadowSnake.chain)

    console.log('just a look-ahead check')

    bfSearch.generatePath()
    
    
    if(!bfSearch.isGoalFound()){
        
        console.log('look-ahead hit')
        //console.log(JSON.stringify(pathTail))
        //console.log(JSON.stringify(shadowSnake.chain.map(i => i.position)))
        if(newSurvivalPath){
            console.log('look-ahead hit - generate new survival path')
            setSurvivalPath()
        }
        doSurvive()
        
    }else{
        snake.setPath(huntPath)
    }
}


function doSurvive(){
    let steps = Math.floor(Math.random() * (10 - 5 + 1)) + 5
    
    const stepsPath = survivalPath.splice(0, steps);
    if(stepsPath.length){
        snake.setPath(stepsPath)
        isSurvivalMode = true;
    
    } else {
        console.log('survival path ended, dfs again for new survival path')

        setSurvivalPath()
    }
}
function setSurvivalPath(){
    dfSearch.nudge = false
    dfSearch.setTarget(snake.chain[snake.chain.length - 1])
    dfSearch.setChain(snake.chain)
    survivalPath = structuredClone(dfSearch.generatePath())

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
    console.log('tick! sub stalling ended')
    starSearch.setTarget(apple)
    starSearch.setChain(snake.chain)
    starSearch.nudge = true
    let newpath = starSearch.generatePath()
    if(starSearch.isGoalFound()){

        console.log('look-ahead tick')
        lookAhead(newpath,false)
        
    } else
        doSurvive()
  }
  drawGameObjects()
  //starSearch.draw('green')
  dfSearch.draw()
  //bfSearch.draw('blue')
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
function addArrowControls(){
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

main()