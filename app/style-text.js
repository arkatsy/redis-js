import util from "node:util";

const styleText = (style, text) => {
  // Experimental - https://nodejs.org/docs/latest/api/util.html#utilstyletextformat-text
  // style string is a value defined in `util.inspect.colors`
  if (util.styleText) {
    return util.styleText(style, text);
  }

  return text;
};

export default styleText;
