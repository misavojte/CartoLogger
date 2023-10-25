/// <reference path="../../node_modules/chrome-types/index.d.ts" />

import { EventDataType } from "../commons/types";
import { Session } from "../Session/Session";
import {MonitorError} from "./MonitorError";

/**
 * Base class for all monitors.
 * Monitors are used to log events. To store the logs, use with any storage class (preferably with IndexedDB implementation).
 * Coupled with @see Session from which is logging time and other session info taken.
 * If needed, use @see MonitorCollection to control multiple monitors at once.
 * @abstract
 */
export abstract class Monitor {

  abstract readonly type: string;
  readonly session: Session;

  private onLogHooks: Array<(data: EventDataType) => any> = [];
  isActive: boolean = false;
  protected constructor(session: Session) {
    this.session = session;
  }
  log(data: EventDataType): void {
    if (!this.isActive) throw new MonitorError("Monitor is not active");
    this.onLogHooks.forEach((cb) => cb(data))
  }

  getTime(): { time: string; absoluteTime: string } {
    const time = Date.now()
    return {
        time: String(time - this.session.baseTime),
        absoluteTime: String(time)
    }
  }

  getStartTime(): { time: string; absoluteTime: string } {
    return {
        time: "0",
        absoluteTime: String(this.session.baseTime)
    }
  }

  getSessionInfo(): { session: string; task: string } {
    return {
        session: this.session.id,
        task: this.session.task
    }
  }

  on(event: "log", callback: (data: EventDataType) => any): void {
    if(event !== "log") throw new Error("Invalid event type");
    this.onLogHooks.push(callback);
  }

  off(event: "log", callback: (data: EventDataType) => any): void {
    if(event !== "log") throw new Error("Invalid event type");
    this.onLogHooks = this.onLogHooks.filter((cb) => cb !== callback);
  }

  /**
   * Clear the Monitor to stop logging and free up resources. Used before destroying the Monitor.
   */
  clear(): void {
    this.isActive = false;
    this.onLogHooks = [];
  }

  /**
   * Start the Monitor to begin logging
   */
  start(): void {
    this.isActive = true;
  }
}
