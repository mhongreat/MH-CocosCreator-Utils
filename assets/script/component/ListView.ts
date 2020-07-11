const { ccclass, property, } = cc._decorator;

const ListMode = cc.Enum({
    Normal: 0,
    Frame: 1,
    Virtual: 2
})

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
/** 
 * listview支持三种加载模式
 * Virtual模式目前仅支持水平(left-right)和垂直(top-bottom)布局,且需要为content设置好锚点并添加layout组件  
 */
@ccclass
export default class ListView extends cc.Component {
    @property({
        type: ListMode,
        tooltip: "Normal：普通list，Frame：分帧加载list，Virtual：虚拟list"
    })
    mode = ListMode.Normal;
    @property(cc.Prefab)
    listItem: cc.Prefab = null;
    @property({
        tooltip: "每帧消耗多少时间用于加载list，单位ms，建议3～8ms",
        visible: function () { return this.mode == ListMode.Frame }
    })
    frameCost = 3;
    @property({
        type: cc.Integer,
        range: [1, 5],
        displayName: "刷新频率",
        tooltip: "List每多少帧刷新一次",
        visible: function () { return this.mode == ListMode.Virtual }
    })
    frequency = 1;

    private _itemNum: number = 0;
    public get itemNum() {
        return this._itemNum;
    }
    public set itemNum(value) {
        this._itemNum = value;
        switch (this.mode) {
            case ListMode.Normal:
                this.normalLoadList(); break;
            case ListMode.Virtual:
                this.loadVirtualList(); break;
            case ListMode.Frame:
                this.frameLoadList(); break;
        }
    }
    public renderItem: (index: number, obj: cc.Node) => void = null;

    scrollView: cc.ScrollView = null;
    content: cc.Node = null;

    //虚拟list相关属性
    scrollMode: ScrollMode = 0;
    refreshCount = 0;
    viewNode: cc.Node = null;
    layout: cc.Layout = null;
    itemIndexKey = "_mIndex";
    lastOffset = cc.v2(0, 0);
    itemDict: { [index: number]: cc.Node } = {};
    firstItem: cc.Node = null;
    lastItem: cc.Node = null;

    onLoad() {
        this.scrollView = this.getComponent(cc.ScrollView);
        this.content = this.scrollView.content;
        if (this.mode == ListMode.Virtual) {
            this.scrollMode = this.scrollView.horizontal ? ScrollMode.Horizontal : ScrollMode.Vertical;
            this.layout = this.content.getComponent(cc.Layout)
            this.layout.enabled = false;
            this.node.on("scrolling", this.scrolling, this);
            this.checkAnchor();
        }
    }

    /** 监听滚动事件 */
    scrolling() {
        if (this.refreshCount++ % this.frequency != 0) return;
        this.refreshCount = 0;
        let offset = this.scrollView.getScrollOffset();
        if (!this.checkScrollValid(offset)) return;
        if (this.scrollMode == ScrollMode.Horizontal) {
            let deltaX = offset.x - this.lastOffset.x;
            if (deltaX < 0) {//LEFT
                this.setListView(ScrollType.Left);
            } else if (deltaX > 0) {//RIGHT
                this.setListView(ScrollType.Right);
            }
        } else if (this.scrollMode == ScrollMode.Vertical) {
            let deltaY = offset.y - this.lastOffset.y;
            if (deltaY > 0) {//UP
                this.setListView(ScrollType.Up);
            } else if (deltaY < 0) {//DOWN
                this.setListView(ScrollType.Down);
            }
        }
        this.lastOffset = offset;
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

    /** 加载虚拟列表 */
    loadVirtualList() {
        this.setContentSize();
        this.initContent();
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
                if (i == 0) {
                    this.firstItem = v;
                }
                if (i == this.content.childrenCount - 1) {
                    this.lastItem = v;
                }
            }
            this.setItemPosByIndex(i, v);
        });
    }

    /** 手动设置content大小 */
    setContentSize() {
        if (this.layout.type != cc.Layout.Type.HORIZONTAL && this.layout.type != cc.Layout.Type.VERTICAL) {
            console.error("暂时只支持content布局类型为水平或者垂直");
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

    /** 滚动时动态调整item位置 */
    setListView(type: ScrollType) {
        console.log(type);

        let offsetX = Math.abs(this.scrollView.getScrollOffset().x);
        let offsetY = Math.abs(this.scrollView.getScrollOffset().y);
        if (type == ScrollType.Up || type == ScrollType.Left) {
            if (
                (this.scrollMode == ScrollMode.Horizontal && offsetX > Math.abs(this.firstItem.x + this.firstItem.width / 2)) ||
                (this.scrollMode == ScrollMode.Vertical && offsetY > Math.abs(this.firstItem.y - this.firstItem.height / 2))
            ) {
                let lastItemIndex = this.lastItem[this.itemIndexKey];
                if (lastItemIndex >= this.itemNum - 1) return;
                let newIndex = lastItemIndex + 1;
                this.setItemPosByIndex(newIndex, this.firstItem);
                this.lastItem = this.firstItem;
                this.firstItem = this.itemDict[newIndex - this.content.childrenCount + 1];
            }
        } else {
            if (
                (this.scrollMode == ScrollMode.Horizontal && offsetX < Math.abs(this.lastItem.x - this.viewNode.width - this.lastItem.width / 2)) ||
                (this.scrollMode == ScrollMode.Vertical && offsetY < Math.abs(this.lastItem.y + this.viewNode.height + this.lastItem.height / 2))
            ) {
                let firstItemIndex = this.firstItem[this.itemIndexKey];
                if (firstItemIndex <= 0) return;
                let newIndex = firstItemIndex - 1;
                this.setItemPosByIndex(newIndex, this.lastItem);
                this.firstItem = this.lastItem;
                this.lastItem = this.itemDict[newIndex + this.content.childrenCount - 1];
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
        this.itemDict[index] = item;
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
        if (this.scrollView.horizontal == this.scrollView.vertical) {
            console.error("Virtual模式仅支持单方向滚动");
        }
    }

    /** 检测滚动是否有效 */
    checkScrollValid(offset: cc.Vec2) {
        if (this.scrollMode == ScrollMode.Horizontal) {
            if (offset.x >= 0 || offset.x <= this.viewNode.width - this.content.width)
                return false;
        } else if (this.scrollMode == ScrollMode.Vertical) {
            if (offset.y <= 0 || offset.y >= this.content.height - this.viewNode.height)
                return false;
        }
        return true;
    }

    /** 普通方式加载list */
    normalLoadList() {
        if (this.content.childrenCount > this.itemNum) {
            for (let i = this.itemNum; i < this.content.childrenCount; i++) {
                this.content.children[i].active = false;
            }
        }
        for (let i = 0; i < this.itemNum; i++) {
            let node = cc.instantiate(this.listItem);
            this.content.addChild(node);
            this.renderItem && this.renderItem(i, node);
        }
    }

    /** 分帧加载list */
    frameLoadList() {
        if (this.content.childrenCount > this.itemNum) {
            for (let i = this.itemNum; i < this.content.childrenCount; i++) {
                this.content.children[i].active = false;
            }
        }
        let gen = this.itemGen();
        let p = new Promise((resolve, reject) => {
            let execute = () => {
                let d1 = Date.now();
                for (let e = gen.next(); ; e = gen.next()) {
                    if (!e || e.done) {
                        resolve();
                        break;
                    }
                    if (typeof e.value == "function") {
                        e.value();
                    }
                    let d2 = Date.now();
                    if (d2 - d1 >= this.frameCost) {
                        new cc.Component().scheduleOnce(execute);
                        break;
                    }
                }
            }
            execute();
        });
        return p;
    }

    /** item生成器 */
    *itemGen() {
        for (let i = 0; i < this.itemNum; i++) {
            let func = () => {
                let node = this.content.children[i] || cc.instantiate(this.listItem);
                this.content.addChild(node);
                this.renderItem && this.renderItem(i, node);
            }
            yield func;
        }
    }

}
