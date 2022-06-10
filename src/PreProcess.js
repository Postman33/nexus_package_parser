let package_json_lock = require('../p-l.json');
let isNumber = require("../utils/isNumber")
let ReadFile = require("../utils/file_system/readFile")
let WriteFile = require("../utils/file_system/writeFile")
let packagesExists = ReadFile("result/level1/Существующие пакеты")
let packagesNonExists = ReadFile("result/level1/Несуществующие пакеты")
let check_dependies = require('../p-l.json');

let compareTilda = require("../utils/version_compare/tildaCompare")
const c = require("ansi-colors");

function parseAllPackages(set) {
    for (let i in set) {
        let v = set[i]
        for (let p of v) {
            if ((p.search("~") !== -1) || (isNumber(p) && p[0] !== "^" && p[0])) {
                set[i] = new Set([...set[i]])// Подгягиваем версию, которую установили
                set[i].delete(p)
                if (loadInstalledVersion(i, p)) {
                    console.log(c.green(`Подтянулся пакет ${i}@${loadInstalledVersion(i, p)}`))
                    set[i] = [...new Set([...set[i], loadInstalledVersion(i, p)])]
                }
                else {
                    set[i] = [...new Set([...set[i]])]
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

WriteFile('result/level2(системные файлы)/translatedExists', packagesExists)
WriteFile('result/level2(системные файлы)/translatedNotExists', packagesNonExists)
