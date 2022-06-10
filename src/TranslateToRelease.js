let nexus = require('../dependies.json');

let ReadFile = require("../utils/file_system/readFile")
let WriteFile = require("../utils/file_system/writeFile")
let packagesExists = ReadFile("result/level2(системные файлы)/translatedExists")

for (let i in packagesExists) {
    let v = packagesExists[i]
    let nx = nexus.dependencies[i]
    if (nx === undefined) continue
    packagesExists[i] = [...new Set([...nx, ...v])]
    if (nx.length === packagesExists[i].length){
        delete packagesExists[i]
        console.log(`Удален ${i}@${v}`)
    }
}




WriteFile('result/level3/addToNexus', packagesExists)
