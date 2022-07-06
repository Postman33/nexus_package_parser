
const fs = require("fs");
const path = require("path")
function WriteFile(filename, jsonBody) {
    console.log(__dirname)
    let filePath = path.join(__dirname, `../../${filename}.json`);
    if (typeof(jsonBody) != "string") jsonBody = JSON.stringify(jsonBody, null,'\t')
    fs.writeFileSync(filePath, jsonBody, {});
}
module.exports = WriteFile
