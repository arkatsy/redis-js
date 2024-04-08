import util from "node:util";

const styleText = (style, text) => {
  // Experimental - https://nodejs.org/docs/latest/api/util.html#utilstyletextformat-text
  // Style string is a value defined in `util.inspect.colors`
  if (util.styleText) {
    return util.styleText(style, text);
  }

  return text;
};

class RESPError extends Error {
  constructor(msg, from = "") {
    let prefix = "";
    if (from) {
      prefix = styleText("yellow", `[${from}]: `);
    }

    super(`${prefix}${msg}`);
    this.name = styleText("redBright", "RESPError");
  }
}

function lexerError(msg) {
  return new RESPError(msg, "LEXER");
}

function parserError(msg) {
  return new RESPError(msg, "PARSER");
}

export { lexerError, parserError };
