/// <reference path="../node_modules/chrome-types/index.d.ts" />

import { IndexedDBWrap, ObjectStoreConfigs } from "./Database/IndexedDBWrap";

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

document.getElementById('exportButton').addEventListener('click', function() {
    //chrome.runtime.sendMessage({ action: 'exportCSV' });
    void fetchAndConvert();
});

document.getElementById('clearButton').addEventListener('click', function() {
    // prompt user to confirm / add a confirmation dialog
    window.confirm("Are you sure you want to clear the database? You will lose all data collected so far.");
    void db.drop("eventLog");
    //chrome.runtime.sendMessage({ action: 'clearDB' });
});

function convertToCSV(array: { [key: string]: any }[], delimiter:string = "," ): string {
    const keys = ["absoluteTime","session", "task", "time", "type", "val", "screenX", "screenY", "clientX", "clientY"]

    if (array.length === 0) {
        return "";
    }

    return [
        keys.join(delimiter),
        ...array.map(item => keys.map(key => `"${String(item[key] || '').replace(/"/g, "'")}"`).join(delimiter))
    ].join('\n');
}

// Fetch all eventLog data and convert to CSV
async function fetchAndConvert() {
    try {

        const allData = await db.getAll("eventLog");
        const csvData = convertToCSV(allData);

        // Create blob and download (replace this with your download logic)
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'eventLog.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    } catch (err) {
        console.error('Failed to fetch data:', err);
    }
}
