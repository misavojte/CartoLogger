/// <reference path="../../node_modules/chrome-types/index.d.ts" />

import { EventDataType } from "../commons/types";
import { Session } from "../Session/Session";

export abstract class Monitor {
  session: Session;
  abstract lastType: string;
  onLogHooks: Array<(EventDataType) => any> = [];
  protected constructor(session: Session) {
    this.session = session;
  }
  log(data: EventDataType): void {
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

  on(event: "log", callback: (EventDataType) => any): void {
    if(event !== "log") throw new Error("Invalid event type");
    this.onLogHooks.push(callback);
  }

  off(event: "log", callback: (EventDataType) => any): void {
    if(event !== "log") throw new Error("Invalid event type");
    this.onLogHooks = this.onLogHooks.filter((cb) => cb !== callback);
  }

  /**
   * Clear the Monitor to stop logging and free up resources
   */
  abstract clear(): void;

  /**
   * Start the Monitor to begin logging
   */
  abstract start(): void;
}
