import {Monitor} from "./Monitor";
import {Session} from "../Session/Session";

export class MonitorCustom extends Monitor {
    readonly type: string;
    constructor(session: Session, type: string) {
        super(session);
        this.type = type;
    }

    /**
     * Trigger a custom event to be logged
     * @param value - string value to be logged with the type specified in the constructor (lastType)
     * @param time - optional time object, if not provided, current time is used
     * @throws {MonitorError} if monitor is not active (use start() first, useful when in @see MonitorCollection)
     */
    trigger(value: string, time: {time: string, absoluteTime: string} = this.getTime()): void {
        this.log({
            ...this.getSessionInfo(),
            ...time,
            type: this.type,
            val: value
        });
    }
}