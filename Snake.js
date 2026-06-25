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
        
    }
    setInitialPosition(points){
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
        this.chain[0].color= 'blue'
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