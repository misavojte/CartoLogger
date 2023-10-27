import { Session } from "./Session/Session";
import {IndexedDBWrap, ObjectStoreConfigs} from "./Database/IndexedDBWrap";

let backgroundSession: Session | null = null;

// Define your object store configurations
const objectStores: ObjectStoreConfigs = [
    {
        name: "eventLog",
        options: { keyPath: 'id', autoIncrement: true },
    }
];

// Initialize your custom IndexedDBWrap class
const db = new IndexedDBWrap("CartoLogger_eventLog", objectStores);
void db.init();

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse): boolean {

    if (request.action === 'CARTOLOGGER_LOG') {
        void db.add("eventLog", request.data);
        return true;
    }

    if (request.action === 'CARTOLOGGER_SESSION') {
        backgroundSession = Session.tryParse(request.session);
        return true;
    }

    if (request.action === 'getSessionId') {
        // @ts-ignore
        sendResponse(backgroundSession);
        return true;
    }

    return false;
});
