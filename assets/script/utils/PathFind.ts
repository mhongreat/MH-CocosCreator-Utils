export class MapGrid {
    constructor(index: number, pos: cc.Vec2) {
        this.index = index;
        this.pos = pos;
    }
    public index = 0;
    public pos: cc.Vec2 = null;
    public passable = true;
    public parentIndex = -1;
    public checked = false;
    public F: number = 0;//总计代价G+H
    public G: number = 0;//到目标点代价
    public H: number = 0;//到终点代价
}

export class PathFind {
    private constructor() { }
    private static _inst: PathFind = null;
    public static get inst() {
        if (!this._inst) {
            this._inst = new PathFind();
            this._inst.initMap();
        }
        return this._inst;
    }
    private designSize: cc.Size = null;
    private gridSize = 40;//格子大小必须被设计分辨率宽高同时整除
    private row = 0;
    private column = 0;
    private _gridList: MapGrid[] = null;
    public get gridList() { return this._gridList; }
    private openList: Set<MapGrid> = null;
    private startGrid: MapGrid = null;
    private endGrid: MapGrid = null;

    private initMap() {
        this._gridList = [];
        this.designSize = cc.find("Canvas").getComponent(cc.Canvas).designResolution;
        this.row = this.designSize.height / this.gridSize;
        this.column = this.designSize.width / this.gridSize;
        for (let i = 0; i < this.row; i++) {
            for (let j = 0; j < this.column; j++) {
                let index = i * this.column + j;
                let x = -this.designSize.width / 2 + j * this.gridSize + this.gridSize / 2;
                let y = this.designSize.height / 2 - i * this.gridSize - this.gridSize / 2;
                this._gridList.push(new MapGrid(index, cc.v2(x, y)));
            }
        }
        this.debugMap();
    }

    public getPath(start: cc.Vec2 | cc.Vec3, end: cc.Vec2 | cc.Vec3) {
        this._gridList.forEach(v => {
            v.parentIndex = -1;
            v.checked = false;
        });
        this.openList = new Set();
        this.startGrid = this.getGridByPos(start);
        this.endGrid = this.getGridByPos(end);

        console.log(`start=${this.startGrid.index}  end=${this.endGrid.index}`);

        let lastGrid = this.detectPath(this.startGrid);
        if (lastGrid) {
            let path: MapGrid[] = [];
            while (lastGrid.parentIndex != -1) {
                path.push(lastGrid);
                lastGrid = this._gridList[lastGrid.parentIndex];
            }
            path.push(this.startGrid);
            return path.reverse();
        } else {
            return null;
        }
    }

    public setGridPassable(passable: boolean, index: number | number[]) {
        if (Array.isArray(index)) {
            index.forEach(v => this._gridList[v].passable = passable);
        } else {
            this._gridList[index].passable = passable;
            console.log(this._gridList[index]);
        }

    }

    public getGridByPos(pos: cc.Vec2 | cc.Vec3) {
        let rowNo = ((this.designSize.height / 2 - this.gridSize / 2) - pos.y) / this.gridSize;
        rowNo = Math.ceil(rowNo);
        let columnNo = (pos.x - (-this.designSize.width / 2 + this.gridSize / 2)) / this.gridSize;
        columnNo = Math.ceil(columnNo);
        let index = rowNo * this.column + columnNo;
        return this._gridList[index];
    }

    private detectPath(grid: MapGrid): MapGrid {
        grid.checked = true;
        this.openList.delete(grid);
        let closeGrid = this.getCloseGrid(grid);
        closeGrid.forEach(v => this.openList.add(v));
        if (this.openList.size == 0) {//路径未找到
            return null;
        }
        if (closeGrid.indexOf(this.endGrid) != -1) {//寻路结束
            return this.endGrid;
        }
        let nextGrid = closeGrid[0];
        if (!nextGrid) {
            nextGrid = this._gridList[grid.parentIndex];
        }
        return this.detectPath(nextGrid);
    }

    private getCloseGrid(grid: MapGrid) {
        let index = grid.index;
        let up: MapGrid, down: MapGrid, left: MapGrid, right: MapGrid = null;
        let arr: MapGrid[] = [];
        let rowNo = Math.floor(index / this.column);
        let columnNo = index - rowNo * this.column;
        if (rowNo != 0) {
            up = this._gridList[index - this.column];
            arr.push(up);//上
        }
        if (rowNo != this.row - 1) {
            down = this._gridList[index + this.column];
            arr.push(down);//下
        }
        if (columnNo != 0) {
            left = this._gridList[index - 1];
            arr.push(left);//左
        }
        if (columnNo != this.column - 1) {
            right = this._gridList[index + 1];
            arr.push(right);//右
        }
        if (up) {
            if (left && (up.passable || left.passable)) {//左上
                arr.push(this._gridList[index - this.column - 1]);
            }
            if (right && (up.passable || right.passable)) {//右上
                arr.push(this._gridList[index - this.column + 1]);
            }
        }
        if (down) {
            if (left && (down.passable || left.passable)) {//左下
                arr.push(this._gridList[index + this.column - 1]);
            }
            if (right && (down.passable || right.passable)) {//右下
                arr.push(this._gridList[index + this.column + 1]);
            }
        }
        arr = arr.filter(v => {
            if (v.passable && !v.checked) {//未检测过的有效格子
                if (v.parentIndex == -1) {//未在openList中
                    v.parentIndex = index;
                }
                v.G = grid.pos.sub(v.pos).mag();
                v.H = this.endGrid.pos.sub(v.pos).mag();
                v.F = v.G + v.H;
                return true;
            }
        });
        arr.sort((a, b) => a.F - b.F);
        return arr;
    }

    private debugMap() {
        let debugMap = new cc.Node();
        debugMap.zIndex = 9999;
        debugMap.parent = cc.find("Canvas");
        for (let i = 0; i < this._gridList.length; i++) {
            let grid = this._gridList[i];
            let gridNode = new cc.Node();
            gridNode.position = grid.pos;
            debugMap.addChild(gridNode);
            let renderComp = gridNode.addComponent(cc.Graphics);
            renderComp.rect(-this.gridSize / 2 + 1, -this.gridSize / 2 + 1, this.gridSize - 2, this.gridSize - 2);
            renderComp.strokeColor = cc.Color.WHITE;
            renderComp.stroke();
            let labelNode = new cc.Node();
            let label = labelNode.addComponent(cc.Label);
            label.fontSize = this.gridSize / 2.5;
            label.lineHeight = this.gridSize / 2.5;
            label.string = grid.index + "";
            gridNode.addChild(labelNode);
        }
    }
}
