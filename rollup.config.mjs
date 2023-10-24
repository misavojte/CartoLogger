import fs from 'fs';
import path from 'path';
import typescript from "@rollup/plugin-typescript";

const getEntryPoints = (dir) => {
    const entries = fs.readdirSync(dir);
    return entries
        .filter((file) => path.extname(file) === '.ts')
        .map((file) => ({
            input: path.join(dir, file),
            output: {
                file: path.join('dist', path.basename(file, '.ts') + '.js'),
                format: 'cjs',
            },
            plugins: [typescript()],
        }));
};

const entryPointsDir = 'src';

export default getEntryPoints(entryPointsDir);
