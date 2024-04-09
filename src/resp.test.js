import assert from "node:assert/strict";
import { describe, test } from "node:test";
import Resp from "./resp.js";

describe("Resp parser", () => {
  test("should parse integer numbers", () => {
    assert.deepEqual(Resp.parse(Buffer.from("100")), ["1", "0", "0"]);
  });

  test("should parse simple characters", () => {
    assert.deepEqual(Resp.parse(Buffer.from("ping")), ["p", "i", "n", "g"]);
  });

  test("should parse CRLF sequences", () => {
    assert.deepEqual(Resp.parse(Buffer.from("100\r\n")), ["1", "0", "0"]);
    assert.deepEqual(Resp.parse(Buffer.from("\r\nping\r\n")), ["p", "i", "n", "g"]);
  });

  test("should throw for invalid CRLF sequences", () => {
    assert.throws(() => {
      Resp.parse(Buffer.from("\nping\r\n"));
    });
  });

  test("should throw for unexpected LF characters", () => {
    assert.throws(() => {
      Resp.parse(Buffer.from("ping\n"));
    });
  });

  test("should parse data type symbols", () => {
    Resp.SymbolList.forEach((symbol) => {
      const char = String.fromCharCode(symbol);
      assert.deepEqual(Resp.parse(Buffer.from(char)), [char]);
    });
  });
});

describe("Resp reader (assuming parser correctness)", () => {
  test("should read echo command", () => {
    const echoCmd = "*2\r\n$4\r\nECHO\r\n$3\r\nhey\r\n";
    assert.deepEqual(Resp.read(Resp.parse(Buffer.from(echoCmd))), ["ECHO", "hey"]);
  });
});
