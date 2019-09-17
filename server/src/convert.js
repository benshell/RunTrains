function hex2bin(hex, bytes = 1) {
  return parseInt(hex, 16)
    .toString(2)
    .padStart(8 * bytes, '0')
}

function dec2bin(dec, bytes = 1) {
  return parseInt(dec, 10)
    .toString(2)
    .padStart(8 * bytes, '0')
}

function hex2dec(hex) {
  return parseInt(hex, 16).toString(10)
}

function bin2dec(bin) {
  return parseInt(bin, 2).toString(10)
}

function bin2hex(bin, bytes = 1) {
  return parseInt(bin, 2)
    .toString(16)
    .toUpperCase()
    .padStart(bytes * 2, '0')
}

function dec2hex(dec, bytes = 1) {
  return parseInt(dec, 10)
    .toString(16)
    .toUpperCase()
    .padStart(bytes * 2, '0')
}

module.exports = {
  hex2bin,
  dec2bin,
  hex2dec,
  bin2dec,
  bin2hex,
  dec2hex,
}
