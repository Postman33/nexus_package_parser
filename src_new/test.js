let semver = require("semver")
const ansiColors = require("ansi-colors");


console.log(ansiColors.red(semver.satisfies("4.2.0","^4.0.0")))
console.log(ansiColors.yellow(semver.subset("^4.3.0","^4.1.0"))) // true, поскольку ^4.3.0 содержит ^4.1.0
