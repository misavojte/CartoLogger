import { MonitorElementPointer } from "./MonitorElementPointer";
import { Session } from "../../../Session/Session";

export class MonitorElementPointerUp extends MonitorElementPointer {
  readonly type = "pointerup";
  constructor(session: Session, elements: HTMLElement[] | NodeListOf<HTMLElement>) {
    super(session, elements, "pointerup");
    this.evaluate = this.evaluate.bind(this);
  }
}
