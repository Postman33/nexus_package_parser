
const fs = require("fs");
const path = require("path")

function ReadFile(filename) {
    let res

    let filePath = path.join(__dirname, `../../${filename}.json`);
    let data = fs.readFileSync(filePath, 'utf8');
    res = JSON.parse(data);
    return res;
}
module.exports = ReadFile
