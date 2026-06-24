import GameObject from './GameObject.js'
export default class Apple extends GameObject{
    constructor(ctx,x=0,y=0){
        super(ctx)
        this.color = 'red'
    }
    assignPosition(excludePositions){
        let randomPos = null 
        let excludePositionStr = excludePositions.map(i => JSON.stringify(i))
        do{
            randomPos = [4 * Math.floor(Math.random() * 100),4 * Math.floor(Math.random() * 100)]
        } while(excludePositionStr.includes(JSON.stringify(randomPos)));
        this.position = randomPos
    }
    update(){

    }
    draw(){  
        
        this.ctx.beginPath();
        this.ctx.fillStyle = this.color
        this.ctx.fillRect(this.position[0], this.position[1], this.size, this.size);
        this.ctx.stroke();
        
    }
    
}