const fs = require("fs");
const path = require("path")

function ExistsFile(filename = 'weather') {
    let filePath = path.join(__dirname, `../../${filename}.json`);
    return fs.existsSync(filePath)
}

module.exports = ExistsFile;
