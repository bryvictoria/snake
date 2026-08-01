export default class GameRenderer{

    canvas = null
    ctx = null
    
    constructor(){
        this.canvas = document.getElementById('game')
        this.ctx = this.canvas.getContext('2d')
    }

    render(state){
        
        this.drawGameObjects([state.snake,state.apple])
    }

    drawGameObjects(gameObjects){
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

        for(let i in gameObjects){

            gameObjects[i].draw(this.ctx)

        }
    }
}