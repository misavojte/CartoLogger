import { MonitorElementPointer } from "./MonitorElementPointer";
import { Session } from "../../../Session/Session";


export class MonitorElementPointerDown extends MonitorElementPointer {
  readonly type = "pointerdown";
  constructor(session: Session, elements: HTMLElement[] | NodeListOf<HTMLElement>) {
    super(session, elements, "pointerdown");
    this.evaluate = this.evaluate.bind(this);
  }
}
