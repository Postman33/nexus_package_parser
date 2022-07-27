let readFile = require("../utils/file_system/readFile")
let writeFile = require("../utils/file_system/writeFile")
let existsFile = require("../utils/file_system/existsFile")
let fs = require("fs")
 let MODULE = {
    obj: {},
    file: "",

    init(file){
        this.file = "../" + file;
        if (!existsFile(this.file)) writeFile(this.file, this.obj);
        else
        this.obj = readFile(this.file)
    },
    cacheKey(key, value){
        this.obj[key] = value
    },
     cacheObj(value){
         this.obj = value
     },

     readKey(key){
        return this.obj[key]
     },

    startOp(){
        this.obj = readFile(this.file)
    },

    endOp(){
        writeFile(this.file, this.obj)
    }
}


module.exports = MODULE
