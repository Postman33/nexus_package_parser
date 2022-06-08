
const fs = require("fs");
const path = require("path")
function WriteFile(filename, jsonBody) {
    console.log(__dirname)
    let filePath = path.join(__dirname, `../../${filename}.json`);
    fs.writeFileSync(filePath, jsonBody, {});
}
module.exports = WriteFile
