export default class Hamiltonian {

    ctx = null
    board = {width:10,height:10,tileSize:60,area: 600}
    #path = []
    #pos = []
    #sequence = []
    #simulation = []
    _goalFound = false
    #targetSequence
    constructor(ctx,chain,target){

    }

    setBoard(board){
        this.board = board
    }

    generateCombPath(){
        this.#path = [];
        let x =0,y=0, width = this.board.width,height = this.board.height,tileSize = this.board.tileSize
        for(let i = 0; i < width; i++){
            this.#path.push(this._key([x,y]))
            this.#pos.push([x,y])
            x += tileSize
        }
        x -= tileSize
        while(x >= 0){
            for(let j = 1; j < height ; j++){
                if((x/tileSize)%2 == 0 ){
                    this.#path.push(this._key([x,y]))
                    this.#pos.push([x,y])
                    y -= tileSize
                } else{
                    y += tileSize
                    this.#path.push(this._key([x,y]))
                    this.#pos.push([x,y])
                }
                
            }
            x -= tileSize 
        }
        this.#sequence = Object.fromEntries(this.#path.map((val, idx) => [val, idx]));
        return this.#path
    }
    _key(pos){
        return pos[0]/this.board.tileSize  + pos[1]/this.board.tileSize * this.board.width
    }
    hasPath(){
        return this.#path.length
    }
    getValidMoves(posseq,buffer,len){
        const width = this.board.width
        const height = this.board.height
        const area = (width * height)
        
        //[up,right,down,left];
        const directionsMap = [-width,1,width,-1];
        
        let validMoves = []

        let pos = this.#path[posseq]
        
        for(let i in directionsMap){
            let dir = pos + directionsMap[i]
            
            //clamp UD
            if(dir < 0 || dir >= area ) 
                continue
            
            //clamp LR
            if(
                ( ((pos+1)%width == 0) && i == 1)
                    ||
                ( (pos%width == 0) && i == 3)
            ){
                continue
            }
            if(this.#simulation.includes(this.#sequence[dir]))
                continue

            validMoves.push(dir)
            
        }

        return validMoves.map(i => this.#sequence[i])
    }

    getPathToTarget(segments,target){
        let seqpath = []

        let len = this.#path.length
        this.#targetSequence = this.#sequence[this._key(target)]
        
        let stopper = 0
        this.#simulation = []
        for(let i = 0; i < segments.length;i++){
            this.#simulation.push(this.#sequence[this._key(segments[i])])
        }

        let headseq = this.#sequence[this._key(segments[0])]
        do{
            let newMove = this.getNextMove()
            seqpath.push(newMove)
            this.#simulation.unshift(newMove)
            this.#simulation.pop()
            
        }while( !this._goalFound && stopper++ < 100)
        return seqpath.map(i => this.#pos[i])
    }
    getNextMove(){
        const len = this.#path.length

        const headseq  = this.#simulation[0]
        const tailseq  = this.#simulation[this.#simulation.length -1]
        
        const buffer = (tailseq - headseq + len) % len

        const defaultStep = (headseq + 1) % len

        if(buffer <= 1)
            return defaultStep

        let neighbors = this.getValidMoves(headseq)
        
        let bestStep = defaultStep
        let shortestDistance = (this.#targetSequence - headseq + len) % len

        for(let i in neighbors){
            let candidateseq = neighbors[i]

            // How far forward along the loop does this move jump us?
            let jumpdistance = (candidateseq - headseq + len) % len
            
            // SAFETY CHECK:
            // Must jump forward (> 0) AND must land safely behind the tail (-1 for growth margin)
            if(jumpdistance > 0 && jumpdistance < (buffer - 1)){
                
                // Measure how close this candidate gets us to the apple
                let distance = (this.#targetSequence - candidateseq + len) % len

                // Is this candidate closer to the apple than our current best choice?
                if(distance < shortestDistance){
                    shortestDistance = distance
                    bestStep = candidateseq
                }
            }
        }
        
        if(this.#targetSequence == bestStep)
            this._goalFound = true
        
        return bestStep
    }

    getApplePath(body,target){

        let len = this.#path.length
        let targetseq = this.#sequence[this._key(target)]
        let headseq = this.#sequence[this._key(body[0])]

        


        let seqpath = [];
        
        
        seqpath = Array.from({ length: targetseq+1 }, (_, i) => i)
        
        if(headseq > targetseq){
            let start = headseq+1
            if(start == this.#path.length )
                start = 0
            seqpath = Array.from({ length: this.#path.length-headseq-1 }, (_, i) => i+start).concat(seqpath)
        }else{
            seqpath = seqpath.slice(headseq+1)
        }


        return seqpath.map(i => this.#pos[i])

        
    }

    draw(ctx){

        const size = this.board.tileSize;

        ctx.stroke();
        if(this.#path)
            for(let mark of this.#path){
                let x = mark[0],y=mark[1]    
                ctx.beginPath()
                ctx.fillStyle = 'red'
                ctx.fillRect(x + this.board.tileSize/2, y +this.board.tileSize/2 , this.board.tileSize/2, this.board.tileSize/2)
                ctx.stroke()
            }
        

    }


}