import { parserError, readerError, RESPError } from "./resp-error.js";
import styleText from "./style-text.js";

const debugOpts = {
  parser: false,
  reader: false,
};

function setDebugOpts(parser, reader) {
  debugOpts.parser = parser;
  debugOpts.reader = reader;
}

const logger = (msg, from) => {
  console.log(styleText("dim", `${from ? `[${from}] ` : ""}${msg}`));
};

const parseLogger = (msg) => {
  if (debugOpts.parser) {
    logger(msg, "parser");
  }
};

const readLogger = (msg) => {
  if (debugOpts.reader) {
    logger(msg, "reader");
  }
};

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
// prettier-ignore
const SymbolType = {
  "+": SIMPLE_STRING,
  "-": SIMPLE_ERROR,
  ":": INTEGER,
  "$": BULK_STRING,
  "*": ARRAY,
  "_": NULL,
  "#": BOOLEAN,
  ",": DOUBLE,
  "(": BIG_NUMBER,
  "!": BULK_ERROR,
  "=": VERBATIM_STRING,
  "%": MAP,
  "~": SET,
  ">": PUSH,
};

const isDigit = (byte) => byte >= 48 && byte <= 57;
const isChar = (byte) => (byte >= 65 && byte <= 90) || (byte >= 97 && byte <= 122);
const getChar = (byte) => String.fromCharCode(byte);

function parse(buffer) {
  if (!Buffer.isBuffer(buffer)) {
    throw new TypeError(`Argument should be a buffer, got ${typeof buffer}`);
  }

  const cmd = [];
  let cursor = 0;

  while (cursor < buffer.length) {
    const byte = buffer[cursor];
    parseLogger(`parsing byte: ${byte}, table char: ${JSON.stringify(getChar(byte))} cursor: ${cursor}`, "parser");

    switch (true) {
      case SYMBOLS.includes(byte): {
        cmd.push(getChar(byte));
        cursor++;
        break;
      }
      case byte === CR: {
        if (buffer[cursor + 1] !== LF) {
          throw parserError(`Invalid CRLF sequence at position ${cursor}`);
        }
        cursor += 2;
        continue;
      }
      case byte === LF: {
        throw parserError(`Unexpected LF at position ${cursor}. Use CRLF instead`);
      }
      default: {
        if (isDigit(byte)) {
          let value = getChar(byte);
          cursor++;
          while (isDigit(buffer[cursor])) {
            value += getChar(buffer[cursor]);
            cursor++;
          }

          cmd.push(value);
          continue;
        }

        if (isChar(byte)) {
          let value = getChar(byte);
          cursor++;
          while (isChar(buffer[cursor])) {
            value += getChar(buffer[cursor]);
            cursor++;
          }

          cmd.push(value);
          continue;
        }

        throw parserError(`Unexpected character ${JSON.stringify(getChar(byte))} at position ${cursor}`);
      }
    }
  }

  return cmd;
}

function read(cmd) {
  const type = cmd.shift();
  readLogger(`reading type: ${type} (${SymbolType[type]})`, "reader");

  switch (SymbolType[type]) {
    case ARRAY: {
      return readArray(cmd);
    }
    case BULK_STRING: {
      return readBulkString(cmd);
    }
  }
}

function readArray(cmd) {
  const commandLength = cmd.shift();
  readLogger(`array length: ${commandLength}`, "reader");
  let array = [];

  for (let i = 0; i < commandLength; i++) {
    array.push(read(cmd));
  }

  return array;
}

function readBulkString(cmd) {
  const size = cmd.shift();
  const string = cmd.shift();
  readLogger(`bulk string size: ${size}`, "reader");
  if (Number(size) !== string.length) {
    throw readerError(`Expected size ${size}, got ${string.length}`);
  }
  readLogger(`bulk string found: ${string}`, "reader");
  return string;
}


function serialize(data) {
  throw new RESPError("Not implemented");
}

export default {
  parse,
  read,
  setDebugOpts,
  SymbolList: SYMBOLS,
  SymbolTable: SymbolType,
  SIMPLE_STRING,
  SIMPLE_ERROR,
  INTEGER,
  BULK_STRING,
  ARRAY,
  NULL,
  BOOLEAN,
  DOUBLE,
  BIG_NUMBER,
  BULK_ERROR,
  VERBATIM_STRING,
  MAP,
  SET,
  PUSH,
};
