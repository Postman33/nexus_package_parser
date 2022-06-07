import path from "path";
import fs from "fs";

function ReadFile(filename) {
    let res
    let filePath = path.join(__dirname, `./${filename}.json`);
    let data = fs.readFileSync(filePath, 'utf8');
    res = JSON.parse(data);
    return res;
}
module.exports = ReadFile
