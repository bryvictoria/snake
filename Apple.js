import GameObject from './GameObject.js'
export default class Apple extends GameObject{
    board = {width:100,height:100,tileSize:6,area: 600}

    freeCells

    constructor(x=0,y=0){
        super()
        this.color = 'red'
    }

    assignPosition(excludePositions){
        let randomPos = null 
        
        let freeCells = []
        let excludePositionSet = new Set([...excludePositions.map(i => (i[0]/this.board.tileSize )+','+(i[1]/this.board.tileSize))])

        for(let x = 0 ; x < this.board.width; x++){
            for(let y = 0 ; y < this.board.height; y ++){

                if(excludePositionSet.has(x+','+y)){
                    continue
                }

                freeCells.push((x*this.board.width) + y)
            }
        }

        let randomIndex = Math.floor(Math.random() * freeCells.length)
        
        if(freeCells[randomIndex] != undefined){

            randomPos = [ this.board.tileSize * Math.floor(freeCells[randomIndex]/this.board.width), this.board.tileSize * (freeCells[randomIndex] % this.board.width) ]
        }
        
        console.log('RI:' + JSON.stringify(randomIndex))
        console.log('S:' + JSON.stringify(excludePositions))
        console.log('C:' + JSON.stringify(freeCells))
        console.log('RP:' + JSON.stringify(randomPos))

        this.position = randomPos
    }
    assignPositionByLoopingUntilValid(excludePositions){
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
        
        if(this.position){
            ctx.beginPath();
            ctx.fillStyle = this.color
            
            ctx.fillRect(this.position[0], this.position[1], this.size, this.size);
            ctx.stroke();
        }
        
    }
    
}