import { Monitor } from "../Monitor";
import { Session } from "../../Session/Session";

export abstract class MonitorElement extends Monitor {
  elements: HTMLElement[] | HTMLCollectionOf<HTMLElement> | NodeListOf<HTMLElement>;
  eventType: string;
  protected constructor(session: Session, elements: HTMLElement[] | HTMLCollectionOf<HTMLElement> | NodeListOf<HTMLElement>, eventType: string) {
    super(session);
    this.elements = elements;
    this.eventType = eventType;
  }
  start(): void {
    for (const element of this.elements) {
      element.addEventListener(this.eventType, this.evaluate);
    }
  }
  clear(): void {
    for (const element of this.elements) {
      element.removeEventListener(this.eventType, this.evaluate);
    }
  }
  abstract evaluate(event: Event): void;

}
