/// <reference path="../node_modules/chrome-types/index.d.ts" />
/*
TODO: Reload page after chrome tab is visible again (covered by Tobii task screen)
 */

import { RecordingManager } from "./RecordingManager/RecordingManager";
import { StartScreenElement } from "./StartScreen/StartScreenElement";
import { EventDataType } from "./commons/types";
import { MonitorUrl } from "./Monitor/MonitorUrl";
import { MonitorElementMouseWheel } from "./Monitor/MonitorElement/MonitorElementMouseWheel";
import { MonitorElementAtlasCzProjection } from "./Monitor/MonitorElement/MonitorElementAtlasCzProjection";
import { MonitorElementPointerUp } from "./Monitor/MonitorElement/MonitorElementPointer/MonitorElementPointerUp";
import { MonitorElementPointerDown } from "./Monitor/MonitorElement/MonitorElementPointer/MonitorElementPointerDown";
import { Session } from "./Session/Session";
import { MonitorCollection } from "./Monitor/MonitorCollection";

const url = window.location.href;

let monitors: MonitorCollection | null = null;
const getSessionIdFromBack = async () => chrome.runtime.sendMessage({ action: 'getSessionId' });
const stopRecording = () => {
    window.location.href = url;
}

const sendData = (data: EventDataType) => {
    void chrome.runtime.sendMessage({ action: 'CARTOLOGGER_LOG', data });
}
const startScreen = async () => {
    const canvas = document.querySelectorAll("#map canvas")[1];
    if (!(canvas instanceof HTMLCanvasElement)) throw new Error("Canvas not found");
    const body = document.querySelector("body") as HTMLBodyElement;
    const projectionButtons = document.querySelectorAll("input[type=radio][name=projection]") as NodeListOf<HTMLInputElement>;
    const startScreenElement = new StartScreenElement();
    const recordingManager = new RecordingManager(["q"], ["q", "F10"]);
    const sessionResponse = await getSessionIdFromBack();
    console.log(sessionResponse);
    const session: Session | null = Session.tryParse(sessionResponse);
    if (session) startScreenElement.setSessionId(session.id);
    monitors = null;

    recordingManager.on("start", () => {

        const sessionToUse = Session.createUpdate(session, startScreenElement.getSessionId());
        void chrome.runtime.sendMessage({ action: 'CARTOLOGGER_SESSION', session: sessionToUse });
        startScreenElement.clear();

        monitors = new MonitorCollection([
            new MonitorUrl(sessionToUse, window),
            new MonitorElementMouseWheel(sessionToUse, [canvas]),
            new MonitorElementAtlasCzProjection(sessionToUse, projectionButtons),
            new MonitorElementPointerUp(sessionToUse, [body]),
            new MonitorElementPointerDown(sessionToUse, [body]),
        ]);

        monitors.on("log", (data) => {
            sendData(data);
        });

        monitors.start();

    });

    recordingManager.on("stop", () => {
        monitors.clear();
        monitors = null;
        void stopRecording();
    });

    recordingManager.init();
}

// add on chrome when closing tab or window via chrome.runtime.onSuspend
/*chrome.runtime.onSuspend.addListener(() => {
    if (monitors) {
        monitors.clear();
        void stopRecording(monitors.session);
        monitors = null;
    }
});*/

// create a set Interval to check whether #map canvas is present - if yes, start the start screen and clear the interval
const interval = setInterval(() => {
    const canvas = document.querySelectorAll("#map canvas")[1];
    if (canvas instanceof HTMLCanvasElement) {
        clearInterval(interval);
        void startScreen();
    }
}, 10);