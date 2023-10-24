/// <reference path="../node_modules/chrome-types/index.d.ts" />

document.getElementById('exportButton').addEventListener('click', function() {
    chrome.runtime.sendMessage({ action: 'exportCSV' });
});

document.getElementById('clearButton').addEventListener('click', function() {

    // prompt user to confirm / add a confirmation dialog
    window.confirm("Are you sure you want to clear the database? You will lost all data collected so far.");

    chrome.runtime.sendMessage({ action: 'clearDB' });
});
