
const fs = require("fs");
const path = require("path")


function prettyPrintJSON(json,bool) {
if (bool) return json;

    function replaceAll(str, find, replace) {
        return str.replace(/find/g, replace);
    }

    if (typeof json === 'string') {
        json = JSON.parse(json);
    }
    let output = JSON.stringify(json, function (k, v) {
        if (v instanceof Array) {
            return '[' +  v.map((str)=> '"' + str + '"').join(', ') + ']';
        }
        else return v;
    }, '\t ').replace(/\\/g, '')
        .replace(/"\[/g, '[')
        .replace(/]"/g, ']')
        .replace(/"\{/g, '{')
        .replace(/}"/g, '}')
        .replace('{\n\t "dependencies"', '{"dependencies"')
        .replace('\t }\n}', '}}');

    output = replaceAll(output, '\t \t ', '\t ')

    return output;
}


// flag = false по умолчанию. Если flag == true, то не сохраняет в красвиом виде
function WriteFile(filename, jsonBody, flag) {
    console.log(__dirname)
    let filePath = path.join(__dirname, `../../${filename}.json`);
    if (typeof(jsonBody) != "string") jsonBody = JSON.stringify(jsonBody)
    fs.writeFileSync(filePath, prettyPrintJSON(jsonBody,flag), {});
}
module.exports = WriteFile
