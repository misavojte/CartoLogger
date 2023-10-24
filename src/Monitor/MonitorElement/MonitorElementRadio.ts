import { MonitorElement } from "./MonitorElement";
import { Session } from "../../Session/Session";

/**
 * For monitoring radio button changes
 * @file MonitorElementRadio.ts
 */
export class MonitorElementRadio extends MonitorElement {
  lastType: string = 'radio';
  constructor (session: Session, elements: HTMLInputElement[] | HTMLCollectionOf<HTMLInputElement>) {
    super(session, elements, 'change');
    this.evaluate = this.evaluate.bind(this);
  }

  evaluate (event: Event) {
    const target = event.target as HTMLInputElement;
    const name = target.name;
    // based on checked property
    this.lastType = target.checked ? 'radio_on' : 'radio_off';
    void this.log({
      ...this.getSessionInfo(),
      ...this.getTime(),
      val: name,
      type: this.lastType,
    });

  }

}
