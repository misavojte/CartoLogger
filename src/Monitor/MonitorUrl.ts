import { Monitor } from "./Monitor";
import { Session } from "../Session/Session";

export class MonitorUrl extends Monitor {
  TIMER_INTERVAL = 10;
  timerId: number;
  window: Window;
  lastUrl: string;
  lastType: "url_change" = "url_change";

  /**
   *
   * @param session
   * @param window
   * @throws {Error} if window is not a browser window (cannot access location.href)
   */
  constructor(session: Session, window: Window) {
    super(session);
    void window.location.href; // throws if window is not a browser window
    this.window = window;
  }

  start(): void {
    this.lastUrl = this.window.location.href;
    this.timerId = this.window.setInterval(this.evaluateUrl, this.TIMER_INTERVAL);
    this.logUrl(this.lastUrl, this.getStartTime())
  }

  evaluateUrl = () => {
    if (this.lastUrl !== this.window.location.href) {
      this.logUrl(this.window.location.href, this.getTime());
      this.lastUrl = this.window.location.href;
    }
  }

  logUrl = (url: string, time: {time: string, absoluteTime: string}) => {
    void this.log({
      session: this.session,
      type: this.lastType,
      val: url,
      ...time,
      ...this.getSessionInfo()
    });
  }

  clear(): void {
    this.window.clearInterval(this.timerId);
  }

}
