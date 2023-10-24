import { MonitorElementPointer } from "./MonitorElementPointer";
import { Session } from "../../../Session/Session";


export class MonitorElementPointerDown extends MonitorElementPointer {
  lastType = "pointerdown";
  constructor(session: Session, elements: HTMLElement[] | HTMLCollectionOf<HTMLElement> | NodeListOf<HTMLElement>) {
    super(session, elements, "pointerdown");
    this.evaluate = this.evaluate.bind(this);
  }
  evaluate(event: PointerEvent): void {
    const time = this.getTime();
    const element = event.target as HTMLElement;
    const path = this.getPathFrom(element);
    const pointerCoordinates = this.getPointerCoordinates(event);
    void this.log({
      type: this.eventType,
      val: path,
      ...time,
      ...this.getSessionInfo(),
      ...pointerCoordinates,
    })
  }
}
