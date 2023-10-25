import { Monitor } from "../Monitor";
import { Session } from "../../Session/Session";

export abstract class MonitorElement extends Monitor {
  elements: HTMLElement[] | NodeListOf<HTMLElement>;
  eventType: string;
  protected constructor(session: Session, elements: HTMLElement[] | NodeListOf<HTMLElement>, eventType: string) {
    super(session);
    this.elements = elements;
    this.eventType = eventType;
  }
  start(): void {
    super.start();
    for (const element of this.elements) {
      element.addEventListener(this.eventType, this.evaluate);
    }
  }
  clear(): void {
    for (const element of this.elements) {
      element.removeEventListener(this.eventType, this.evaluate);
    }
  }

  /**
   * Event handler for the event type specified in the constructor.
   * This method should be bound to the instance of the class so that it can be removed later!
   * @param event
   */
  abstract evaluate(event: Event): void;

}
