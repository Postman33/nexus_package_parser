function compareTwoVersionsTilda(explodedVersionNumbers, explodedNesusVersion) {

    let result = false

    if (explodedNesusVersion[0] !== explodedVersionNumbers[0]) {
        return result;
    }

    for (let b = 1; b < explodedVersionNumbers.length-1;) {
        if (+explodedNesusVersion[b] > +explodedVersionNumbers[b]) {
            result = true
            break;
        }
        if (+explodedNesusVersion[b] < +explodedVersionNumbers[b]) {
            result = false
            break;
        }
        if (explodedNesusVersion[b] === explodedVersionNumbers[b]) {
            b++
            if (b === explodedNesusVersion.length-1) {
                result = true
                break;
            }
        } else {
            result = false
            break;
        }
    }
    return result;
}
module.exports = compareTwoVersionsTilda
