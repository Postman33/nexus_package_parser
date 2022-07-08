//view <packageName> --dependencies
const {exec} = require('child_process');
let semver = require("semver")
let pack = require("../package_NLZ.json")
let nexus = require("../dependies.json")
let name = "mongoose"
let validationList = []
const util  = require("util");
const ansiColors = require("ansi-colors");
const execPromise = util.promisify(exec);
let fs = require("fs")
let writeFile = require("../utils/file_system/writeFile")
//fs.mkdirSync("../add")
// TODO:
// оптимизациц
// проверка дат
// авто-корректировка, если даты не совпали
let checkedLibs = new Set()
function execShellCommand(cmd,cb) {
    return new Promise((resolve, reject) => {
        exec(cmd, async (error, stdout, stderr) => {

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
    if (lib.indexOf( '[object Object]') !== -1) return;
    if (checkedLibs.has(lib)) return;
    return execShellCommand(
        `npm view ${lib} dependencies --json`,
        async (stdout) => {
            if (stdout === '') return;
            let json = JSON.parse(stdout);
            for (let libName in json) {
                let reqVersion = json[libName] // Требование к пакетным версиям
                validationList[libName] = validationList[libName] || []
                validationList[libName].push(reqVersion)
                if (semver.validRange(reqVersion)){
                    if (nexus.dependencies[libName]){
                        let g = semver.minSatisfying(nexus.dependencies[libName], reqVersion) || semver.minVersion(reqVersion).version
                        console.log(ansiColors.cyan(`min satis is ${g}`))
                        reqVersion = g;
                    } else {
                        reqVersion = semver.minVersion(reqVersion).version
                    }
                    console.log(`lib+${libName}${reqVersion}`)
                }

                await analyzeDependencies(libName + "@" + reqVersion)

            }
            checkedLibs.add(lib)
        });

}
function optimizeVersions(versions){
    let arr = versions;
    for (let p1 in versions){
        let v1 = versions[p1]
        for (let p2 in versions){
            let v2 = versions[p2]
            if (v1 === v2 && p1 === p2) continue;

            if (semver.subset(v1,v2)){
                arr = arr.filter(e => e !== v2)
            }
        }
    }
    return arr;
}

let s = async ()=> {
    const dependencies = pack.dependencies;
    const devDependencies = pack.devDependencies; // TODO
    for (let lib in dependencies) {
        validationList[lib] = validationList[lib] || []
        validationList[lib].push(dependencies[lib])
        await analyzeDependencies(lib + "@" + dependencies[lib])
    }
    for (let lib in devDependencies) {
        console.log(ansiColors.blue(`Анализируетс dev-dep ${lib + "@" + devDependencies[lib]}`))
        validationList[lib] = validationList[lib] || []
        validationList[lib].push(devDependencies[lib])
        await analyzeDependencies(lib + "@" + devDependencies[lib])
    }
    console.log("Compare")
    console.log(validationList)

    for (let packet in validationList){
        validationList[packet] = optimizeVersions(validationList[packet])
    }

    let unExistPackets = {}
    let existPackets = {}

    for (let packet in validationList){
        unExistPackets[packet] = unExistPackets[packet] || []
        existPackets[packet] = existPackets[packet] || []
        let versions = validationList[packet]
        console.log(`packet ${packet}`)
        let nexusPacket = nexus.dependencies[ packet ]
        if (nexusPacket === undefined){ // Если пакета нет в нексусе, добавляем минимальные версии для каждого требования
            for(let i in versions){
                let reqVer = versions[i]
              //  console.log('tt')
                if (semver.validRange(reqVer) != null) {
                    unExistPackets[packet].push( semver.minVersion(reqVer).version)
                } else {
                    unExistPackets[packet].push(reqVer )
                }
            }
        } else { // Есть пакет в нексусе

            for(let i in versions){
                let reqVer = versions[i]
                let test = false;
                for (let ni in nexusPacket){
                    let nexusVer = nexusPacket[ni]

                    if (semver.satisfies( nexusVer, reqVer)){
                        test = true; // Тест пройден, версию не надо добавлять
                    }
                    console.log(`Satisfying ${test}`)

                }
                if (!test){ // если тест не пройден, добавляем

                    if (semver.validRange(reqVer) != null) {
                        existPackets[packet].push( semver.minVersion(reqVer).version)
                    } else {
                        existPackets[packet].push(reqVer)
                    }
                }

                existPackets[packet] = optimizeVersions(existPackets[packet])
                // console.log('tt')
                // unExistPackets[packet] = unExistPackets[packet] || []
                // unExistPackets[packet].push( semver.minVersion(reqVer).version)
            }
        }

    }

    console.log(existPackets)
    console.log(unExistPackets)
    for (let a in existPackets){
        if (existPackets[a].length === 0) delete existPackets[a]
    }
    for (let a in unExistPackets){
        if (unExistPackets[a].length === 0) delete unExistPackets[a]
    }
    writeFile("add/ex",JSON.stringify(existPackets))
    writeFile("add/unex",JSON.stringify(unExistPackets))
    console.log(ansiColors.blue("List after optimization"))
    console.log(validationList)
}
 s();

