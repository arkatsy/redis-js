import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { lex, SYMBOLS } from "./resp.js";
import { lexerError } from "./resp-error.js";

describe("lexer", () => {
  test("should lex integer numbers", () => {
    assert.deepEqual(lex(Buffer.from("100")), ["100"]);
  });

  test("should lex simple characters", () => {
    assert.deepEqual(lex(Buffer.from("ping")), ["ping"]);
  });

  test("should lex CRLF sequences", () => {
    assert.deepEqual(lex(Buffer.from("100\r\n")), ["100"]);
    assert.deepEqual(lex(Buffer.from("\r\nping\r\n")), ["ping"]);
  });

  test("should throw for invalid CRLF sequences", () => {
    assert.throws(() => {
      lex(Buffer.from("\nping\r\n"));
    });
  });

  test("should throw for unexpected LF characters", () => {
    assert.throws(() => {
      lex(Buffer.from("ping\n"));
    });
  });

  test("should lex data type symbols", () => {
    SYMBOLS.forEach((symbol) => {
      const char = String.fromCharCode(symbol);
      assert.deepEqual(lex(Buffer.from(char)), [char]);
    });
  });
});
