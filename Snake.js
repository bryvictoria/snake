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
        
//        this.preinit([[0,0],[4,0],[8,0],[12,0],[16,0],[20,0],[24,0],[28,0],[32,0],[36,0],[40,0],[44,0],[48,0],[52,0],[56,0],[60,0],[64,0],[68,0],[72,0],[76,0],[80,0],[84,0],[88,0],[92,0],[96,0],[100,0],[104,0],[108,0],[112,0],[116,0],[120,0],[124,0],[128,0],[132,0],[136,0],[140,0],[144,0],[148,0],[152,0],[156,0],[160,0],[164,0],[168,0],[172,0],[176,0],[180,0],[184,0],[188,0],[192,0],[196,0],[200,0],[204,0],[208,0],[212,0],[216,0],[220,0],[224,0],[228,0],[232,0],[236,0],[240,0],[244,0],[248,0],[252,0],[256,0],[260,0],[264,0],[268,0],[272,0],[276,0],[280,0],[284,0],[288,0],[292,0],[296,0],[300,0],[304,0],[308,0],[312,0],[316,0],[320,0],[324,0],[328,0],[332,0],[336,0],[340,0],[344,0],[348,0],[352,0],[356,0],[360,0],[364,0],[368,0],[372,0],[376,0],[380,0],[384,0],[388,0],[392,0],[396,0]])
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