const {exec} = require('child_process');
const cliProgress = require("cli-progress")
const colors = require("ansi-colors")
const day24Feb = new Date('2022-02-24T06:00:00');

let WriteFile = require("./utils/file_system/writeFile")
let ReadFile = require("./utils/file_system/readFile")
let ExistsFile = require("./utils/file_system/existsFile")

let errorsPackages = new Set();
if (!ExistsFile("versions_cache")) {
    WriteFile("versions_cache", JSON.stringify({}))
}
let MRU_Cache = ReadFile("versions_cache") // Кеш Most recently used
function execFn(name, arrayOfVersions) {
    function viewDate(reject, resolve) {
        exec(
            `npm view ${name} time --json`,
            (error, stdout, stderr) => {
                if (error) {
                    reject(error)
                    return;
                }
                let json = JSON.parse(stdout);
                let check = true;
                for (let key in arrayOfVersions) {
                    let version = arrayOfVersions[key]
                    let date_ob = new Date(json[version]);
                    if (date_ob > day24Feb) {
                        check = false;
                        errorsPackages.add(name + "@" + version)
                    }
                }

                MRU_Cache[name] = {
                    name: name,
                    version: arrayOfVersions,
                    validTo: Date.now() + 90 * 1000 * 60 * 60* 60,
                    json: json
                }

                resolve({name: name, version: arrayOfVersions, date: check})
            }
        );
    }

    return new Promise((resolve, reject) => {
        if (MRU_Cache[name]) {
            let MRU_label = MRU_Cache[name]
            if (Date.now() < +MRU_label.validTo) {
                let json = MRU_label.json;
                let check = true;
                for (let key in arrayOfVersions) {
                    let version = arrayOfVersions[key]
                    let date_ob = new Date(json[version]);
                    if (date_ob > day24Feb) {
                        check = false;
                        errorsPackages.add(name + "@" + version)
                    }
                }
                resolve(MRU_label)
            } else {
                delete MRU_Cache[name];
                viewDate(reject, resolve)
            }
        } else {
            viewDate(reject, resolve);
        }
    });
}

let asyncFn = async function () {
    let readFile = {...await ReadFile("Несуществующие пакеты_"), ...await ReadFile("Существующие пакеты_")}
    const b1 = new cliProgress.SingleBar({
        format: "CLI " + colors.cyan('{bar}') + "| {percentage}% || {value}/{total} Chunks || Speed: {speed}",
        barCompleteChar: "\u2588",
        barIncompleteChar: '\u2591',
        hideCursor: true
    })

    let i = 0;
    for (let key in readFile) {
        i++ // Считаем количество пакетов, чтобы отобразить сколько их в ProgressBar
    }
    b1.start(i, 0, { // Запуск ProgressBar
        speed: "1 package"
    })

    let k = 0;
    for (let key in readFile) {
        await execFn(key, readFile[key]).then((r) => {
            k++
            b1.update(k)
        }).catch((error) => {
            console.log(error)
        })
    }
    b1.stop()
    WriteFile("versions_cache", JSON.stringify(MRU_Cache))
    console.log("Ошибки в пакетах:")
    console.log(errorsPackages)
}
asyncFn();
