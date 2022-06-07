import path from "path";
import fs from "fs";

function WriteFile(filename, jsonBody) {
    let filePath = path.join(__dirname, `./${filename}.json`);
    fs.writeFileSync(filePath, jsonBody, {});
}
module.exports = WriteFile
