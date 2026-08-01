import GameEngine from './GameEngine.js'

const messageBox = document.getElementById('message')
function main(){
    const gameEngine = new GameEngine()
    
    gameEngine.on('message', (msg) => setGameMessage(msg))
    gameEngine.start()

    document.getElementById('pause-button').addEventListener("click",() => gameEngine.stop())
    document.getElementById('tick-button').addEventListener("click",() => gameEngine.tick())

}

function setGameMessage(msg){

    messageBox.textContent = msg
}



main()