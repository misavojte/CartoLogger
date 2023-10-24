export class RecordingManager {
  private onStartHandlers: (() => void)[] = [];
  private onStopHandlers: (() => void)[] = [];
  private isRecording = false;
  readonly startKeys: string[] = [];
  readonly stopKeys: string[] = [];

  constructor(startKeys: string[], stopKeys: string[]) {
    this.startKeys = startKeys;
    this.stopKeys = stopKeys;
  }

  init(): void {
    this.evaluate = this.evaluate.bind(this);
    document.addEventListener("keydown", this.evaluate);
  }

  clear(): void {
    document.removeEventListener("keydown", this.evaluate);
  }

  evaluate(event: KeyboardEvent): void {
    if (this.startKeys.includes(event.key)) {
        if (this.start()) return;
    }
    if (this.stopKeys.includes(event.key)) {
        this.stop();
    }
  }

  on(event: "start" | "stop", handler: () => void): void {
    if (event === "start") {
      this.onStartHandlers.push(handler);
    } else if (event === "stop") {
      this.onStopHandlers.push(handler);
    }
  }

  start(): boolean {
    if (this.isRecording) return false;
    this.isRecording = true;
    for (const handler of this.onStartHandlers) {
      handler();
    }
    return true;
  }

  stop(): boolean {
    if (!this.isRecording) return false;
    this.isRecording = false;
    for (const handler of this.onStopHandlers) {
      handler();
    }
    return true;
  }

  isRecordingNow(): boolean {
    return this.isRecording;
  }


}
