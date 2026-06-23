export default class DepthFirstSearch{

    ctx = null
    board = {width:100,height:100,tileSize:4}

    chain = null
    _target = null
    nodes = null
    visitedNodes = []
    goal = null
    obstacles = []
    start = null
    path = []
    nudge = true
    tiles = []
    markings = []
    ctr  = 0
    
    constructor(ctx,chain,target){
        this.ctx = ctx
        this.chain = chain
        this._target = target

        this.resetTiles()


    }

    draw(){
        const size = this.board.tileSize;

        this.ctx.stroke();
        for(let mark of this.markings){
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
        this.resetTiles()

        const [head,...body] = this.chain
        this.start = head.position
        this.obstacles = this.chain.map(i => i.position)
        this.goal = this._target.position
        this._goalFound = false
        
        this.nodes = [this.start]
        this.visitedNodes = []
        this.path = []
        this.markings = [];
        this.ctr = 0

        console.log('goal:'+JSON.stringify(this.goal))
        console.log('head:'+JSON.stringify(this.start))
        console.log('body:'+JSON.stringify(this.obstacles))
        
        while(this.nodes.length > 0 && !this._goalFound){
            this.searchNodes();
            
        }

        console.log('goal reached:'+this._goalFound)
        console.log('path:'+this.path.length+JSON.stringify(this.path))
        return this.path
    }


    colorTile(x,y,color){

    
        this.ctx.beginPath()
        this.ctx.fillStyle = color
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
        return this.visitedNodes.includes(JSON.stringify(point))
    }

    depth = 0
    neighbors = []
    searchNodes(){
        let newNodes = []
        const len = this.nodes.length
        const tileSize = this.board.tileSize
        for(let i = 0; i < len ;i++){
            
            let node = this.nodes[i]

            let directionsMap = [[0,tileSize],[tileSize,0],[0,-1*tileSize],[-1*tileSize,0]].sort(() => Math.random() - 0.5)
            let neighborNodes = directionsMap.map((i,index) => [node[0]+i[0],node[1]+i[1]]).filter(i => this.isPassable(i) && !this.isVisited(i))
            
            
            this.neighbors[this.depth] = neighborNodes
            for(let j in neighborNodes){
                if(this.collides(neighborNodes[j],this.goal))
                    this._goalFound = true;
            }

            
            if(neighborNodes[0] != undefined){
                let firstNeighbor = neighborNodes[0]
                this.visitedNodes.push(JSON.stringify(firstNeighbor))
                newNodes.push(firstNeighbor)
                this.path.push(firstNeighbor)

                this.markings.push([firstNeighbor[0],firstNeighbor[1],this.greenScale(this.ctr++)])
                this.depth++
            }else{
                this.depth--
                newNodes = this.neighbors[this.depth]
            }
            
        }
        
        this.nodes = newNodes
        
    }
    greenScale(i, totalSteps = 400) {
        const maxStep = totalSteps - 1;
        const clampedI = Math.max(0, Math.min(i, maxStep));
        
        const rValue = Math.round(255 - (clampedI * (255 / maxStep)));
        const rHex = rValue.toString(16).padStart(2, '0').toUpperCase();
        
        return `#${rHex}FF00`;
    }

}