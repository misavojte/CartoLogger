export type BackgroundStateType = {
    numberOfSessions: number,
    numberOfTasksInSession: number,
    lastSessionId: null | string,
    isRecordingTask: boolean,
}

export type SessionType = {
    id: string,
    taskNumber: number,
}

export type EventDataType = {
    absoluteTime: string,
    time: string,
    session: string,
    task: string,
    type: string,
    val: string,
    screenX?: string,
    screenY?: string,
    clientX?: string,
    clientY?: string,
}

            // extend EventDataType
            export type DbEventDataType = EventDataType & {
                dbWriteTime: string,
                task: string,
            }

