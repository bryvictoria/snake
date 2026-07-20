import SearchAlgorithm from './SearchAlgorithm.js'


export default class DepthFirstSearch extends SearchAlgorithm{

    
    
    nodes = null
    visitedNodes = new Set()
    goal = null
    obstacles = []
    start = null
    path = []
    pathSet = new Set()
    obstacleSet = new Set()
    nudge = true
    
    ctr  = 0
    MAX_ITERATIONS = 1000
    allDirections = [];

    
    draw(){

        const size = this.board.tileSize;

        this.ctx.stroke();
        for(let mark of this.path){
            this.colorTile(...mark,'yellow')
        }

        if(this.obstacles)
        for(let mark of this.obstacles){
            if(mark){
                this.colorTile(...mark,'red')
            }
        }

        for(let mark of this.walls){
            this.colorTile(...mark,'blue')
        }


    }

    

    

    walls = []//for debugging
    generatePath(){
        console.log('stalling..')
        this.resetTiles()

        const [head,...body] = this.chain
        this.start = head.position
        this.obstacles = this.chain.map(i => i.position).reverse()
        this.obstacleSet = new Set(this.obstacles.map(i => i[0]+','+i[1]))

        this.walls = [
        //    [392,0],[392,4],[392,8],[392,12],[392,16],
        //    [388,16],[384,16],[380,16],[376,16],[372,16],[368,16], [364,16], [360,16], [356,16], [352,16], [348,16], [344,16], [340,16], [336,16], [332,16]
        ]

        this.goal = this._target.position
        this._goalFound = false
        
        this.nodes = [this.start]
        this.visitedNodes = new Set()
        this.path = []
        this.pathSet = new Set();

        this.ctr = 0

        console.log('DFS')
    //    console.log('goal:'+JSON.stringify(this.goal))
    //    console.log('head:'+JSON.stringify(this.start))
    //    console.log('body:'+JSON.stringify(this.obstacles))
        
        //try{
            while(this.nodes.length > 0 && !this._goalFound){
                this.searchNodes()
                
            }
        //} catch(e){
        //    console.log(e.message)
        //}

    //    console.log('goal reached:'+this._goalFound)
    //    console.log('path:'+this.path.length+JSON.stringify(this.path))

        return this.path

    }

    colorTile(x,y,color){

    
        this.ctx.beginPath()
        this.ctx.fillStyle = color ?? 'brown'
        this.ctx.fillRect(x + this.board.tileSize/2, y +this.board.tileSize/2 , this.board.tileSize/2, this.board.tileSize/2)
        this.ctx.stroke()
        
    }
    
    

    isPassable(node){
        if(
            node[0] < 0 || node[0] >= 400 
                || 
            node[1] < 0 || node[1] >= 400 
        )
            return false

        let isPassable = !this.obstacleSet.has(node[0]+','+node[1]);

        if(isPassable) 
            isPassable = !this.pathSet.has(node[0]+','+node[1])

        return isPassable

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
                this.pathSet.add(firstNeighbor[0]+','+firstNeighbor[1])

                this.obstacles.push(firstNeighbor)
                const removedSet = this.obstacles.shift()

                this.obstacleSet.add(firstNeighbor[0]+','+firstNeighbor[1])
                this.obstacleSet.delete(removedSet[0]+','+removedSet[1])

                
                this.depth++
                isBacktrack = false

            }else if(this.depth > 0) {
                    
                this.depth--
                this.neighbors.pop()
                
                const removedSet = this.obstacles.pop()

                let backNode = null
                let backNodeIndex = this.path.length - this.obstacles.length - 2

                if(backNodeIndex < 0){
                    backNodeIndex = this.chain.length - (this.obstacles.length - this.path.length)
                
                }

                backNode = this.path[backNodeIndex]
                if(backNode){
                    this.obstacles.unshift(backNode)
                    this.obstacleSet.add(backNode[0]+','+backNode[1])
                }
                this.obstacleSet.delete(removedSet[0]+','+removedSet[1])
                
                const removed = this.path.pop()
                this.pathSet.delete(removed[0]+','+removed[1])

                
                let poppedNode = this.path[this.path.length-1]
                newNodes = [poppedNode]
                if(poppedNode)
                    this.visitedNodes.add(`[${poppedNode[0]},${poppedNode[1]}]`)
                isBacktrack = true
            
            }
            
        }
        


        this.nodes = newNodes
        this.ctr++
    
    }

    
    setObstacle(){
        this.obstacles = [];
        if(this.path.length >= this.chain.length){
            this.obstacles = this.path.slice( this.path.length - this.chain.length, this.path.length )
        }else{
            this.obstacles = [ ...this.path, ...this.chain.map(i=>i.position).slice( 0, this.chain.length - this.path.length ) ]
        }
        this.obstacleSet = new Set(this.obstacles.map(i => i[0]+','+i[1]))
    }
    

}