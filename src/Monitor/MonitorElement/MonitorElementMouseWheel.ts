import { MonitorElement } from "./MonitorElement";
import { Session } from "../../Session/Session";

export class MonitorElementMouseWheel extends MonitorElement {
  lastType: "mouse_wheel_start" | "mouse_wheel_end" = "mouse_wheel_start";
  isZooming: boolean = false;
  zoomingTimerId: number | null = null;

  static ZOOMING_TIMEOUT = 200;

  /**
   * Event handlers are bound to the instance of the class so that they can be removed later!
   * @param session
   * @param elements
   */
  constructor(session: Session, elements: HTMLElement[] | HTMLCollectionOf<HTMLElement> | NodeListOf<HTMLElement>) {
    super(session, elements, "mousewheel");
    this.evaluate = this.evaluate.bind(this);
    this.handleEnd = this.handleEnd.bind(this);
  }

  evaluate(event: WheelEvent): void {
    const time = this.getTime();
    if (!this.isZooming) {
      this.lastType = "mouse_wheel_start";
      this.logWheel(event, time)
      this.isZooming = true;
    }
    // clear any existing timer
    if (this.zoomingTimerId) clearTimeout(this.zoomingTimerId);
    this.zoomingTimerId = setTimeout(() => this.handleEnd(event, time), MonitorElementMouseWheel.ZOOMING_TIMEOUT);
  }

  handleEnd(event: WheelEvent, time: { time: string; absoluteTime: string }): void {
    this.isZooming = false;
    this.lastType = "mouse_wheel_end";
    void this.logWheel(event, time)
    // clear any existing timer
    if (this.zoomingTimerId) clearTimeout(this.zoomingTimerId);
    this.zoomingTimerId = null;
  }

  logWheel(event: WheelEvent, time: { time: string; absoluteTime: string }): void {
    void this.log({
      session: this.session,
      type: this.lastType,
      val: event.deltaY.toString(),
      ...time,
      ...this.getSessionInfo()
    });
  }

  clear(): void {
    super.clear();
    if (this.zoomingTimerId) clearTimeout(this.zoomingTimerId);
    this.zoomingTimerId = null;
  }

}
