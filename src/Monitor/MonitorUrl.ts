import { Monitor } from "./Monitor";
import { Session } from "../Session/Session";

export class MonitorUrl extends Monitor {
  static TIMER_INTERVAL = 10;
  timerId: number;
  window: Window;
  lastUrl: string;
  readonly type = "url_change";

  /**
   *
   * @param session
   * @param window
   * @throws {Error} if window is not a browser window (cannot access location.href)
   */
  constructor(session: Session, window: Window) {
    super(session);
    this.window = window;
    this.lastUrl = this.window.location.href; // throws if window is not a browser window
  }

  start() {
    super.start();
    this.updateUrl();
    this.timerId = this.window.setInterval(this.evaluateUrl, MonitorUrl.TIMER_INTERVAL);
    this.logUrl(this.lastUrl, this.getTime())
  }

  evaluateUrl = () => {
    if (this.lastUrl !== this.window.location.href) {
      this.logUrl(this.window.location.href, this.getTime());
      this.updateUrl();
    }
  }

  logUrl = (url: string, time: {time: string, absoluteTime: string}) => {
    void this.log({
      session: this.session,
      type: this.type,
      val: url,
      ...time,
      ...this.getSessionInfo()
    });
  }

  clear(): void {
    this.window.clearInterval(this.timerId);
  }

  private updateUrl() {
    this.lastUrl = this.window.location.href;
  }

}
