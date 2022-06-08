let nexus = require('./dependies.json');
let check_dependies = require('./p-l.json');

function isNumber(val) {
    // negative or positive
    return /^[-]?\d+$/.test(val);
}

let ReadFile = require("./utils/file_system/readFile")

let WriteFile = require("./utils/file_system/writeFile")



let allDependencies = check_dependies.dependencies;

let FgRed = "\x1b[31m"
let FgGreen = "\x1b[32m"


let cfg = {
    successful: 0,
    failded: 0,
}

let wrapperC2W = wrapperBase.bind(compareTwoVersionsUp)
let wrapperC2N = wrapperBase.bind(compareTwoVersionsNumbers)
let wrapperC2T = wrapperBase.bind(compareTwoVersionsTilda)

console.log("\n")
console.log("-----------------------")
console.log("-----------------------")
console.log("--------Up ^----------")
console.log("-----------------------")
console.log("-----------------------")
console.log("\n")

wrapperC2W([1, 3, 5], [1, 4, 0]).isTrue()
wrapperC2W([1, 0, 5], [1, 0, 5]).isTrue()
wrapperC2W([0, 1, 5], [2, 4, 0]).isFalse()
wrapperC2W([1, 3, 5], [1, 4, 0]).isTrue()
wrapperC2W([0, 3, 5], [0, 2, 0]).isFalse()
wrapperC2W([1, 0, 0], [0, 9, 6]).isFalse()

console.log("\n")
console.log("-----------------------")
console.log("-----------------------")
console.log("--------Tilda----------")
console.log("-----------------------")
console.log("-----------------------")
console.log("\n")

wrapperC2N([1, 3, 5], [1, 4, 0]).isFalse()
wrapperC2N([1, 0, 5], [1, 0, 5]).isTrue()
wrapperC2N([0, 1, 5], [2, 4, 0]).isFalse()
wrapperC2N([1, 3, 5], [1, 4, 0]).isFalse()
wrapperC2N([0, 3, 5], [0, 2, 0]).isFalse()
wrapperC2N([1, 0, 0], [0, 9, 6]).isFalse()

console.log("\n")
console.log("-----------------------")
console.log("-----------------------")
console.log("--------Equals----------")
console.log("-----------------------")
console.log("-----------------------")
console.log("\n")


wrapperC2T([1, 3, 5], [1, 3, 2]).isFalse()
wrapperC2T([1, 0, 5], [1, 0, 5]).isTrue()
wrapperC2T([0, 1, 5], [2, 4, 0]).isFalse()
wrapperC2T([1, 3, 5], [1, 4, 0]).isFalse()
wrapperC2T([0, 2, 5], [0, 2, 0]).isFalse()
wrapperC2T([1, 0, 0], [0, 9, 6]).isFalse()
wrapperC2T([1, 0, 0], [0, 9, 6]).isFalse()
wrapperC2T([1, 1, 0], [1, 1, 0]).isTrue()
wrapperC2T([1, 1, 1], [1, 1, 0]).isFalse()

console.log("\n")
console.log("-----------------------")
console.log("-----------------------")
console.log("----------END----------")
console.log("-----------------------")
console.log("-----------------------")
console.log("\n")

console.log(`Всего ${cfg.successful + cfg.failded}`)
console.log(FgGreen,`Успешных ${cfg.successful}`)
console.log(FgRed,`Неуспешных ${cfg.failded}`)
function wrapperBase(explodedVersionNumbers, explodedNesusVersion) {
    return {
        obj: this(explodedVersionNumbers, explodedNesusVersion),
        checkTrue() {
            return this.obj === true;
        },
        isTrue() {
            if (this.checkTrue()) {
                console.log(FgGreen, `Check true successful ${explodedVersionNumbers} < nexus ${explodedNesusVersion}`);
                cfg.successful++;
            } else {
                console.log(FgRed, `Check true failed need ${explodedVersionNumbers} > nexus ${explodedNesusVersion} ${this.obj}`);
                cfg.failded++;
            }
        },
        isFalse() {
            if (!this.checkTrue()) {
                console.log(FgGreen, `Check false successful ${explodedVersionNumbers} > nexus ${explodedNesusVersion}`);
                cfg.successful++;
            } else {
                console.log(FgRed, `Check false failed need ${explodedVersionNumbers} < nexus ${explodedNesusVersion} ${this.obj}`);
                cfg.failded++;
            }
        },


    }
}

// ^ версия
function compareTwoVersionsUp(explodedVersionNumbers, explodedNesusVersion) {

    let result = false

    if (explodedNesusVersion[0] !== explodedVersionNumbers[0]) {
        return result;
    }

    for (let b = 1; b < explodedVersionNumbers.length;) {
        if (+explodedNesusVersion[b] > +explodedVersionNumbers[b]) {
            result = true
            break;
        }
        if (+explodedNesusVersion[b] < +explodedVersionNumbers[b]) {
            result = false
            break;
        }
        if (explodedNesusVersion[b] === explodedVersionNumbers[b]) {
            b++
            if (b === explodedNesusVersion.length) {
                result = true
                break;
            }
        } else {
            result = false
            break;
        }
    }
    return result;
}

// Для сравнения базовых версий без символов
function compareTwoVersionsNumbers(explodedVersionNumbers, explodedNesusVersion) {

    let result = false

    if (explodedNesusVersion[0] !== explodedVersionNumbers[0]) {
        return result;
    }

    for (let b = 1; b < explodedVersionNumbers.length;) {
        if (+explodedNesusVersion[b] > +explodedVersionNumbers[b]) {
            result = false
            break;
        }
        if (+explodedNesusVersion[b] < +explodedVersionNumbers[b]) {
            result = false
            break;
        }
        if (explodedNesusVersion[b] === explodedVersionNumbers[b]) {
            b++
            if (b === explodedNesusVersion.length) {
                result = true
                break;
            }
        } else {
            result = false

            break;
        }
    }
    return result;
}


// ~ версия
function compareTwoVersionsTilda(explodedVersionNumbers, explodedNesusVersion) {

    let result = false

    if (explodedNesusVersion[0] !== explodedVersionNumbers[0]) {
        return result;
    }

    for (let b = 1; b < explodedVersionNumbers.length;) {
        if (+explodedNesusVersion[b] > +explodedVersionNumbers[b]) {
            result = false
            break;
        }
        if (+explodedNesusVersion[b] < +explodedVersionNumbers[b]) {
            result = false
            break;
        }
        if (explodedNesusVersion[b] === explodedVersionNumbers[b]) {
            b++
            if (b === explodedNesusVersion.length) {
                result = true
                break;
            }
        } else {
            result = false
            break;
        }
    }
    return result;
}

let versionCorrection = {}
// depElementKey - название пакета
let p = 0
let nonExsisting = new Map()
let existing = new Map()
function searchVersion(packetName, version) {
    let result = []
    let explodedVersion = version.split("."); // Разбиваем через точки номера версий
    let explodedVersionNumbers = version.replace("^", "").split("."); // Тоже самое, но не учитываем особый знак ^
    let majorVersion = explodedVersion[0] // Первый символ до точки
    let firstCharOfMajorVersion = majorVersion[0]

    let nexusPacketVersions = nexus.dependencies[packetName] // Что есть в нексусе


    for (let i in nexusPacketVersions) {
        let nexusVersion = nexusPacketVersions[i];
        let explodedNesusVersion = nexusVersion.split("."); // Разбиваем нексус версию i пакета на точки
        let compareResult

        if (firstCharOfMajorVersion === "^") {
            compareResult = compareTwoVersionsUp(explodedVersionNumbers, explodedNesusVersion);
        }
        if (firstCharOfMajorVersion === "~") {
            compareResult =true;// compareTwoVersionsTilda(explodedVersionNumbers, explodedNesusVersion);
        }
        if (isNumber(majorVersion) && majorVersion[0] !== "^") {
            compareResult =true// compareTwoVersionsNumbers(explodedVersionNumbers, explodedNesusVersion);
        }


        if (compareResult) {
            result.push(nexusVersion)
        }

    }


    if (isNumber(majorVersion) && majorVersion[0] !== "^") {

        let compareResult = false
        for (let i in nexusPacketVersions) {

            let nexusVersion = nexusPacketVersions[i];

            if (nexusVersion === version) {

                compareResult = true;
            }

        }
        if (compareResult)
            result.push(version)

    }

if (result.length !== 0){
    let copy = result;
    copy.sort( function (a, b) {
        let aExploded = a.replace(/\^~/ig, "").split(".");
        let bExploded = b.replace(/\^~/ig, "").split(".");

        let result = 0

        if (aExploded[0] > bExploded[0]) {
            return 1;
        }
        if (aExploded[0] < bExploded[0]) {
            return -1;
        }

        for (let b = 1; b < bExploded.length;) {
            if (+aExploded[b] > +bExploded[b]) {
                result = 1
                break;
            }
            if (+aExploded[b] < +bExploded[b]) {
                result = -1
                break;
            }
            if (aExploded[b] === bExploded[b]) {
                b++
                if (b === aExploded.length) {
                    result = 0
                    break;
                }
            } else {
                result = -1
                break;
            }
        }
        return result;

    })
    //console.log(copy)
    versionCorrection[packetName]=result[ result.length -1 ];
}
    return result || []

}

console.log(FgGreen)

for (let i in allDependencies) {
    //console.log(i)
    if (i === '') continue
    let topLevelDependency = allDependencies[i]
    if (!topLevelDependency.requires) continue



    for (let reqDependency in topLevelDependency['requires']) {
        let version = topLevelDependency['requires'][reqDependency]
        if (version.search('[x\*]') !== -1) continue
        if (version.search(/>=|<=|<|>|!=|\|\|/) !== -1) continue

        let res = searchVersion(reqDependency, version)
        let nexusPacketVersions = nexus.dependencies[reqDependency] // Что есть в нексусе
        let pName = `${reqDependency}`  // packageName formatter
        let pVersion = `${version.replace("^","")}` // packageVersion formatter
        if (nexusPacketVersions === undefined){

            if (!nonExsisting.get(pName))
                nonExsisting.set(pName,new Set())
            if(!nonExsisting.get(pName).has(pVersion))
                nonExsisting.get(pName).add(pVersion)
            p++
        } else {
            if (res.length === 0){ // В res будут элементЫ, если есть подходящие версии


                if (!existing.get(pName)){
                    existing.set(pName,new Set())
                }
                if(!existing.get(pName).has(pVersion)) existing.get(pName).add(pVersion)
            p++
            } else {
                // TODO: Коррекция версий
               // if (!res.includes(check_dependies.dependencies[pName].version))
               // versionCorrection[pName] = res

            }



        }

       // if (res.length === 0) console.log(reqDependency, version)
        //  console.log(version)
        // console.log(res)
        // if (reqDependency === 'type-fest') {
        //console.log(res)
        // }
    }

    //console.log(i)
}
WriteFile("corrections",JSON.stringify(versionCorrection))
//console.log("End")


//console.log(nonExsisting)
function printToFile(file,parsedSet) {
    let result = {}
    for (let [k, v] of parsedSet) {

        result[k] = []
        for (let version of v){
            result[k].push(version)
        }

    }
   // console.log(result)
    WriteFile(file,JSON.stringify(result))
}

printToFile("Несуществующие пакеты_",nonExsisting)
printToFile("Существующие пакеты_",existing)


console.log(`Не хватает ${p} пакетов`)
