import { MonitorElement } from "./MonitorElement";
import { Session } from "../../Session/Session";
import {MonitorCustom} from "../MonitorCustom";
import {EventDataType} from "../../commons/types";

/**
 * Monitors mouse wheel start and end, calculated from the time between two wheel events.
 * It uses @see MonitorCustom to log the end of the wheel event. The type of the event is "mouse_wheel_end".
 * The value of the event is the delta of the wheel event.
 */
export class MonitorElementMouseWheel extends MonitorElement {

  isZooming: boolean = false;
  zoomingTimerId: number | null = null;

  readonly type = "mouse_wheel_start";
  readonly wheelEndMonitor: MonitorCustom;

  static ZOOMING_TIMEOUT = 200;

  /**
   * Event handlers are bound to the instance of the class so that they can be removed later!
   * @param session
   * @param elements
   */
  constructor(session: Session, elements: HTMLElement[] | NodeListOf<HTMLElement>) {
    super(session, elements, "mousewheel");
    this.wheelEndMonitor = new MonitorCustom(session, "mouse_wheel_end");
    this.evaluate = this.evaluate.bind(this);
    this.handleEnd = this.handleEnd.bind(this);
  }

  evaluate(event: WheelEvent): void {
    const time = this.getTime();
    if (!this.isZooming) {
      this.logWheel(event, time)
      this.isZooming = true;
    }
    this.clearTimer();
    this.zoomingTimerId = setTimeout(() => this.handleEnd(event, time), MonitorElementMouseWheel.ZOOMING_TIMEOUT);
  }

  handleEnd(event: WheelEvent, time: { time: string; absoluteTime: string }): void {
    this.isZooming = false;
    this.wheelEndMonitor.trigger(event.deltaY.toString(), time);
    this.clearTimer();
  }

  logWheel(event: WheelEvent, time: { time: string; absoluteTime: string }): void {
    void this.log({
      session: this.session,
      type: this.type,
      val: event.deltaY.toString(),
      ...time,
      ...this.getSessionInfo()
    });
  }

  on(event: "log", callback: (data: EventDataType) => any) {
    super.on(event, callback);
    this.wheelEndMonitor.on(event, callback);
  }

  off(event: "log", callback: (data: EventDataType) => any) {
    super.off(event, callback);
    this.wheelEndMonitor.off(event, callback);
  }

  start() {
    super.start();
    this.wheelEndMonitor.start();
  }

  clear(): void {
    super.clear();
    if (this.zoomingTimerId) clearTimeout(this.zoomingTimerId);
    this.wheelEndMonitor.clear();
    this.zoomingTimerId = null;
  }

  private clearTimer(): void {
    if (this.zoomingTimerId) clearTimeout(this.zoomingTimerId);
    this.zoomingTimerId = null;
  }

}
