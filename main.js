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
let isCleanUp = false
let isHardCleanUp = false
let survivalPath = []
function main(){
    
    gameObjects.push(snake);
    //gameObjects.push(shadowSnake);
    
    
    gameObjects.push(apple)
    apple.assignPosition(snake.chain.map(i => i.position))
    //apple.setPosition([404,404])
    //apple.setPosition([64,308])
    //const startTime = performance.now();
    //starSearch.generatePath()
    //const endTime = performance.now();

    //const duration = endTime - startTime;

    //console.log(`pathfinding took ${duration.toFixed(3)} ms`);
    //starSearch.draw()

    //next(false,[112,248])
    next(false)
    
    showStatus()
    
    startMoving()
//  tick()
    
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

    tailTestPass = false
    tailTestPath = []
    tailTestBody = []

    isCleanUp = true
    dfSearch.setCap(snake.chain.length * 1.5)
    dfSearch.setChain(snake.chain)

    dfSearch.setBounded(true)
    
    let cleanUpPath = dfSearch.generatePath()
    dfSearch.setBounded(false)
    
    snake.setPath(cleanUpPath)

    console.log('cleanup done')
}

let tailTestPass = false
let tailTestPath = []
let tailTestBody = []
function lookAhead(huntPath,newSurvivalPath = true){
    //tailTestPass = false
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

    tailTestPath = starSearch.generatePath()
    
    
    
    if(!starSearch.isGoalFound()){
        
        console.log('look-ahead hit')
        ////console.log(JSON.stringify(pathTail))
        ////console.log(JSON.stringify(shadowSnake.chain.map(i => i.position)))
        let tailReached = true
        if(newSurvivalPath){
            console.log('look-ahead hit - generate new survival path')
            tailReached = setSurvivalPath()

        }
        if(tailReached)
            doSurvive()
        
    }else{
        snake.setPath(huntPath)
        tailTestPass = true
        tailTestBody = shadowSnake.chain.map(i => i.position).reverse()
        
    }
}


function doSurvive(){
    let steps = Math.floor(Math.random() * (10 - 5 + 1)) + 5
    
    const stepsPath = survivalPath.splice(0, steps);
    console.log('steps:'+JSON.stringify(stepsPath))
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
    
    let isSuccessful = false
    if(dfSearch.isGoalFound()){
        survivalPath = structuredClone(dfSearch.generatePath())
        isSuccessful = true
    }else{
        console.log('tail-chasing does not work. do a cleanup ' + JSON.stringify(snake.chain.map(i => i.position)))
        isHardCleanUp = true
        console.log('before cleanup:'+isSurvivalMode+' = '+JSON.stringify(snake.path))
        dfsCleanUp()
    }
    return isSuccessful
}
function gameOver(){
    status.status = "Game Over"
    status.isOver = true
    stopMoving()
    
}

function next(scored = true,applePosition = null){

    console.log('next!')
    isSurvivalMode = false;
    
    if(applePosition != null) // for debugging only
        apple.setPosition(applePosition)
        
    if(scored){
        console.log('scored!')
        snake.addChain()
        apple.assignPosition(snake.chain.map(i => i.position))
    
        status.score++
        showStatus()
    }

    if(!isHardCleanUp && !isCleanUp && snake.chain.length >= 100 && snake.chain.length % 50 == 0){
        dfsCleanUp()
        return false
    }

    console.log("new apple spawned - a* to check if reachable")
    starSearch.setTarget(apple)
    starSearch.setChain(snake.chain)
    const huntPath = starSearch.generatePath()

    //snake.setPath(huntPath)

    if(!starSearch.isGoalFound()){

        console.log('new apple not reachable, DFS path snake head to tail')
        console.log('tailTestPass',tailTestPass)   

        if(tailTestPass){    
            //console.log('tailpath:'+JSON.stringify(tailTestPath))
            //console.log('tailbody:'+JSON.stringify(tailTestBody))
            tailTestPass = false
            isSurvivalMode = true
            survivalPath = tailTestPath.concat(tailTestBody)
            console.log('tailTestPath:'+JSON.stringify(survivalPath))
            doSurvive()
        }else{

            let tailReached = setSurvivalPath()


            if(tailReached){
                
                doSurvive()
            }
        }
    }else{

        console.log('new apple reachable, so do a look-ahead check')
        lookAhead(huntPath)

    }
    
    
}
function tick() {
  
  if(isCleanUp  && snake.path.length == 0) {
    console.log('cleanup path completed')
    console.log('body after: ' + JSON.stringify(snake.chain.map(i => i.position)))
    next(false)
    isCleanUp = false

    isHardCleanUp = false
    
  } else if(snake.headCollidesWith(apple.position)){
    
    next()
    
    
  } else if(snake.headHitsBody() || snake.headHitsWall()){
    gameOver()
  } else if(isSurvivalMode && snake.path.length == 0){
    console.log('tick! sub stalling ended')
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


main()