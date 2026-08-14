import GameObject from './GameObject.js'
export default class Apple extends GameObject{
    board = {width:100,height:100,tileSize:6,area: 600}
    constructor(x=0,y=0){
        super()
        this.color = 'red'
    }

    assignPosition(excludePositions){
        let randomPos = null 
        let excludePositionStr = excludePositions.map(i => JSON.stringify(i))
        excludePositionStr.push(JSON.stringify(this.position))
        let stopper = 0
        do{
            
            randomPos = [this.board.tileSize * Math.floor(Math.random() * this.board.width),this.board.tileSize * Math.floor(Math.random() * this.board.width)]

        } while( excludePositionStr.includes(JSON.stringify(randomPos)) && stopper++ < this.board.size);
        
        if(stopper >= this.board.size){
            randomPos = [this.board.area,this.board.area]
        }
        this.position = randomPos
    }

    setPosition(pos){
        this.position = pos
    }

    getPosition(){
        return this.position
    }

    setBoard(board){
        this.board = board
    }
    update(){

    }

    draw(ctx){  
        
        ctx.beginPath();
        ctx.fillStyle = this.color
        ctx.fillRect(this.position[0], this.position[1], this.size, this.size);
        ctx.stroke();
        
    }
    
}