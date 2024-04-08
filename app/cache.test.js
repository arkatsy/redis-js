import assert from "node:assert/strict";
import { describe, test } from "node:test";
import RedisCache from "./cache.js";

const cache = new RedisCache({ debugCache: false });

describe("cache", () => {
  test("should set and get a key", () => {
    cache.set("foo", "bar");
    assert.equal(cache.get("foo"), "bar");
  });

  test("should return null for a non-existent key", () => {
    assert.equal(cache.get("baz"), null);
  });
});
