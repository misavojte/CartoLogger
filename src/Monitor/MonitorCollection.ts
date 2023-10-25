import { Monitor } from "./Monitor";
import { Session } from "../Session/Session";
import {EventDataType} from "../commons/types";
import {MonitorError} from "./MonitorError";

/**
 * Collection of monitors that share the same session.
 * Used to control all monitors at once.
 * If any of the monitors fails, whole collection fails.
 */
export class MonitorCollection {
  readonly monitors: Monitor[];
  readonly session: Session;

  isCleared: boolean = false;
  isActive: boolean = false;

  public static hasSameSession(monitors: Monitor[]): boolean {
    if (monitors.length === 0) return false;
    const session = monitors[0].session;
    for (const monitor of monitors) {
      if (monitor.session !== session) return false;
    }
    return true;
  }

  constructor(monitors: Monitor[]) {
    if (!MonitorCollection.hasSameSession(monitors)) throw new MonitorError("All monitors in collection must have the same session");
    this.monitors = monitors;
    this.session = monitors[0].session;
  }

  /**
   * Start all monitors in the collection.
   * @throws {MonitorError} If any monitor fails to start.
   */
  start(): void {
    if (this.isActive) throw new MonitorError("Already active");
    try {
      for (const monitor of this.monitors) {
        monitor.start();
      }
      this.isActive = true;
      this.isCleared = false;
    } catch (error) {
      throw new MonitorError(`Failed to start all monitors: ${error.message}`);
    }
  }

  /**
   * Add a callback to be called when any of the monitors in the collection logs an event.
   * @param event
   * @param handler
   * @throws {MonitorError} If any monitor fails to add the callback.
   */
  on(event: "log", handler: ( data: EventDataType ) => any): void {
    try {
      for (const monitor of this.monitors) {
        monitor.on(event, handler);
      }
    } catch (error) {
        throw new MonitorError(`Failed to add callback to all monitors: ${error.message}`);
    }
  }

  /**
   * Remove a callback that was added with on().
   * @param event
   * @param handler
   * @throws {MonitorError} If any monitor fails to remove the callback.
   */
  off(event: "log", handler: ( data: EventDataType ) => any): void {
    try {
      for (const monitor of this.monitors) {
        monitor.off(event, handler);
      }
    } catch (error) {
        throw new MonitorError(`Failed to remove callback from all monitors: ${error.message}`);
    }
  }

  /**
   * Clear all monitors in the collection.
   * @throws {MonitorError} If any monitor fails to clear.
   */
  clear(): void {
    if (this.isCleared) throw new MonitorError("Already cleared");
    try {
      this.isCleared = true;
      this.isActive = false;
      for (const monitor of this.monitors) {
        monitor.clear();
      }
    } catch (error) {
      throw new MonitorError(`Failed to clear all monitors: ${error.message}`);
    }
  }
}
