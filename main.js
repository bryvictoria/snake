import GameEngine from './GameEngine.js'

const messageBox = document.getElementById('message')
const gameEngine = new GameEngine()

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

    gameEngine.on('message', (msg) => setGameMessage(msg))
    
    document.getElementById('play-button').addEventListener("click",startGame)
    
    

}

function startGame(){
    

    let board = document.querySelector('input[name=level]:checked').value
    let hamiltonian = document.querySelector('input[name=hamiltonian]').checked

    gameEngine.start(board,hamiltonian)

}

function setGameMessage(msg){

    messageBox.textContent = msg
}



main()