const CR = "\r".charCodeAt(0);
const LF = "\n".charCodeAt(0);
const PLUS = "+".charCodeAt(0);
const MINUS = "-".charCodeAt(0);
const COLON = ":".charCodeAt(0);
const DOLLAR = "$".charCodeAt(0);
const ASTERISK = "*".charCodeAt(0);
const UNDERSCORE = "_".charCodeAt(0);
const HASH = "#".charCodeAt(0);
const COMMA = ",".charCodeAt(0);
const OPEN_PAREN = "(".charCodeAt(0);
const EXCLAMATION = "!".charCodeAt(0);
const EQUAL = "=".charCodeAt(0);
const PERCENT = "%".charCodeAt(0);
const TILDE = "~".charCodeAt(0);
const GREATER_THAN = ">".charCodeAt(0);

const isDigit = (byte) => byte >= 48 && byte <= 57;
const isChar = (byte) => (byte >= 65 && byte <= 90) || (byte >= 97 && byte <= 122);
const getChar = (byte) => String.fromCharCode(byte);

// https://redis.io/docs/reference/protocol-spec/
const SymbolType = {
  SIMPLE_STRING: PLUS,
  SIMPLE_ERROR: MINUS,
  INTEGER: COLON,
  BULK_STRING: DOLLAR,
  ARRAY: ASTERISK,
  NULL: UNDERSCORE,
  BOOLEAN: HASH,
  DOUBLE: COMMA,
  BIG_NUMBER: OPEN_PAREN,
  BULK_ERROR: EXCLAMATION,
  VERBATIM_STRING: EQUAL,
  MAP: PERCENT,
  SET: TILDE,
  PUSH: GREATER_THAN,
};

class RESPError extends Error {
  constructor(message) {
    super(message);
    this.name = "RESPError";
  }
}

function lex(buffer) {
  if (!Buffer.isBuffer(buffer)) {
    throw new RESPError("Argument to lex must be a buffer");
  }

  const lexemes = [];
  let cursor = 0;

  while (cursor < buffer.length) {
    const byte = buffer[cursor];

    switch (byte) {
      case CR: {
        if (buffer[cursor + 1] !== LF) {
          throw new RESPError(`Invalid CRLF sequence at position ${cursor}`);
        }
        cursor += 2;
      }
      default: {
        if (isDigit(byte)) {
          let value = getChar(byte);
          cursor++;
          while (isDigit(buffer[cursor])) {
            value += getChar(buffer[cursor]);
            cursor++;
          }

          lexemes.push(value);
          continue;
        }

        if (isChar(byte)) {
          let value = getChar(byte);
          cursor++;
          while (isChar(buffer[cursor])) {
            value += getChar(buffer[cursor]);
            cursor++;
          }

          lexemes.push(value);
          continue;
        }

        throw new RESPError(`Unexpected character: ${getChar(byte)} at position ${cursor}`);
      }
    }
  }

  return lexemes;
}

module.exports = {
  lex,
};

// *3\r\n$3\r\nSET\r\n$3\r\nkey\r\n$5\r\nvalue\r\n

// lex: ["*3", "$3", "SET", "$3", "key", "$5", "value"]

// parseRESP(lex) => ["SET", "key", "value"]
