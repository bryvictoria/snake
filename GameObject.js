export default class GameObject {
    position = [0,0]
    ctx = null
    size = 4
    color = '#000000'

    constructor(ctx){
        this.ctx = ctx
    }

    //defaults to drawing rectangle
    draw(){  
        this.ctx.fillStyle = this.color
        const [x,y] = this.position
        this.ctx.fillRect(x, y, this.size, this.size);
    
    }

    collidesWith(pos){
        return pos[0] == this.position[0] && pos[1] == this.position[1]
    }
}