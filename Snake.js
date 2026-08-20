import GameObject from './GameObject.js'

export class SnakeChain extends GameObject {
    frontDirection 
    backDirection

    constructor(x=0,y=0,size = 6){
        super()
        this.position = [x,y]
        this.size = size
    }
    update(){

    }
    drawShadow(ctx){
        if(ctx){
            ctx.fillStyle = 'green'
            const [x,y] = this.position
            let shadowSize = Math.floor(this.size * 0.2)
            if(
                (this.frontDirection == DIRECTIONS.LEFT || this.frontDirection == DIRECTIONS.RIGHT)
                    &&
                (this.backDirection == DIRECTIONS.LEFT || this.backDirection == DIRECTIONS.RIGHT)
            
            ){
                
                ctx.fillRect(x, y, this.size, shadowSize);
            }
        
            if(
                (this.frontDirection == DIRECTIONS.UP || this.frontDirection == DIRECTIONS.DOWN)
                    &&
                (this.backDirection == DIRECTIONS.UP || this.backDirection == DIRECTIONS.DOWN)
            
            ){
                ctx.fillRect(x, y, shadowSize, this.size);
            }

            if(this.frontDirection == DIRECTIONS.DOWN && this.backDirection == DIRECTIONS.LEFT){
                ctx.fillRect(x, y, this.size, shadowSize);
                ctx.fillRect(x, y, shadowSize, this.size);
            }
            if(this.frontDirection == DIRECTIONS.LEFT && this.backDirection == DIRECTIONS.UP){
                ctx.fillRect(x, y, this.size, shadowSize);
            }
            
            if(this.frontDirection == DIRECTIONS.RIGHT && this.backDirection == DIRECTIONS.DOWN){
               ctx.fillRect(x, y, shadowSize, this.size);
            }
            if(this.frontDirection == DIRECTIONS.RIGHT && this.backDirection == DIRECTIONS.UP){
               ctx.fillRect(x, y, shadowSize, this.size);
               ctx.fillRect(x, y, this.size, shadowSize);
            }

            if(this.frontDirection == DIRECTIONS.UP && this.backDirection == DIRECTIONS.LEFT){
               ctx.fillRect(x, y, shadowSize, this.size);
            }

            if(this.frontDirection == DIRECTIONS.UP && this.backDirection == DIRECTIONS.RIGHT){
               ctx.fillRect(x, y, shadowSize, shadowSize);
            }

            if(this.frontDirection == DIRECTIONS.LEFT && this.backDirection == DIRECTIONS.DOWN){
               ctx.fillRect(x, y, shadowSize, shadowSize);
            }

            if(this.frontDirection == DIRECTIONS.DOWN && this.backDirection == DIRECTIONS.RIGHT){
               ctx.fillRect(x, y, this.size, shadowSize);
            }
        }
    }
}
export const DIRECTIONS = {UP:1,DOWN:2,LEFT:3,RIGHT:4}
export const SNAKE_STATUSES = {CRAWLING:1,SCORED:2,GAMEOVER:3}
const OPPOSITE_DIRECTIONS = {
    [DIRECTIONS.UP]: DIRECTIONS.DOWN,
    [DIRECTIONS.DOWN]: DIRECTIONS.UP,
    [DIRECTIONS.LEFT]: DIRECTIONS.RIGHT,
    [DIRECTIONS.RIGHT]: DIRECTIONS.LEFT
};
export default class Snake{

    board = {width:100,height:100,tileSize:6,area: 600}
    chain = []
    initCount = 4
    chainCount = 0;
    direction = DIRECTIONS.RIGHT
    path = [];
    lastTailPos = null

    constructor(chainCount = 4){
        
        this.initCount = chainCount
    
        this.init()

    }

    setInitialPosition(points){
        this.chainCount = 0
        for(let  i = 0; i < points.length ; i++) {
            this.chain.push(new SnakeChain(points[i][0], points[i][1],this.board.tileSize));
            this.chainCount++
        }
        
    }
    setBoard(board){
        this.board = board
        this.chain = []
        this.chainCount = 0
        for(let i in this.chain){
            this.chain[i].setSize(this.board.tileSize)
        }
        this.init()

    }
    setPosition(points){
        this.chain = []
        this.chainCount = 0
        for(let  i = 0; i < points.length ; i++) {
            this.chain.push(new SnakeChain(points[i][0], points[i][1],this.board.tileSize));
            this.chainCount++
        }
        this.chain[0].color= 'green'
    }
    
    init(){
        this.chainCount = 0

        for(let  i = this.initCount -1; i >= 0 ; i--) {
            this.chain.push(new SnakeChain(i * this.board.tileSize ,this.board.tileSize, this.board.tileSize));
            this.chainCount++
        }
        this.chain[0].color= 'green'
        this.setLastTailPos()
    }

    setPath(path){
        this.path = path
    }

    reset(){
        this.chain = []
        this.direction = DIRECTIONS.RIGHT
        this.init()
    }

    setLastTailPos(){
        this.lastTailPos = [...this.chain[this.chain.length - 1].position]
    }

    move(){
        if(this.path.length){
            this.setLastTailPos()

            for(let i = this.chain.length-1; i > 0; i--){
                this.chain[i].position = [...this.chain[i-1].position]
            }

            this.moveHead()
        }

        this.setDirections()
        
    }

    setDirections(){
        for(let i = 0; i < this.chain.length; i++){
            let front = this.chain[i-1] ?? null
            let back = this.chain[i+1] ?? null

            this.chain[i].frontDirection = this.getDirection(this.chain[i].position,front?.position)
            this.chain[i].backDirection = this.getDirection(back?.position,this.chain[i].position)

        }
    }

    getDirection(from,to){
        if(from == null || to == null)
            return null
        let d = [from[0] - to[0],from[1] - to[1]]

        let dir = null
        if(d[0] == 0){
            if(d[1] > 0){
                dir = DIRECTIONS.UP
            }else{
                dir = DIRECTIONS.DOWN
            }
        }else{
            if(d[0] > 0){
                dir = DIRECTIONS.LEFT
            }else{
                dir = DIRECTIONS.RIGHT
            }

        }

        
        return dir
    }

    changeDirection(direction){
        if (OPPOSITE_DIRECTIONS[this.direction] === direction) return;

        this.direction = direction
    }

    headCollidesWith(pos){
        return this.chain[0].collidesWith(pos)
    }

    getStatus(goal = null){
        if(goal && this.headCollidesWith(goal)){
            return SNAKE_STATUSES.SCORED
        } else if(this.headHitsBody() || this.headHitsWall())
            return SNAKE_STATUSES.GAMEOVER
        else
            return SNAKE_STATUSES.CRAWLING
    }

    headHitsBody(){
        let collided = false
        for(let  i = 1; i < this.chainCount; i++) {
            if(this.chain[0].collidesWith(this.chain[i].position)){
                collided = true
                console.log('head hits body',this.chain[i].position)
                break
            }
        }
        return collided
    }

    headHitsWall(){
        
        if(
            this.chain[0].position[0] < 0 || this.chain[0].position[0] >= 600 
                || 
            this.chain[0].position[1] < 0 || this.chain[0].position[1] >= 600 
        ){
            console.log('head hits wall')
            return true
        }
    }


    moveHead(){
        
        let next = this.path.shift();

        if(
            Math.abs(next[0] - this.chain[0].position[0]) > this.board.tileSize
                || 
            Math.abs(next[1] - this.chain[0].position[1]) > this.board.tileSize
        ) {

            alert("theres a jump") 

            throw new Error('stopping here for debugging');

        }

        this.chain[0].position = [next[0], next[1]];
        
    }



    addChain(x,y){
        
        let newTail = new SnakeChain(this.lastTailPos[0] ,this.lastTailPos[1] ,this.board.tileSize)
        this.chain.push(newTail);
        this.chainCount++
    }

    getHeadPosition(){
        return this.chain[0].position
    }
    
    update(){

        this.move()
        
    }

    draw(ctx){

        for(let  i = 0; i < this.chainCount; i++) {
            this.chain[i].draw(ctx)
        }

    }


}