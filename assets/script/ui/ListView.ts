const { ccclass, property, } = cc._decorator;

enum ScrollMode {
    Horizontal,
    Vertical
}

enum ScrollType {
    Up,
    Down,
    Left,
    Right
}

@ccclass
export default class ListView extends cc.Component {

    @property(cc.Prefab)
    listItem: cc.Prefab = null;

    private _itemNum: number = 0;
    public get itemNum() {
        return this._itemNum;
    }
    public set itemNum(value) {
        if (!this.renderItem) {
            console.error("必须优先为renderItem赋值");
            return;
        }
        this._itemNum = value;
        this.setContentSize();
    }
    public renderItem: (index: number, obj: cc.Node) => void = null;

    scrollMode: ScrollMode = 0;
    scrollView: cc.ScrollView = null;
    viewNode: cc.Node = null;

    content: cc.Node = null;
    layout: cc.Layout = null;
    itemIndexKey = "_mIndex";
    lastPosX: number = 0;
    lastPosY: number = 0;

    onLoad() {
        this.scrollView = this.getComponent(cc.ScrollView);
        this.scrollMode = this.scrollView.horizontal ? ScrollMode.Horizontal : ScrollMode.Vertical;
        this.content = this.scrollView.content;
        this.layout = this.content.getComponent(cc.Layout)
        this.layout.enabled = false;
        this.lastPosX = this.content.x;
        this.lastPosY = this.content.y;
        this.node.on("scrolling", this.scrolling, this);
        this.checkAnchor();
    }

    scrolling() {
        if (!this.checkScrollValid()) return;
        if (this.scrollMode == ScrollMode.Horizontal) {
            let deltaX = this.scrollView.content.x - this.lastPosX;
            this.lastPosX = this.scrollView.content.x;
            if (deltaX < 0) {//LEFT
                this.setListView(ScrollType.Left);
            } else {//RIGHT
                this.setListView(ScrollType.Right);
            }
        } else if (this.scrollMode == ScrollMode.Vertical) {
            let deltaY = this.scrollView.content.y - this.lastPosY;
            this.lastPosY = this.scrollView.content.y;
            if (deltaY > 0) {//UP
                this.setListView(ScrollType.Up);
            } else {//DOWN
                this.setListView(ScrollType.Down);
            }
        }

    }

    /** 计算item所需数量 添加到content */
    initContent() {
        if (this.content.childrenCount > 0) return;
        let num = 0;
        if (this.scrollMode == ScrollMode.Horizontal) {
            let itemWidth = this.listItem.data.width + this.layout.spacingX;
            num = Math.ceil(this.viewNode.width / itemWidth) + 1;

        } else if (this.scrollMode == ScrollMode.Vertical) {
            let itemHeight = this.listItem.data.height + this.layout.spacingY;
            num = Math.ceil(this.viewNode.height / itemHeight) + 1;
        }
        this.listItem.data.anchorX = 0.5;
        this.listItem.data.anchorY = 0.5;
        for (let i = 0; i < num; i++) {
            this.content.addChild(cc.instantiate(this.listItem));
        }
    }

    /** 初始化ListView */
    initListView() {
        if (this.scrollMode == ScrollMode.Horizontal) {
            this.scrollView.scrollToLeft();
        } else if (this.scrollMode == ScrollMode.Vertical) {
            this.scrollView.scrollToTop();
        }
        this.content.children.forEach((v, i) => {
            if (i >= this.itemNum) {
                v.active = false;
            } else {
                v.active = true;
            }
            this.setItemPosByIndex(i, v);
        });
    }

    /** 手动设置content大小 */
    setContentSize() {
        this.initContent();
        this.initListView();
        if (this.layout.type != cc.Layout.Type.HORIZONTAL && this.layout.type != cc.Layout.Type.VERTICAL) {
            console.warn("暂时只支持content布局类型为水平或者垂直");
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

    /** 滚动是动态调整item位置 */
    setListView(type: ScrollType) {
        let offsetX = Math.abs(this.scrollView.getScrollOffset().x);
        let offsetY = Math.abs(this.scrollView.getScrollOffset().y);
        if (type == ScrollType.Up || type == ScrollType.Left) {
            let item = this.getItem(0);
            if (
                (this.scrollMode == ScrollMode.Horizontal && offsetX > Math.abs(item.x + item.width / 2)) ||
                (this.scrollMode == ScrollMode.Vertical && offsetY > Math.abs(item.y - item.height / 2))
            ) {
                let lastItemIndex = this.getItem(1)[this.itemIndexKey];
                if (lastItemIndex >= this.itemNum - 1) return;
                let newIndex = lastItemIndex + 1;
                this.setItemPosByIndex(newIndex, item);
            }
        } else {
            let item = this.getItem(1);
            if (
                (this.scrollMode == ScrollMode.Horizontal && offsetX < Math.abs(item.x - this.viewNode.width - item.width / 2)) ||
                (this.scrollMode == ScrollMode.Vertical && offsetY < Math.abs(item.y + this.viewNode.height + item.height / 2))
            ) {
                let firstItemIndex = this.getItem(0)[this.itemIndexKey];
                if (firstItemIndex <= 0) return;
                let newIndex = firstItemIndex - 1;
                this.setItemPosByIndex(newIndex, item);
            }
        }
    }

    /** 根据索引设置item位置 */
    setItemPosByIndex(index: number, item: cc.Node) {
        if (this.scrollMode == ScrollMode.Horizontal) {
            let x = this.layout.paddingLeft + (this.layout.spacingX + item.width) * index + item.width / 2;
            item.position = cc.v2(x, 0);
        } else if (this.scrollMode == ScrollMode.Vertical) {
            let y = - (this.layout.paddingTop + (this.layout.spacingY + item.height) * index + item.height / 2)
            item.position = cc.v2(0, y);
        }
        item[this.itemIndexKey] = index;
        this.renderItem && this.renderItem(index, item);
    }

    /** 检测content和item锚点是否设置正确 */
    checkAnchor() {
        this.viewNode = this.getComponentsInChildren(cc.Mask)[0].node;
        if (
            !((this.scrollMode == ScrollMode.Horizontal && this.content.anchorX == 0 && this.content.anchorY == 0.5) ||
                (this.scrollMode == ScrollMode.Vertical && this.content.anchorX == 0.5 && this.content.anchorY == 1))

        ) {
            console.error("水平滚动请将content锚点设置为(0,0.5)，垂直滚动请将Content锚点设置为(0.5,1)");
        }
        if (this.listItem.data.anchorX != 0.5 || this.listItem.data.anchorY != 0.5) {
            console.error("请将listItem锚点设置为(0.5,0.5)");
        }
    }

    /** 检测滚动是否有效 */
    checkScrollValid() {
        if (this.scrollMode == ScrollMode.Horizontal) {
            let offsetX = this.scrollView.getScrollOffset().x;
            if (offsetX >= 0 || offsetX <= this.viewNode.width - this.content.width)
                return false;
        } else if (this.scrollMode == ScrollMode.Vertical) {
            let offsetY = this.scrollView.getScrollOffset().y;
            if (offsetY <= 0 || offsetY >= this.content.height - this.viewNode.height)
                return false;
        }
        return true;
    }

    /** 从content获取item 0索引最小 1索引最大 */
    getItem(type: 0 | 1): cc.Node {
        let min = null, max = null;
        this.content.children.forEach((v, i) => {
            if (i == 0) {
                max = v;
                min = v;
            }
            let index = v[this.itemIndexKey];
            if (index > max[this.itemIndexKey]) {
                max = v;
            }
            if (index < min[this.itemIndexKey]) {
                min = v;
            }
        });
        return type == 0 ? min : max;
    }

}
