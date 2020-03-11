/** 对象池枚举 */
export enum PoolEnum {
    MOU,
    HONG
}

/** 对象池工具类 */
export class PoolUtil {
    static _ctor = PoolUtil.clear();
    static _prefabs: Map<PoolEnum, cc.Prefab> = new Map();
    static _pools: Map<PoolEnum, cc.NodePool> = new Map();

    /**
     * 初始化一个对象池
     * @param poolName 对象池名字
     * @param prefab 预制体
     * @param num 初始化节点数量
     */
    static initPool(poolName: PoolEnum, prefab: cc.Prefab, num: number = 10) {
        if (!PoolUtil._pools.has(poolName)) {
            let pool = new cc.NodePool();
            PoolUtil._prefabs.set(poolName, prefab);
            PoolUtil._pools.set(poolName, pool);
            for (let i = 0; i < num; i++) {
                PoolUtil._pools.get(poolName).put(cc.instantiate(prefab));
            }
        } else {
            console.warn("请勿重复创建对象池!");
        }
    }

    /**
     * 从对象池中获取节点
     * @param poolName 对象池名字
     */
    static get(poolName: PoolEnum) {
        if (PoolUtil._pools.has(poolName)) {
            let pool = PoolUtil._pools.get(poolName);
            if (pool.size() > 0) {
                return pool.get();
            } else {
                return cc.instantiate(PoolUtil._prefabs.get(poolName));
            }
        } else {
            console.error("对象池不存在!");
        }
    }

    /**
     * 回收节点
     * @param poolName 对象池名字
     * @param nodeRes 节点或节点数组
     */
    static put(poolName: PoolEnum, nodeRes: cc.Node | cc.Node[]) {
        if (PoolUtil._pools.has(poolName)) {
            let pool = PoolUtil._pools.get(poolName);
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

    /**
     * 切换场景时释放节点池资源
     */
    static clear() {
        cc.director.on(cc.Director.EVENT_BEFORE_SCENE_LAUNCH, () => {
            PoolUtil._pools.forEach(pool => {
                pool.clear();
            });
            PoolUtil._prefabs.clear();
            PoolUtil._pools.clear();
        });
    }
}

