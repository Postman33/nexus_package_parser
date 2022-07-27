let nexus = require('../../dependies.json');
let c = require("ansi-colors")
let ReadFile = require("../utils/file_system/readFile")
let WriteFile = require("../utils/file_system/writeFile")
let packagesExists = ReadFile("result/level2(системные файлы)/translatedExists")
// Транслятор добавляемых пакетов, чтобы учесть старые пакеты (добавить то, что было в нексусе к тем пакетам, которые добавляем)
// Также удаляются пустые пакеты и дубликаты
for (let i in packagesExists) {
    let v = packagesExists[i]
    let nx = nexus.dependencies[i]
    if (nx === undefined) continue
    packagesExists[i] = [...new Set([...nx, ...v])]
    if (nx.length === packagesExists[i].length){
        delete packagesExists[i]
        console.log(c.white(`Удален дубликат ${i}@${v}`))
    }
    if (v.length === 0) {
        delete packagesExists[i]
        console.log(c.yellow(`Удален пустой пакет ${i}`))
    }
}
console.log("\n")

WriteFile('result/level3/addToNexus', packagesExists)
console.log(c.green("Файл записался в result/level3/addToNexus!"))
