//view <packageName> --dependencies
const {exec} = require('child_process');
let semver = require("semver")
let pack = require("../package.json")
let name = "mongoose"
let validationList = []
const util  = require("util");
const ansiColors = require("ansi-colors");
const execPromise = util.promisify(exec);
// TODO:
// оптимизациц
// проверка дат
// авто-корректировка, если даты не совпали
function execShellCommand(cmd,cb) {
    return new Promise((resolve, reject) => {
        exec(cmd, async (error, stdout, stderr) => {
            console.log(stdout)

            if (error) {
                console.warn(error);
            }
            await cb(stdout)
            // TODO: Change args
            resolve(stdout ? stdout : stderr);
        });
    });
}

async function analyzeDependencies(lib) {

    return execShellCommand(
        `npm view ${lib} dependencies --json`,
        async (stdout) => {
            if (stdout === '') return;
            let json = JSON.parse(stdout);

            for (let libName in json) {
                let reqVersion = json[libName] // Требование к пакетным версиям
                validationList[libName] = validationList[libName] || []
                validationList[libName].push(reqVersion)
                validationList[libName].push("^6.1.2")
                validationList[libName].push(">6.0.0 < 6.1.0")
                console.log(libName)
                console.log(semver.minVersion(reqVersion).version)

                await analyzeDependencies(libName + "@" + reqVersion)

            }
            console.log("test")
        });

}


let s = async ()=> {
    const dependencies = pack.dependencies;
    const devDependencies = pack.dependencies; // TODO
    for (let lib in dependencies) {
        console.log(`Parsing of ${lib}${dependencies[lib]}`)
        await analyzeDependencies(lib + "@" + dependencies[lib])
    }

    console.log(validationList)

    for (let packet in validationList){
        let versions = validationList[packet]
        // Попарное сравнение версий, .intersectOptimize
        for (let p1 in versions){
            let v1 = versions[p1]
            for (let p2 in versions){
                let v2 = versions[p2]
                if (v1 === v2 && p1 === p2) continue;

                if (semver.subset(v1,v2)){
                    console.log(ansiColors.red("vv"))
                    var filteredArray = validationList[packet].filter(e => e !== v2)

                    validationList[packet] = filteredArray
                }
            }
        }
        console.log(ansiColors.blue(`Packet ${packet}`))
    }
    console.log(ansiColors.blue("List after optimization"))
    console.log(validationList)
}
 s();

