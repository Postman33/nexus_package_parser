// Функция проверяет, является ли val числом
function isNumber(val) {
    return /^[-]?\d+$/.test(val);
}
module.exports = isNumber
