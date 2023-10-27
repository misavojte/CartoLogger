const { exec } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

console.log(`Running Node.js version: ${process.version}`);

const deleteEmptyFolders = (dir) => {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        if (stat.isDirectory()) {
            deleteEmptyFolders(itemPath);
            if (fs.readdirSync(itemPath).length === 0) {
                fs.rmdirSync(itemPath);
            }
        }
    });
};

exec('rollup -c', { env: process.env }, (err, stdout, stderr) => {
    if (err) {
        console.error(`Error during rollup: ${err}`);
        return;
    }
    console.log(`rollup stdout: ${stdout}`);
    console.log(`rollup stderr: ${stderr}`);

    const isWindows = os.platform() === 'win32';
    const copyCommand = isWindows ?
        'xcopy /E /I /Y ".\\src\\" ".\\dist\\" && forfiles /P .\\dist\\ /S /M *.ts /C "cmd /c del @path"' :
        'rsync -av --prune-empty-dirs --exclude=\'*.ts\' ./src/ ./dist/';

    exec(copyCommand, { env: process.env }, (err, stdout, stderr) => {
        if (err) {
            console.error(`Error during copy: ${err}`);
            return;
        }
        console.log(`Copy stdout: ${stdout}`);
        console.log(`Copy stderr: ${stderr}`);

        if (isWindows) {
            deleteEmptyFolders('.\\dist\\');
        }
    });
});
