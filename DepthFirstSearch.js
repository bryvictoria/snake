export default class DepthFirstSearch{

    ctx = null
    board = {width:100,height:100,tileSize:4}

    chain = null
    _target = null
    nodes = null
    visitedNodes = new Set()
    goal = null
    obstacles = []
    start = null
    path = []
    nudge = true
    tiles = []
    markings = []
    ctr  = 0
    MAX_ITERATIONS = 10000
    allDirections = [];
    constructor(ctx,chain,target){
        this.ctx = ctx
        this.chain = chain
        this._target = target

        this.resetTiles()

        this.generateDirections()
    }

    generateDirections(){



    }

    draw(){
        const size = this.board.tileSize;

        this.ctx.stroke();
        for(let mark of this.path){
            this.colorTile(...mark,'yellow')
        }

        for(let mark of this.obstacles){
            this.colorTile(...mark)
        }
    }

    resetTiles(){

        for(let x = 0; x<= this.board.height; x++){
            this.tiles[x] = []
            for(let y = 0; y<= this.board.height; y++){
                this.tiles[x][y] = 0
            }
        }
    }

    _goalFound = false

    isGoalFound(){
        return this._goalFound
    }
    setTarget(target){
        this._target = target
    }
    setChain(chain){
        this.chain = chain
    }
    generatePath(){
        console.log('stalling..')
        this.resetTiles()

        const [head,...body] = this.chain
        this.start = head.position
        this.obstacles = this.chain.map(i => i.position)
/*
        // walls to simulate backtracking
        for (let col = 0; col <= 50; col += 4) {
            this.obstacles.push([52, col]); 
        }
        for (let col = 0; col <= 50; col += 4) {
            this.obstacles.push([col, 52]); 
        }

        this.obstacles.push([20,20])
        this.obstacles.push([16,20])
        this.obstacles.push([12,20])
        this.obstacles.push([8,20])
        this.obstacles.push([4,20])

        this.obstacles.push([12,16])
        this.obstacles.push([12,12])
        this.obstacles.push([12,8])

        this.obstacles.push([4,16])
        this.obstacles.push([4,12])
        this.obstacles.push([4,8])
*/
        this.goal = this._target.position
        this._goalFound = false
        
        this.nodes = [this.start]
        this.visitedNodes = new Set()
        this.path = []
        this.markings = [];
        this.ctr = 0

        //console.log('goal:'+JSON.stringify(this.goal))
        //console.log('head:'+JSON.stringify(this.start))
        //console.log('body:'+JSON.stringify(this.obstacles))
        
        while(this.nodes.length > 0 && !this._goalFound){
            this.searchNodes();
            
        }

        //console.log('goal reached:'+this._goalFound)
        //console.log('path:'+this.path.length+JSON.stringify(this.path))

        //console.log(this.validatePath(this.path))
        return this.path
    }

    validatePath(path) {
        const errors = [];
        for (let i = 1; i < path.length; i++) {
            const [x1,y1] = path[i-1], [x2,y2] = path[i];
            const dx = Math.abs(x2-x1), dy = Math.abs(y2-y1);
            if (dx > 0 && dy > 0) errors.push(`Index ${i}: [${x1},${y1}] → [${x2},${y2}] (diagonal)`);
            else if (dx + dy !== 4) errors.push(`Index ${i}: [${x1},${y1}] → [${x2},${y2}] (jump ${dx+dy})`);
        }
        return errors.length ? errors : [`All valid. Total: ${path.length}`];
    }
    colorTile(x,y,color){

    
        this.ctx.beginPath()
        this.ctx.fillStyle = color ?? 'brown'
        this.ctx.fillRect(x + this.board.tileSize/2, y +this.board.tileSize/2 , this.board.tileSize/2, this.board.tileSize/2)
        this.ctx.stroke()
        
    }
    collides(pos,_targetPos){
        return pos[0] == _targetPos[0] && pos[1] == _targetPos[1]
    }
    isPassable(node){
        if(
            node[0] < 0 || node[0] >= 400 
                || 
            node[1] < 0 || node[1] >= 400 
        )
            return false

        for(let obstacle of this.obstacles){
            if(this.collides(obstacle,node))
                return false 
        }
        for(let pathNode of this.path){
            if(this.collides(pathNode,node))
                return false 
        }

        return true
    }

    isVisited(point){
        return this.visitedNodes.has(`[${point[0]},${point[1]}]`)
    }

    depth = 0
    neighbors = []
    
    searchNodes(){
        let newNodes = []
        const len = this.nodes.length
        const tileSize = this.board.tileSize
        const directionsMap = [
            [0, tileSize], [tileSize, 0], [0, -tileSize], [-1 * tileSize, 0]
        ];
        let isBacktrack = false
        let neighborNodes = []
        //console.log('searchNodes',JSON.stringify(this.nodes),'track',JSON.stringify(this.neighbors))
        for(let i = 0; i < len ;i++){

            if(this.ctr > this.MAX_ITERATIONS)
                break;
            
            let node = this.nodes[i]

            if(!isBacktrack){
                let randomOrderedDirections = [[0,0], [0,0], [0,0], [0,0]];

                for (let i = 0; i < 4; i++) {
                    randomOrderedDirections[i][0] = directionsMap[i][0];
                    randomOrderedDirections[i][1] = directionsMap[i][1];
                }

                for (let i = 3; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    const temp = randomOrderedDirections[i];
                    randomOrderedDirections[i] = randomOrderedDirections[j];
                    randomOrderedDirections[j] = temp;
                }
                //console.log(JSON.stringify(randomOrderedDirections))
                neighborNodes = randomOrderedDirections.map((i,index) => [node[0]+i[0],node[1]+i[1]]).filter(i => this.isPassable(i) && !this.isVisited(i))
                
    
            } else{
                neighborNodes = this.neighbors.pop()
            }
            
            
            
            for(let j in neighborNodes){
                if(this.collides(neighborNodes[j],this.goal))
                    this._goalFound = true;
            }

            
            if(neighborNodes[0] != undefined){
                this.neighbors.push(neighborNodes)
                let firstNeighbor = neighborNodes[0]
                this.visitedNodes.add(`[${firstNeighbor[0]},${firstNeighbor[1]}]`)
                newNodes = [firstNeighbor]
                this.path.push(firstNeighbor)

                this.obstacles.unshift(firstNeighbor);
                this.obstacles.pop();

                this.markings.push([firstNeighbor[0],firstNeighbor[1],this.greenScale(this.ctr++)])
                this.depth++
                isBacktrack = false
            }else{

                if(this.depth >0) {
                    
                    this.depth--
                    this.neighbors.pop()
                    this.path.pop()
                    let poppedNode = this.path[this.path.length-1]
                    newNodes = [poppedNode]
                    if(poppedNode)
                        this.visitedNodes.add(`[${poppedNode[0]},${poppedNode[1]}]`)
                    isBacktrack = true
                }
            }
            //console.log(this.ctr,this.depth,node, isBacktrack,JSON.stringify(neighborNodes),JSON.stringify(this.path),'==>',JSON.stringify(newNodes))
        }
        
        this.nodes = newNodes
        
    }
    greenScale(i, totalSteps = 20) {
        const maxStep = totalSteps - 1;
        const clampedI = Math.max(0, Math.min(i, maxStep));
        
        const rValue = Math.round(255 - (clampedI * (255 / maxStep)));
        const rHex = rValue.toString(16).padStart(2, '0').toUpperCase();
        
        return `#${rHex}FF00`;
    }

}