import GameObject from './GameObject.js'

export class SnakeChain extends GameObject {
    constructor(ctx,x=0,y=0){
        super(ctx)
        this.position = [x,y]
    }
    
    update(){

    }
}
export const DIRECTIONS = {UP:1,DOWN:2,LEFT:3,RIGHT:4}
const OPPOSITE_DIRECTIONS = {
    [DIRECTIONS.UP]: DIRECTIONS.DOWN,
    [DIRECTIONS.DOWN]: DIRECTIONS.UP,
    [DIRECTIONS.LEFT]: DIRECTIONS.RIGHT,
    [DIRECTIONS.RIGHT]: DIRECTIONS.LEFT
};
export default class Snake{

    size = 4
    chain = []
    initCount = 4
    chainCount = 0;
    direction = DIRECTIONS.RIGHT
    path = [];
    constructor(ctx,chainCount = 4){
        
        this.initCount = chainCount
        this.ctx = ctx
    
        this.init()
        //this.preinit([[20,52],[24,52],[24,56],[28,56],[28,60],[32,60],[32,64],[36,64],[36,68],[40,68],[40,72],[44,72],[44,76],[48,76],[48,80],[48,84],[48,88],[48,92],[48,96],[48,100],[48,104],[52,104],[56,104],[60,104],[64,104],[68,104],[72,104],[76,104],[80,104],[84,104],[88,104],[92,104],[92,100],[92,96],[92,92],[92,88],[92,84],[92,80],[92,80]])
    }
    preinit(points){
        this.chainCount = 0
        for(let  i = 0; i < points.length ; i++) {
            this.chain.push(new SnakeChain(this.ctx, points[i][0], points[i][1]));
            this.chainCount++
        }
        
    }
    init(){
        this.chainCount = 0

        for(let  i = this.initCount -1; i >= 0 ; i--) {
            this.chain.push(new SnakeChain(this.ctx, i * this.size ,4));
            this.chainCount++
        }
        
    }

    setPath(path){
        this.path = path
    }

    reset(){
        this.chain = []
        this.direction = DIRECTIONS.RIGHT
        this.init()
    }

    move(){

        for(let i = this.chainCount-1; i > 0; i--){
            this.chain[i].position = [...this.chain[i-1].position]
        }

        this.moveHead()
    
    }

    changeDirection(direction){
        if (OPPOSITE_DIRECTIONS[this.direction] === direction) return;

        this.direction = direction
    }

    headCollidesWith(pos){
        return this.chain[0].collidesWith(pos)
    }

    headHitsBody(){
        let collided = false
        for(let  i = 1; i < this.chainCount; i++) {
            if(this.chain[0].collidesWith(this.chain[i].position)){
                collided = true
                break
            }
        }
        return collided
    }

    headHitsWall(){
        
        if(
            this.chain[0].position[0] < 0 || this.chain[0].position[0] > 400 
                || 
            this.chain[0].position[1] < 0 || this.chain[0].position[1] > 400 
        )
            return true
    }

    moveHead(){
        
        if(this.path.length){
            this.chain[0].position = this.path.shift()
        }else{
            if(this.direction == DIRECTIONS.LEFT){
                this.chain[0].position[0] -= this.size;
            }
            else if(this.direction == DIRECTIONS.RIGHT){
                this.chain[0].position[0] += this.size;
            }
            else if(this.direction == DIRECTIONS.UP){
                this.chain[0].position[1] -= this.size;
            }
            else if(this.direction == DIRECTIONS.DOWN){
                this.chain[0].position[1] += this.size;
            }
        }
    }

    addChain(x,y){
        let newTail = new SnakeChain(this.ctx, this.chain[this.chain.length-1].position[0] ,this.chain[this.chain.length-1].position[1])
        this.chain.push(newTail);
        this.chainCount++
    }

    getHeadPosition(){
        return this.chain[0].position
    }
    
    update(){

        this.move()
        
    }

    draw(){

        for(let  i = 0; i < this.chainCount; i++) {
            this.chain[i].draw()
        }

    }


}