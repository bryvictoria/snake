import GameEngine from './GameEngine.js'

const messageBox = document.getElementById('message')
function main(){

    window.debugger = {
        size:100,
        data: [],
        index:0,
        log(l){
            this.data.push(l)
            if(this.data.length > this.size)
                this.data.shift()
        },
        get(){
            return this.data
        },
        debug(){

        }

    }

    const gameEngine = new GameEngine()
    
    gameEngine.on('message', (msg) => setGameMessage(msg))
    gameEngine.start()

    document.getElementById('play-button').addEventListener("click",() => gameEngine.start())
    document.getElementById('pause-button').addEventListener("click",() => gameEngine.stop())
    document.getElementById('tick-button').addEventListener("click",() => gameEngine.tick())

    

}

function setGameMessage(msg){

    messageBox.textContent = msg
}



main()