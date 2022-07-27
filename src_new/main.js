//view <packageName> --dependencies
const {exec} = require('child_process');
let semver = require("semver")
let pack = require("../package_NLZ.json")
let nexus = require("../dependies.json")
let validationList = []
//let ValidationListFrame = {}
let ValidationListFrameCache = {}

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
let cacheMDL = require("./modules/cache/cache")
cacheMDL.init("test")
let checkedLibs = new Set()
function execShellCommand(cmd,cb) {
    return new Promise((resolve, reject) => {
        exec(cmd, async (error, stdout, stderr) => {

            if (error) {
                console.warn(error);
            }
            await cb(stdout)
            // TODO: Change args
            resolve(stdout);
        });
    });
}

async function processLibsResponse(json, lib) {
    for (let libName in json) {
        let reqVersion = json[libName] // Требование к пакетным версиям
        validationList[libName] = validationList[libName] || []
        validationList[libName].push(reqVersion)

        if (semver.validRange(reqVersion)) { // Ищем минимальную версию для поиска dependencies, без ~,^, >=, <=
            if (nexus.dependencies[libName]) {
                reqVersion = semver.minSatisfying(nexus.dependencies[libName], reqVersion) || semver.minVersion(reqVersion).version;
            } else {
                reqVersion = semver.minVersion(reqVersion).version
            }
           // console.log(`lib+${libName}${reqVersion}`)
        }

        await analyzeDependencies(libName + "@" + reqVersion)

    }
    checkedLibs.add(lib)
}

async function analyzeDependencies(lib) {
    if (lib.indexOf( '[object Object]') !== -1) {
        console.log('Object')
        console.dir(lib)
        return};
   // if (checkedLibs.has(lib)) return;

   // console.log(lib)

    if (cacheMDL.readKey(lib)){
      //  console.log(`Return await ${lib}`)
        return  await processLibsResponse(cacheMDL.readKey(lib), lib);
    }
    //console.log("Return not await")
    return execShellCommand(
        `npm view ${lib} dependencies --json`,
        async (stdout) => {
            if (stdout === '') {
                cacheMDL.cacheKey(lib, {});
                cacheMDL.endOp()
                return;
            }
            let json = JSON.parse(stdout);
            //ValidationListFrame[lib] = json;

            // cacheMDL.startOp()
             cacheMDL.cacheKey(lib,json);
             cacheMDL.endOp()
            await processLibsResponse(json, lib);


        });

}
function optimizeVersions(versions){
    let arr = versions;
    let k = 0;
    for (let p1 in arr){
        let v1 = arr[p1]
        for (let p2 in arr){
            let v2 = arr[p2]
            if (v1 === v2 && p1 === p2) continue;

            if (v1 !== 'REE' && v2 !== 'REE' && semver.subset(v1,v2)){
                let indexV2 = arr.indexOf(v2)
                k++
                if (indexV2 === 1) continue
                arr[p2] = 'REE'
                //arr = arr.filter((e,index) => indexV2 !== index)
            }
        }
    }
    arr = arr.filter((e,index) => e !== 'REE')

    console.log(`K = ${k}`)
    return arr;
}
// main - вход в основное приложение
let s = async ()=> {
    cacheMDL.startOp();
    const dependencies = pack.dependencies;
    const devDependencies = pack.devDependencies;

    async function parseDependencies(depList) {
        for (let lib in depList) {
            validationList[lib] = validationList[lib] || []
            validationList[lib].push(depList[lib])
            await analyzeDependencies(lib + "@" + depList[lib])
        }
    }

    await parseDependencies(dependencies);
    await parseDependencies(devDependencies);


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
                if (semver.validRange(reqVer) != null) { // Если это Range, берем мин. версию
                    unExistPackets[packet].push( semver.minVersion(reqVer).version)
                } else {
                    unExistPackets[packet].push(reqVer ) // Это не Range, берем версию
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

                }
                if (!test){ // если тест не пройден, добавляем
                    if (semver.validRange(reqVer) != null) {
                        existPackets[packet].push( semver.minVersion(reqVer).version)
                    } else {
                        existPackets[packet].push(reqVer)
                    }
                }
                existPackets[packet] = optimizeVersions(existPackets[packet])
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

