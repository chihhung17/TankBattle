import { AnimationClip, assetManager, AudioClip, Prefab, SpriteFrame, TiledMapAsset } from "cc"

/**
 * 异步加载工具
 */
export class LoadAnything {
    /** 返回预制体 */
    static async getPrefab(path: string): Promise<Prefab> {
        const prefab = await this.loadPrefab(path)
        return prefab
    }
    private static loadPrefab(path: string): Promise<Prefab> {
        return new Promise((resolve, reject) => {
            assetManager.loadBundle('remoteres', (err, bundle) => {
                if (err || !bundle) {
                    reject(err);
                    return;
                }
                bundle.load(path, Prefab, (err, prefab) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve(prefab);
                });
            });
        });
    }



    /** 返回角色spriteFrame */
    static async getSprie(path: string): Promise<SpriteFrame> {
        const spf = await this.loadSpf(path)
        return spf
    }
    private static loadSpf(path: string): Promise<SpriteFrame> {
        return new Promise((resolve, reject) => {
            assetManager.loadBundle('remoteres', (err, bundle) => {
                if (err || !bundle) {
                    reject(err)
                    return
                }
                bundle.load(path, SpriteFrame, (err, spf) => {
                    if (err) {
                        reject(err)
                        return
                    }
                    resolve(spf)
                })
            })
        })
    }


    /** 加载地图 */
    static loadSourceAssert(path: string): Promise<TiledMapAsset> {
        return new Promise((resolve, reject) => {
            assetManager.loadBundle("remoteres", (err, bundle) => {
                if (err || !bundle) {
                    reject(err)
                    return
                }
                bundle.load(path, TiledMapAsset, (err, map) => {
                    if (err) {
                        reject(err)
                        return
                    }
                    resolve(map)
                })
            })
        })
    }

    /** 获取动画组件 */
    static loadSourceAnimaClip(path: string): Promise<AnimationClip> {
        return new Promise((resolve, reject) => {
            assetManager.loadBundle("remoteres", (err, bundle) => {
                if (err || !bundle) {
                    reject(err)
                    return
                }
                bundle.load(path, AnimationClip, (err, clip) => {
                    if (err) {
                        reject(err)
                        return
                    }
                    resolve(clip)
                })
            })

        })
    }

    /** 加载音频 */
    static loadSourceAudioClip(path: string): Promise<AudioClip> {
        return new Promise((resolve, reject) => {
            assetManager.loadBundle("remoteres", (err, bundle) => {
                if (err || !bundle) {
                    reject(err)
                    return
                }
                bundle.load(path, AudioClip, (err, clip) => {
                    if (err) {
                        reject(err)
                        return
                    }
                    resolve(clip)
                })
            })
        })
    }
}


