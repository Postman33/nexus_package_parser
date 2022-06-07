
const fs = require("fs");
const path = require("path")

let nexus = require('./dependies.json');
function WriteFile(filename = '', jsonBody) {
    let filePath = path.join(__dirname, `${filename}.json`);
    if (typeof (jsonBody) != "string") {
        jsonBody = JSON.stringify(jsonBody)
    }
    fs.writeFileSync(filePath, jsonBody, {});
}
function ReadFile(filename) {
    let res
    let filePath = path.join(__dirname, `./${filename}.json`);
    let data = fs.readFileSync(filePath, 'utf8');
    res = JSON.parse(data);
    return res;
}

let packages = ReadFile("Существующие пакеты")
for (let i in packages){
    let v = packages[i]
    let nx = nexus.dependencies[i]
    packages[i] = [...nx,...v]
   // console.log([...nx,...v])
}
WriteFile('translated',packages)
