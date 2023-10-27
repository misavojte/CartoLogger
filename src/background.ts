/*
TODO: Getting data from DB to CSV dont work if n > 500 (n = number of rows in DB)
 */

import {EventDataType} from "./commons/types";
import { Session } from "./Session/Session";

let backgroundSession: Session | null = null;

// create indexedDB
const dbRequest = indexedDB.open("CartoLogger_eventLog", 1);

dbRequest.onupgradeneeded = function () {
    const db = dbRequest.result;

    // Create the object store if it doesn't exist
    if (!db.objectStoreNames.contains("eventLog")) {
        db.createObjectStore("eventLog", { autoIncrement: true });
    }
}

const promiseResolvedOnDbOpen: Promise<IDBDatabase> = new Promise((resolve, reject) => {
    dbRequest.onsuccess = function () {
        resolve(dbRequest.result);
    }
    dbRequest.onerror = function () {
        reject();
    }
});

const writeEventLogToDb = async (eventData: EventDataType): Promise<void> => {
    const db = await promiseResolvedOnDbOpen;
    const transaction = db.transaction(["eventLog"], "readwrite");
    const objectStore = transaction.objectStore("eventLog");
    const addRequest = objectStore.add(eventData); // Use a different name for the request

    return new Promise((resolve, reject) => {
        addRequest.onsuccess = function () {
            resolve();
        }
        addRequest.onerror = function () {
            reject();
        }
    })
};


// Handle data export and other data management tasks here
const downloadCSV = (csv: string, filename: string) => {
    const textEncoder = new TextEncoder();
    const csvBytes = textEncoder.encode(csv);
    const base64 = btoa(String.fromCharCode.apply(null, csvBytes));

    // Create a data URI with the base64-encoded data and specify UTF-8 encoding
    const dataUri = 'data:text/csv;charset=utf-8;base64,' + base64;
    void chrome.downloads.download({
        url: dataUri,
        filename: filename,
        saveAs: true,
    });
};


function convertToCSV(array, delimiter = ',') {
    const keys = ["absoluteTime","session", "task", "time", "type", "val", "screenX", "screenY", "clientX", "clientY"]

    if (array.length === 0) {
        return null;
    }

    return [
        keys.join(delimiter),
        ...array.map(item => keys.map(key => `"${String(item[key] || '').replace(/"/g, "'")}"`).join(delimiter))
    ].join('\n');

}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'exportCSV') {
        // get data from indexedDB
        const db = dbRequest.result; // Use the outer request variable
        console.log(db);
        const transaction = db.transaction(["eventLog"], "readwrite");
        console.log(transaction);
        const objectStore = transaction.objectStore("eventLog");
        const addRequest = objectStore.getAll(); // Use a different name for the request

        addRequest.onsuccess = function () {
            const data = [];
            addRequest.result.forEach(element => {
                data.push(element);
            });
            const csv = convertToCSV(data);
            if (csv) {
                downloadCSV(csv, 'data.csv');
            }
        }
    }
    if (request.action === 'CARTOLOGGER_LOG') {
        void writeEventLogToDb(request.data);
    }

    if (request.action === 'clearDB') {
        const db = dbRequest.result; // Use the outer request variable
        const transaction = db.transaction(["eventLog"], "readwrite");
        const objectStore = transaction.objectStore("eventLog");
        const addRequest = objectStore.clear(); // Use a different name for the request

        addRequest.onsuccess = function () {
            console.log("Event log cleared");
            sendResponse();
        }
        return true;
    }

    if (request.action === 'CARTOLOGGER_SESSION') {
        const rr = request.session;
        backgroundSession = Session.tryParse(rr);
        console.log(backgroundSession, rr);
    }

    if (request.action === 'getSessionId') {
        // @ts-ignore
        sendResponse(backgroundSession);
    }
});
