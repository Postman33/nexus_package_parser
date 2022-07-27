let isNumber = require("../utils/isNumber")
let readFile = require("../utils/file_system/readFile")
let writeFile = require("../utils/file_system/writeFile")
let packagesExists = readFile("result/level1/Существующие пакеты")
let packagesNonExists = readFile("result/level1/Несуществующие пакеты")
let check_dependies = require('../deprecated/p-l.json');

let compareTilda = require("../utils/version_compare/tildaCompare")
const c = require("ansi-colors");
// Подтягивает версии с тильдой или численные версии, признак - установленная версия
function parseAllPackages(set) {
    for (let packageName in set) {
        let v = set[packageName]
        for (let p of v) { // Парсим версии, чтобы для каждой подтянуть свою установленную версию
            if ((p.search("~") !== -1) || (isNumber(p) && p[0] !== "^" && p[0])) {
                set[packageName] = new Set([...set[packageName]])
                set[packageName].delete(p)
                if (loadInstalledVersion(packageName, p)) {
                    console.log(c.green(`Подтянулся пакет ${packageName}@${loadInstalledVersion(packageName, p)}`))
                    set[packageName] = [...new Set([...set[packageName], loadInstalledVersion(packageName, p)])] // Подтягиваем версию, которую установили
                }
                else {
                    set[packageName] = [...new Set([...set[packageName]])]
                }

            }
        }
    }
}

parseAllPackages(packagesExists);
parseAllPackages(packagesNonExists);


function loadInstalledVersion(pName, pVersion) {
    for (let i in check_dependies.dependencies) {
        let dep = check_dependies.dependencies[i]
        if (i.search(pName) === -1) continue
        let dep_version = dep.version.replace(/~/ig, '').split(".")
        let p_version = pVersion.replace(/~/ig, '').split(".")
        if (compareTilda(dep_version, p_version))
            return dep.version
    }
}

writeFile('result/level2(системные файлы)/translatedExists', packagesExists)
writeFile('result/level2(системные файлы)/translatedNotExists', packagesNonExists)
