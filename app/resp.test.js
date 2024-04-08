const { deepEqual } = require("node:assert/strict");
const { describe, test } = require("node:test");
const resp = require("./resp");

describe("lexer", () => {
  test("should lex integer numbers", () => {
    deepEqual(resp.lex(Buffer.from("100")), ["100"]);
  });

  test("should lex simple characters", () => {
    deepEqual(resp.lex(Buffer.from("ping")), ["ping"]);
  });
});
