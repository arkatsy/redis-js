import { lexerError } from "./resp-error.js";

const CR = 13;
const LF = 10;
const PLUS = 43;
const MINUS = 45;
const COLON = 58;
const DOLLAR = 36;
const ASTERISK = 42;
const UNDERSCORE = 95;
const HASH = 35;
const COMMA = 44;
const OPEN_PAREN = 40;
const EXCLAMATION = 33;
const EQUAL = 61;
const PERCENT = 37;
const TILDE = 126;
const GREATER_THAN = 62;

const SYMBOLS = [
  PLUS,
  MINUS,
  COLON,
  DOLLAR,
  ASTERISK,
  UNDERSCORE,
  HASH,
  COMMA,
  OPEN_PAREN,
  EXCLAMATION,
  EQUAL,
  PERCENT,
  TILDE,
  GREATER_THAN,
];

const SIMPLE_STRING = "SIMPLE_STRING";
const SIMPLE_ERROR = "SIMPLE_ERROR";
const INTEGER = "INTEGER";
const BULK_STRING = "BULK_STRING";
const ARRAY = "ARRAY";
const NULL = "NULL";
const BOOLEAN = "BOOLEAN";
const DOUBLE = "DOUBLE";
const BIG_NUMBER = "BIG_NUMBER";
const BULK_ERROR = "BULK_ERROR";
const VERBATIM_STRING = "VERBATIM_STRING";
const MAP = "MAP";
const SET = "SET";
const PUSH = "PUSH";

// https://redis.io/docs/reference/protocol-spec/
const SymbolType = {
  PLUS: SIMPLE_STRING,
  MINUS: SIMPLE_ERROR,
  COLON: INTEGER,
  DOLLAR: BULK_STRING,
  ASTERISK: ARRAY,
  UNDERSCORE: NULL,
  HASH: BOOLEAN,
  COMMA: DOUBLE,
  OPEN_PAREN: BIG_NUMBER,
  EXCLAMATION: BULK_ERROR,
  EQUAL: VERBATIM_STRING,
  PERCENT: MAP,
  TILDE: SET,
  GREATER_THAN: PUSH,
};

const isDigit = (byte) => byte >= 48 && byte <= 57;
const isChar = (byte) => (byte >= 65 && byte <= 90) || (byte >= 97 && byte <= 122);
const getChar = (byte) => String.fromCharCode(byte);

function lex(buffer) {
  if (!Buffer.isBuffer(buffer)) {
    throw new TypeError(`Argument should be a buffer, got ${typeof buffer} `);
  }

  const lexemes = [];
  let cursor = 0;

  while (cursor < buffer.length) {
    const byte = buffer[cursor];

    switch (true) {
      case SYMBOLS.includes(byte): {
        lexemes.push(getChar(byte));
        cursor++;
        break;
      }
      case byte === CR: {
        if (buffer[cursor + 1] !== LF) {
          throw lexerError(`Invalid CRLF sequence at position ${cursor}`);
        }
        cursor += 2;
        continue;
      }
      case byte === LF: {
        throw lexerError(`Unexpected LF at position ${cursor}. Use CRLF instead`);
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

        throw lexerError(`Unexpected character ${JSON.stringify(getChar(byte))} at position ${cursor}`);
      }
    }
  }

  return lexemes;
}

export { lex, SYMBOLS };
