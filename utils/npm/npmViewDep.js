const {exec} = require('child_process');

function NPM_VIEW_DEP(reject, resolve) {
    exec(
        `npm view ${name} time --json`,
        (error, stdout, stderr) => {
            if (error) {
                reject(error)
                return;
            }
            let json = JSON.parse(stdout);
            let check = checkDate(arrayOfVersions, json, name);

            resolve({name: name, version: arrayOfVersions, date: check})
        }
    );
}
module.exports = NPM_VIEW_DEP
