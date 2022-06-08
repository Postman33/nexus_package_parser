const {exec} = require('child_process');
const cliProgress = require("cli-progress")
const colors = require("ansi-colors")
//let nexus = require('./dependies.json');
const day24Feb = new Date('2022-02-24T06:00:00');
let errorsPackages = new Set();
let ReadFile = require("./utils/file_system/readFile")

function execFn(name, arrayOfVersions) {
    return new Promise((resolve, reject) => {
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
                if (check)
                    resolve({name: name, version: arrayOfVersions, date: true})
                else
                    resolve({name: name, version:arrayOfVersions, date: false})
            }
        );
    });
}

let asyncFn = async function () {
    let readFile = await ReadFile("Несуществующие пакеты_")

    const b1 = new cliProgress.SingleBar({
        format: "CLI " + colors.cyan('{bar}') + "| {percentage}% || {value}/{total} Chunks || Speed: {speed}",
        barCompleteChar: "\u2588",
        barIncompleteChar: '\u2591',
        hideCursor: true
    })

    let i = 0;
    for (let key in readFile) {
        i++
    }
    b1.start(i, 0, {
        speed: "1 package"
    })

    let k = 0;
    for (let key in readFile){
        //console.log(readFile[key])
        //console.log(key)

       await execFn(key, readFile[key]).then((r) => {
          //  console.log(r)
           k++
            b1.update(k)
            //b1.update(20)


            //console.log(r)
        }).catch((r) => {
            console.log(r)
        })
    }
    b1.stop()
    console.log("Ошибки в пакетах")
    console.log(errorsPackages)



}
asyncFn();
