import { MonitorElement } from "./MonitorElement";
import { Session } from "../../Session/Session";

/**
 * For monitoring radio button changes
 * @file MonitorElementAtlasCzProjection.ts
 */
export class MonitorElementAtlasCzProjection extends MonitorElement {
  readonly type = 'projection';
  constructor (session: Session, elements: HTMLInputElement[] | NodeListOf<HTMLInputElement>) {
    super(session, elements, 'change');
    this.evaluate = this.evaluate.bind(this);
    this.logProjection('robinson', this.getStartTime());
  }
  evaluate (event: Event) {
    const time = this.getTime();
    const target = event.target as HTMLInputElement;
    // go to the closest parent <label> element
    const label = target.closest('label');
    // get the text content of the label
    const text = label?.dataset?.dot;
    // if no text, error
    if (!text) {
      console.error('No text content for label', label);
      return;
    }
    this.logProjection(text, time)
  }

  logProjection (projection: string, time: { time: string, absoluteTime: string }) {
    void this.log({
      ...this.getSessionInfo(),
      ...time,
      val: projection,
      type: this.type,
    });
  }

}
