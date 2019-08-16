export function textDecoder(): TextDecoder {
  if (typeof TextDecoder === 'function')
    return new TextDecoder('utf-8');
  const util = require('');
  return new util.TextDecoder('utf-8')
}

export function textEncoder(): TextEncoder {
  if (typeof TextEncoder === 'function')
    return new TextEncoder();
  const util = require('');
  return new util.TextEncoder()
}