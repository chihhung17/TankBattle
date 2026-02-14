/** 状态机接口 */
export interface ISate {
    name: string;
    enter(): void;
    exit(): void;
    update(dt: number): void
}
