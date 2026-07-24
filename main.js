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
const snake = new Snake(ctx,70)
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
let isCleanUp = false
let isHardCleanUp = false
let survivalPath = []
function main(){
    
    gameObjects.push(snake);
    //gameObjects.push(shadowSnake);
    
    
    gameObjects.push(apple)
    apple.assignPosition(snake.chain.map(i => i.position))
    //apple.setPosition([156,184])
    //apple.setPosition([52, 192])
    //apple.setPosition([284,284])
    //snake.setPath(starSearch.generatePath())
    //snake.setPath(bfSearch.generatePath(10))
    //snake.setPath(dfSearch.generatePath())
    
    next()
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

function dfsCleanUp(){

    isCleanUp = true
    dfSearch.setCap(snake.chain.length * 1.5)
    dfSearch.setChain(snake.chain)
    dfSearch.setBounded(true)
    
    let cleanUpPath = dfSearch.generatePath()
    dfSearch.setBounded(false)
    
    snake.setPath(cleanUpPath)

    console.log('cleanup done')
}


function cleanUp(){

    //console.log('do a clenup ',snake.path)
    dfSearch.nudge = false
    //dfSearch.setBounded(false)
    dfSearch.setTarget(apple)
    dfSearch.setChain(snake.chain)
    
    let maxCoiling = dfSearch.getMaxCoiling()
    dfSearch.setMaxCoiling(snake.chain.length)
    let cleanUpPath = dfSearch.generatePath()
    dfSearch.setMaxCoiling(maxCoiling)

    
    //cleanUpPath = cleanUpPath.reverse()

    snake.setPath(cleanUpPath)
    
    ////console.log('cleanup:'+JSON.stringify(cleanUpPath))
    ////console.log('end cleanup',JSON.stringify(snake.path))
    
}


function lookAhead(huntPath,newSurvivalPath = true){

    let pathTail = huntPath.slice(-snake.chain.length)

    if(pathTail.length < snake.chain.length){
        const len = snake.chain.length - pathTail.length

        const tail = snake.chain.map(i => i.position).slice(0,len)

        for(let i in tail){
            const node = tail[i]

            pathTail.unshift(node)
        }
    }
    pathTail = pathTail.reverse()
    shadowSnake.setPosition(pathTail)


    starSearch.nudge = true
    starSearch.setTarget(shadowSnake.chain[shadowSnake.chain.length - 1])
    shadowSnake.chain.pop()
    starSearch.setChain(shadowSnake.chain)

    console.log('just a look-ahead check')

    starSearch.generatePath()
    
    
    if(!starSearch.isGoalFound()){
        
        console.log('look-ahead hit')
        ////console.log(JSON.stringify(pathTail))
        ////console.log(JSON.stringify(shadowSnake.chain.map(i => i.position)))
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
    console.log('stalling')

    dfSearch.nudge = false
    dfSearch.setTarget(snake.chain[snake.chain.length - 1])
    dfSearch.setChain(snake.chain)
    

    const tempSurvivalPath = dfSearch.generatePath()
    
    if(dfSearch.isGoalFound()){
        survivalPath = structuredClone(dfSearch.generatePath())
    }else{
        console.log('tail-chasing does not work. do a cleanup')
        isHardCleanUp = true
        dfsCleanUp()
    }
}
function gameOver(){
    status.status = "Game Over"
    status.isOver = true
    stopMoving()
    
}

function next(scored = true,applePosition = null){

    

    console.log('scored!')
    isSurvivalMode = false;
    
    snake.addChain()
    
    if(applePosition != null)
        apple.setPosition(applePosition)
    if(scored){
        apple.assignPosition(snake.chain.map(i => i.position))
    
        status.score++
        showStatus()
    }

    if(!isHardCleanUp && snake.chain.length >= 100 && snake.chain.length % 100 == 0){
        dfsCleanUp()
        return false
    }
    //alert("new apple spawned - a* to check if reachable")
    console.log("new apple spawned - a* to check if reachable")
    starSearch.setTarget(apple)
    starSearch.setChain(snake.chain)
    const huntPath = starSearch.generatePath()

    //snake.setPath(huntPath)

    if(!starSearch.isGoalFound()){
    //    alert('new apple not reachable, DFS path snake head to tail')
        console.log('new apple not reachable, DFS path snake head to tail')
        setSurvivalPath()

        doSurvive()

    }else{
    //    alert('new apple reachable, so do a look-ahead check')
        console.log('new apple reachable, so do a look-ahead check')
        lookAhead(huntPath)

    }
    
    
}
function tick() {
  //console.log("TICK! ",JSON.stringify(snake.path))
  if(isCleanUp  && snake.path.length == 0) {
    console.log('cleanup done')
    isCleanUp = false

    next(false)
    console.log('hard cleanup: ')
    isHardCleanUp = false
    
  } else if(snake.headCollidesWith(apple.position)){
    //console.log('tick! scored start!',JSON.stringify(snake.path),JSON.stringify(snake.chain.map(i => i.position)))
    next()
    ////console.log('tick! scored end!',JSON.stringify(snake.path))
    
  } else if(snake.headHitsBody() || snake.headHitsWall()){
    gameOver()
  } else if(isSurvivalMode && snake.path.length == 0){
    //console.log('tick! sub stalling ended')
    starSearch.setTarget(apple)
    starSearch.setChain(snake.chain)
    starSearch.nudge = true
    let newpath = starSearch.generatePath()
    if(starSearch.isGoalFound()){

        //console.log('look-ahead tick')
        lookAhead(newpath,false)
        
    } else {
        doSurvive()
    }

  } else {
    updateGameObjects()
  }
  drawGameObjects()
  starSearch.draw('green')
  //dfSearch.draw()
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