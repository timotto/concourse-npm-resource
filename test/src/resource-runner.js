const {spawn} = require('child_process');

const spawnIn = async (command, args, stdinData = undefined) =>
    new Promise(resolve => {
        const result = {stdout: "", stderr: ""};
        const x = spawn(command, args);
        x.stdout.on('data', data => result.stdout += data);
        x.stderr.on('data', data => result.stderr += data);
        x.on('exit', code => resolve(({code, ...result})));
        x.stdin.write(stdinData);
        x.stdin.end();
    });

module.exports = { spawnIn };
