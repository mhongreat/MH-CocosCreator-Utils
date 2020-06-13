/** 对象池枚举 */
export enum EPoolName {
    MOU,
    HONG
}

/** 对象池工具类 */
export class PoolUtil {

    private prefabs: Map<EPoolName, cc.Prefab> = new Map();
    private pools: Map<EPoolName, cc.NodePool> = new Map();
    private static _inst: PoolUtil = null;
    public static get inst() {
        if (!this._inst) {
            this._inst = new PoolUtil();
        }
        return this._inst;
    }
    
    private constructor() {
        cc.director.on(cc.Director.EVENT_BEFORE_SCENE_LAUNCH, () => {
            this.pools.forEach(pool => {
                pool.clear();
            });
            this.prefabs.clear();
            this.pools.clear();
        });
    }

    /**
     * 初始化一个对象池
     * @param poolName 对象池名字
     * @param prefab 预制体
     * @param num 初始化节点数量
     */
    initPool(poolName: EPoolName, prefab: cc.Prefab, num: number = 10) {
        if (!this.pools.has(poolName)) {
            let pool = new cc.NodePool();
            this.prefabs.set(poolName, prefab);
            this.pools.set(poolName, pool);
            for (let i = 0; i < num; i++) {
                this.pools.get(poolName).put(cc.instantiate(prefab));
            }
        } else {
            console.warn("请勿重复创建对象池!");
        }
    }

    /**
     * 从对象池中获取节点
     * @param poolName 对象池名字
     */
    get(poolName: EPoolName) {
        if (this.pools.has(poolName)) {
            let pool = this.pools.get(poolName);
            if (pool.size() > 0) {
                return pool.get();
            } else {
                return cc.instantiate(this.prefabs.get(poolName));
            }
        } else {
            console.error("对象池不存在!");
        }
    }

    /**
     * 回收节点
     * @param poolName 对象池名字
     * @param nodeRes 节点或节点数组
     */
    put(poolName: EPoolName, nodeRes: cc.Node | cc.Node[]) {
        if (this.pools.has(poolName)) {
            let pool = this.pools.get(poolName);
            if (nodeRes instanceof Array) {
                nodeRes.forEach(node => {
                    pool.put(node);
                })
            } else {
                pool.put(nodeRes);
            }
        } else {
            console.error("对象池不存在!");
        }
    }
}
