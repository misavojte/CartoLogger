/**
 * Holds the session information. Immutable.
 * @property id - The session id. Can be whichever string, but should not be empty.
 * @property taskNumber - The number of the task for the given id. Starts at 0.
 * @property task - The task number as a string. Used for logging. See {@link Monitor}.
 * @property baseTime - The time when the session was created. Used for logging. See {@link Monitor}.
 */
export class Session {
  readonly id: string;
  readonly task: string;
  readonly taskNumber: number;
  readonly baseTime: number;

  /**
   * Creates a new session with a random id and task number 0.
   * @returns {Session}
   */
  static newRandom(): Session {
    const random = String(Math.floor(1000 + Math.random() * 9000));
    return new Session(random, 0, Date.now());
  }

  /**
   * Tries to parse the given data into a session.
   * @param data - Unknown data to parse.
   * @returns {Session | null} - The parsed session or null if the data could not be parsed.
   */
  static tryParse(data: unknown): Session | null {
    if (typeof data !== "object" || data === null) return null;
    const id = data["id"];
    const taskNumber = data["taskNumber"];
    const baseTime = data["baseTime"];
    if (typeof id !== "string" || typeof taskNumber !== "number" || typeof baseTime !== "number") return null;
    return new Session(id, taskNumber, baseTime);
  }

  /**
   * Creates a new session or updates the given session if the given id matches the session id.
   * @param session
   * @param sessionId
   */
  static createUpdate(session: Session | null, sessionId: string): Session {
    if (sessionId === "") return Session.newRandom();
    if (session?.id !== sessionId) return new Session(sessionId, 0, Date.now());
    return new Session(session.id, session.taskNumber + 1, Date.now());
  }
  constructor(id: string, taskNumber: number, baseTime: number) {
    this.id = id;
    this.taskNumber = taskNumber;
    this.task = String(taskNumber);
    this.baseTime = baseTime;
  }
}
