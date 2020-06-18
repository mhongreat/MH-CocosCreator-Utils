const { ccclass, property } = cc._decorator;

const ScrollMode = cc.Enum({
    Horizontal: 1,
    Vertical: 2
})

@ccclass
export default class ListView extends cc.Component {
    @property({
        type: ScrollMode
    })
    scrollMode = ScrollMode.Horizontal;

    @property(cc.Prefab)
    listItem: cc.Prefab = null;

    scrollView: cc.ScrollView = null;
    layout: cc.Layout = null;

    lastPosX: number = 0;
    lastPosY: number = 0;
    itemArray: cc.Node[] = [];


    private _itemNum: number = 0;
    public get itemNum() {
        return this._itemNum;
    }
    public set itemNum(value) {
        this._itemNum = value;
        this.setContentSize();
    }

    scrollViewRect: cc.Rect = null;
    contentRect: cc.Rect = null;

    onLoad() {
        this.scrollView = this.getComponent(cc.ScrollView);
        this.scrollView["listView"] = this;
        this.lastPosX = this.scrollView.content.x;
        this.lastPosY = this.scrollView.content.y;
        this.layout = this.scrollView.content.getComponent(cc.Layout);
        this.scrollViewRect = this.node.getBoundingBoxToWorld();
        console.log(this.node);
        console.log(this.scrollViewRect);
        
        this.node.on("scrolling", this.scrolling, this);
    }

    scrolling() {
        if (!this.checkScrollValid()) return;
        if (this.scrollMode == ScrollMode.Horizontal) {
            let deltaX = this.scrollView.content.x - this.lastPosX;
            this.lastPosX = this.scrollView.content.x;
            if (deltaX < 0) {//LEFT
                console.log("LEFT");

            } else {//RIGHT
                console.log("RIGHT");
            }
        } else if (this.scrollMode == ScrollMode.Vertical) {
            let deltaY = this.scrollView.content.y - this.lastPosY;
            this.lastPosY = this.scrollView.content.y;
            if (deltaY > 0) {//UP
                console.log("UP");
            } else {//DOWN
                console.log("DOWN");
            }
        }

    }

    /**
     * 取消content自适应大小 手动设置
     */
    setContentSize() {
        this.layout.resizeMode = cc.Layout.ResizeMode.NONE;
        if (this.layout.type != cc.Layout.Type.HORIZONTAL && this.layout.type != cc.Layout.Type.VERTICAL) {
            console.warn("暂时只支持Layout布局类型为水平或者垂直");
            return;
        }
        if (this.scrollMode == ScrollMode.Horizontal) {
            let itemWidth = this.listItem.data.width;
            if (this.layout.affectedByScale) itemWidth *= this.listItem.data.scaleX;
            this.scrollView.content.width = this.layout.paddingLeft + this.layout.paddingRight
                + itemWidth * this._itemNum + (this._itemNum - 1) * this.layout.spacingX;
        } else if (this.scrollMode == ScrollMode.Vertical) {
            let itemHeight = this.listItem.data.height;
            if (this.layout.affectedByScale) itemHeight *= this.listItem.data.scaleY;
            this.scrollView.content.height = this.layout.paddingTop + this.layout.paddingBottom
                + itemHeight * this._itemNum + (this._itemNum - 1) * this.layout.spacingY;
        }
    }

    checkScrollValid() {
        this.contentRect = this.scrollView.content.getBoundingBoxToWorld();
        if (this.scrollMode == ScrollMode.Horizontal) {
            if (this.contentRect.xMin >= this.scrollViewRect.xMin || this.contentRect.xMax <= this.scrollViewRect.xMax)
                return false;
        } else if (this.scrollMode == ScrollMode.Vertical) {
            if (this.contentRect.yMin >= this.scrollViewRect.yMin || this.contentRect.yMax <= this.scrollViewRect.yMax)
            console.log("c ymin ",this.contentRect.yMin,"  s ymin ",this.scrollViewRect.yMin);
                return false;

            
        }
        return true;
    }

}
