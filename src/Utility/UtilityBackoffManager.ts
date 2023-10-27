export class UtilityBackoffManager {
    readonly retries: number;
    readonly initialDelay: number;
    readonly maxDelay: number;
    readonly concurrencyLimit: number;
    private ongoingExecutions: number = 0;
    private jobQueue: (() => void)[] = [];

    constructor(retries: number, initialDelay: number, maxDelay: number, concurrencyLimit: number) {
        this.retries = retries;
        this.initialDelay = initialDelay;
        this.maxDelay = maxDelay;
        this.concurrencyLimit = concurrencyLimit;
    }

    async execute<T>(fn: () => Promise<T>): Promise<T> {
        return new Promise(async (resolve, reject) => {
            if (this.ongoingExecutions >= this.concurrencyLimit) {
                this.jobQueue.push(() => this.run(fn, resolve, reject));
                return;
            }
            void this.run(fn, resolve, reject);
        });
    }

    private async run<T>(fn: () => Promise<T>, resolve: (value: T) => void, reject: (reason?: any) => void) {
        this.ongoingExecutions++;

        let delay = this.initialDelay;
        let attempts = 0;

        while (true) {
            let result: T;
            try {
                result = await fn();
            } catch (e) {
                if (attempts >= this.retries) {
                    this.cleanup();
                    reject(e);
                    return;
                }
                await this.sleep(delay);
                attempts++;
                delay = Math.min(delay * 2, this.maxDelay);
                continue;
            }
            this.cleanup();
            resolve(result);
            return;
        }
    }

    private cleanup() {
        this.ongoingExecutions--;
        if (this.jobQueue.length > 0) {
            const nextJob = this.jobQueue.shift();
            nextJob && nextJob();
        }
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}