let nexus = require('../../dependies.json');
let check_dependies = require('../p-l.json');
let versionCorrection = {} // Корректировки версий с теми, что есть в нексусе
let c = require("ansi-colors")
let isNumber = require("../../utils/isNumber")
let writeFile = require("../../utils/file_system/writeFile")
let nonExsisting = new Map()
let existing = new Map()
let allDependencies = check_dependies.dependencies;
// Основной файл, парсит весь package-lock.json, ищет первичные пакеты, которых нет в нексусе
// С версиями "~" и числовыми не работает, за это отвечает файл PreProcess.js


// Юнит-тесты, больше не нужны
// function ModuleTests() {
//     let FgRed = "\x1b[31m"
//     let FgGreen = "\x1b[32m"
//
//
//     let cfg = {
//         successful: 0,
//         failded: 0,
//     }
//
//     let wrapperC2W = wrapperBase.bind(compareTwoVersionsUp)
//     let wrapperC2N = wrapperBase.bind(compareTwoVersionsNumbers)
//     let wrapperC2T = wrapperBase.bind(compareTwoVersionsTilda)
//
//     console.log("\n")
//     console.log("-----------------------")
//     console.log("-----------------------")
//     console.log("--------Up ^----------")
//     console.log("-----------------------")
//     console.log("-----------------------")
//     console.log("\n")
//
//     wrapperC2W([1, 3, 5], [1, 4, 0]).isTrue()
//     wrapperC2W([1, 0, 5], [1, 0, 5]).isTrue()
//     wrapperC2W([0, 1, 5], [2, 4, 0]).isFalse()
//     wrapperC2W([1, 3, 5], [1, 4, 0]).isTrue()
//     wrapperC2W([0, 3, 5], [0, 2, 0]).isFalse()
//     wrapperC2W([1, 0, 0], [0, 9, 6]).isFalse()
//
//     console.log("\n")
//     console.log("-----------------------")
//     console.log("-----------------------")
//     console.log("--------Tilda----------")
//     console.log("-----------------------")
//     console.log("-----------------------")
//     console.log("\n")
//
//     wrapperC2N([1, 3, 5], [1, 4, 0]).isFalse()
//     wrapperC2N([1, 0, 5], [1, 0, 5]).isTrue()
//     wrapperC2N([0, 1, 5], [2, 4, 0]).isFalse()
//     wrapperC2N([1, 3, 5], [1, 4, 0]).isFalse()
//     wrapperC2N([0, 3, 5], [0, 2, 0]).isFalse()
//     wrapperC2N([1, 0, 0], [0, 9, 6]).isFalse()
//
//     console.log("\n")
//     console.log("-----------------------")
//     console.log("-----------------------")
//     console.log("--------Equals----------")
//     console.log("-----------------------")
//     console.log("-----------------------")
//     console.log("\n")
//
//
//     wrapperC2T([1, 3, 5], [1, 3, 2]).isFalse()
//     wrapperC2T([1, 0, 5], [1, 0, 5]).isTrue()
//     wrapperC2T([0, 1, 5], [2, 4, 0]).isFalse()
//     wrapperC2T([1, 3, 5], [1, 4, 0]).isFalse()
//     wrapperC2T([0, 2, 5], [0, 2, 0]).isFalse()
//     wrapperC2T([1, 0, 0], [0, 9, 6]).isFalse()
//     wrapperC2T([1, 0, 0], [0, 9, 6]).isFalse()
//     wrapperC2T([1, 1, 0], [1, 1, 0]).isTrue()
//     wrapperC2T([1, 1, 1], [1, 1, 0]).isFalse()
//
//     console.log("\n")
//     console.log("-----------------------")
//     console.log("-----------------------")
//     console.log("----------END----------")
//     console.log("-----------------------")
//     console.log("-----------------------")
//     console.log("\n")
//
//     console.log(`Всего ${cfg.successful + cfg.failded}`)
//     console.log(FgGreen, `Успешных ${cfg.successful}`)
//     console.log(FgRed, `Неуспешных ${cfg.failded}`)
//
//     function wrapperBase(explodedVersionNumbers, explodedNesusVersion) {
//         return {
//             obj: this(explodedVersionNumbers, explodedNesusVersion),
//             checkTrue() {
//                 return this.obj === true;
//             },
//             isTrue() {
//                 if (this.checkTrue()) {
//                     console.log(FgGreen, `Check true successful ${explodedVersionNumbers} < nexus ${explodedNesusVersion}`);
//                     cfg.successful++;
//                 } else {
//                     console.log(FgRed, `Check true failed need ${explodedVersionNumbers} > nexus ${explodedNesusVersion} ${this.obj}`);
//                     cfg.failded++;
//                 }
//             },
//             isFalse() {
//                 if (!this.checkTrue()) {
//                     console.log(FgGreen, `Check false successful ${explodedVersionNumbers} > nexus ${explodedNesusVersion}`);
//                     cfg.successful++;
//                 } else {
//                     console.log(FgRed, `Check false failed need ${explodedVersionNumbers} < nexus ${explodedNesusVersion} ${this.obj}`);
//                     cfg.failded++;
//                 }
//             },
//
//
//         }
//     }
//
// }

// let moduleTests = ModuleTests();

// ^ версия
let compareTwoVersionsUp = require("../../utils/version_compare/upCompare")

// Для сравнения базовых версий без символов
let compareTwoVersionsNumbers = require("../../utils/version_compare/numnersCompare")

// Для сравнения базовых версий с тильдой
let compareTwoVersionsTilda = require("../../utils/version_compare/tildaCompare")


// depElementKey - название пакета
let p = 0
// Есть ли подходящие версии в нексус для требуемой анализируемой версии
// На вход подается требуемая анализируемая версия, например lil@1.4.65
// Если есть подходящие версии в нексусе под нужную версию, то высвятятся эти версии из нексуса
function searchVersion(packetName, version) {
    let result = []
    let explodedVersion = version.split("."); // Разбиваем через точки номера версий
    //TODO: add ~ to replace
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
            compareResult = compareTwoVersionsTilda(explodedVersionNumbers, explodedNesusVersion);
        }
        if (isNumber(majorVersion) && firstCharOfMajorVersion !== "^") {
            compareResult = compareTwoVersionsNumbers(explodedVersionNumbers, explodedNesusVersion);
        }
        if (compareResult) {
            result.push(nexusVersion)
        }

    }


    if (result.length !== 0) { // Блок установки пакетов из нексуса, для того чтобы максимально подтягивать подходящие версии, которые есть на нексусе
        let copy = result;
        // Берем последний пакет из нексуса и его устанавливаем
        copy.sort(function (a, b) {
            let aExploded = a.replace(/\^~/ig, "").split(".");
            let bExploded = b.replace(/\^~/ig, "").split(".");

            let compareResult = 0

            if (aExploded[0] > bExploded[0]) {
                return 1;
            }
            if (aExploded[0] < bExploded[0]) {
                return -1;
            }

            for (let b = 1; b < bExploded.length;) {
                if (+aExploded[b] > +bExploded[b]) {
                    compareResult = 1
                    break;
                }
                if (+aExploded[b] < +bExploded[b]) {
                    compareResult = -1
                    break;
                }
                if (aExploded[b] === bExploded[b]) {
                    b++
                    if (b === aExploded.length) {
                        compareResult = 0
                        break;
                    }
                } else {
                    compareResult = -1
                    break;
                }
            }
            return compareResult;
        })
        versionCorrection[packetName] = result[result.length - 1];
    }
    return result || []
}

function searchDependencies(reqDependency, version) {
    let res = searchVersion(reqDependency, version)
    let nexusPacketVersions = nexus.dependencies[reqDependency] // Что есть в нексусе
    let packageNameFormatter = `${reqDependency}`
    let packageVersionFormatter = `${version.replace("^", "")}`
    if (nexusPacketVersions === undefined) { // Нет версий в нексусе
        // Если нет множества пакетов по ключу pName, добавляем множество по ключу pName
        if (!nonExsisting.get(packageNameFormatter)) nonExsisting.set(packageNameFormatter, new Set())
        if (!nonExsisting.get(packageNameFormatter).has(packageVersionFormatter)) nonExsisting.get(packageNameFormatter).add(packageVersionFormatter)
    } else {
        if (res.length === 0) { // В res будут элементЫ, если есть подходящие версии
            if (!existing.get(packageNameFormatter)) {
                existing.set(packageNameFormatter, new Set())
            }
            if (!existing.get(packageNameFormatter).has(packageVersionFormatter)) existing.get(packageNameFormatter).add(packageVersionFormatter)
        }
    }
}

// Блок обхода package-lock.json
for (let i in allDependencies) {
    if (i === '') continue // Пустые пакеты не интересуют
    let topLevelDependency = allDependencies[i]
   if (topLevelDependency.resolved && topLevelDependency.resolved.search("smart.mos.ru") !== -1) continue // Если установили со Smart.mos.ru, мы не анализируем их зависимости, т.к.
    // в нексусе есть нужные библиотеки

    searchDependencies(i, topLevelDependency.version); // Обход зависимостей на 1-м уровне

    if (!topLevelDependency.requires) continue
    for (let reqDependency in topLevelDependency['requires']) { // Обход зависимостей requires
        let version = topLevelDependency['requires'][reqDependency]
        if (version.search('[x\*]') !== -1) continue // Пропуск бесполезных пакетов
        if (version.search(/>=|<=|<|>|!=|\|\|/) !== -1) continue // Пока нет блока обработки таких версий
        searchDependencies(reqDependency, version);  // Обход зависимостей на 2-м уровне
    }
}

// Сохранение результата в файл
function setToFile(file, parsedSet) {
    let result = {}
    for (let [k, v] of parsedSet) {
        result[k] = []
        for (let version of v) {
            result[k].push(version)
        }
    }
    writeFile(file, JSON.stringify(result))
}

writeFile("result/level3/Коррекция версий", JSON.stringify(versionCorrection))
setToFile("result/level1/Несуществующие пакеты", nonExsisting)
setToFile("result/level1/Существующие пакеты", existing)

