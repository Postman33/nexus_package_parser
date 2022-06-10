let nexus = require('../dependies.json');
let package_json_lock = require('../p-l.json');

let ReadFile = require("../utils/file_system/readFile")
let WriteFile = require("../utils/file_system/writeFile")
let packagesExists = ReadFile("result/level1/Существующие пакеты")
let packagesNonExists = ReadFile("result/level1/Несуществующие пакеты")

function isNumber(val) {
    // negative or positive
    return /^[-]?\d+$/.test(val);
}

function extracted(set) {
    for (let i in set) {
        let v = set[i]

        let nx = nexus.dependencies[i]

        for (let p of v) {
            if (p.search("~") !== -1) {
                set[i] = [package_json_lock.dependencies[i].version] // Подгягиваем версию, которую установили
            }
            if (isNumber(p) && p[0] !== "^" && p[0]) {
                set[i] = [package_json_lock.dependencies[i].version]
            }
        }
    }
}

extracted(packagesExists);
extracted(packagesNonExists);


WriteFile('result/level2(системные файлы)/translatedExists', packagesExists)
WriteFile('result/level2(системные файлы)/translatedNotExists', packagesNonExists)
