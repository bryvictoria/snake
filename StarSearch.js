import SearchAlgorithm from './SearchAlgorithm.js'


export default class StarSearch extends SearchAlgorithm{

    

    
    nodes = null
    visitedNodes = []
    goal = null
    obstacles = []
    start = null
    path = []
    nudge = true
    markings = []
    ctr  = 0
    
    

    draw(){
        const size = this.board.tileSize;

        this.ctx.stroke();
        for(let mark of this.markings){
            this.colorTile(...mark)
        }
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

    //    console.log('A*')
    //    console.log('goal:'+JSON.stringify(this.goal))
    //    console.log('head:'+JSON.stringify(this.start))
    //    console.log('body:'+JSON.stringify(this.obstacles))
        
        while(this.nodes.length > 0 && !this._goalFound){
            this.searchNodes();
            
        }

    //    console.log('goal reached:'+this._goalFound)
    //    console.log('path:'+JSON.stringify(this.path))
        return this.path
    }


    colorTile(x,y,color){

        if(this._goalFound){
            color = 'green'
        }else{
            color = 'red'
        }
        this.ctx.beginPath()
        this.ctx.fillStyle = color
        this.ctx.fillRect(x + this.board.tileSize/2, y +this.board.tileSize/2 , this.board.tileSize/2, this.board.tileSize/2)
        this.ctx.stroke()
        
    }
    
    isPassable(node){
        if(
            node[0] < 0 || node[0] > 400 
                || 
            node[1] < 0 || node[1] > 400 
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

    searchNodes(){
        let newNodes = []
        const len = this.nodes.length
        const tileSize = this.board.tileSize
        for(let i = 0; i < len ;i++){
            
            let node = this.nodes[i]

            let directionsMap = [[0,-1*tileSize],[0,tileSize],[tileSize,0],[-1*tileSize,0]]
            let neighborNodes = directionsMap.map((i,index) => [node[0]+i[0],node[1]+i[1]]).filter(i => this.isPassable(i) && !this.isVisited(i))

            let lowestGh = 999;
            let lowestNeighbor = null;

            let neighborsF = []
            for(let j in neighborNodes){

                this.visitedNodes.push(JSON.stringify(neighborNodes[i]))
                if(this.collides(neighborNodes[j],this.goal))
                    this._goalFound = true;
                
                let gh = this.computeManhattanDistance([neighborNodes[j][0],neighborNodes[j][1]],this.start) + (this.computeManhattanDistance([neighborNodes[j][0],neighborNodes[j][1]],this.goal) * (this.nudge?1.0001:1))
                neighborsF[j] = gh

            }

            let minIndex = neighborsF.indexOf(Math.min(...neighborsF));

            
            const isTie = neighborsF.every(v => v === neighborsF[0]);

            if(isTie){
                neighborsF = []
                for(let j in neighborNodes){

                    let gh = this.computeManhattanDistance([neighborNodes[j][0],neighborNodes[j][1]],this.start) + (this.computeDistance([neighborNodes[j][0],neighborNodes[j][1]],this.goal) * (this.nudge?1.0001:1))
                    neighborsF[j] = gh

                }
                minIndex = neighborsF.indexOf(Math.min(...neighborsF));
            }

            lowestNeighbor = neighborNodes[minIndex]
            if(lowestNeighbor != null){
                newNodes.push(lowestNeighbor)
                this.path.push(lowestNeighbor)

                this.obstacles.unshift(lowestNeighbor);
                this.obstacles.pop();

                this.markings.push([lowestNeighbor[0],lowestNeighbor[1],''])
            }
        }
        
        this.nodes = newNodes
        
    }
    

}