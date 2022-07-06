//view <packageName> --dependencies
const {exec} = require('child_process');
let semver = require("semver")
let pack = require("../package.json")
let name = "mongoose"
let validationList = []
const util  = require("util");
const execPromise = util.promisify(exec);

function execShellCommand(cmd,cb) {
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            console.log(stdout)

            if (error) {
                console.warn(error);
            }
            cb(stdout)
            // TODO: Change args
            resolve(stdout? stdout : stderr);
        });
    });
}

async function analyzeDependencies(lib) {

    return execShellCommand(
        `npm view ${lib} dependencies --json`,
        (stdout) => {
            if (stdout === '') return;
            console.log(stdout)
            console.log(typeof stdout)
            console.log(JSON.parse(stdout))
            let json = JSON.parse(stdout);

            for (let libName in json){
                let reqVersion = json[libName] // Требование к пакетным версиям
                validationList[ libName ] = validationList[libName] || []
                validationList[ libName ].push( reqVersion )
                console.log(libName)
                console.log(semver.minVersion(reqVersion).version)
                 analyzeDependencies(libName)
            }
            console.log("test")
        });

}


let s = async ()=> {
    const dependencies = pack.dependencies;
    for (let lib in dependencies) {
        console.log(`Parsing of ${lib}${dependencies[lib]}`)
        await analyzeDependencies(lib + "@" + dependencies[lib])
    }


    console.log(validationList)
}
 s();

