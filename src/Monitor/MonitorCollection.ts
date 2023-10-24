import { Monitor } from "./Monitor";
import { Session } from "../Session/Session";

export class MonitorCollection {
  monitors: Monitor[] = [];
  get session(): Session | null {
    if (this.monitors.length === 0) return null;
    return this.monitors[0].session;
  }
  constructor(monitors: Monitor[]) {
    this.monitors = monitors;
  }
  start(): void {
    for (const monitor of this.monitors) {
      monitor.start();
    }
  }

  on(event: "log", handler: ( EventDataType ) => any): void {
    for (const monitor of this.monitors) {
      monitor.on(event, handler);
    }
  }

  off(event: "log", handler: ( EventDataType ) => any): void {
    for (const monitor of this.monitors) {
      monitor.off(event, handler);
    }
  }

  clear(): void {
    for (const monitor of this.monitors) {
      monitor.clear();
      monitor.onLogHooks = [];
    }
  }
}
