import styleText from "./style-text.js";

class RESPError extends Error {
  constructor(msg, from = "") {
    super(styleText('red', `${from ? `[${from}]` : ""} ${msg}`));
    this.name = ""
  }
}

function parserError(msg) {
  return new RESPError(msg, "parser");
}

function readerError(msg) {
  return new RESPError(msg, "reader");
}


export { parserError, readerError };
