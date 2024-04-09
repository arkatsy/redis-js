import styleText from "./style-text.js";

class CacheError extends Error {
  constructor(message) {
    super(styleText("redBright", `[cache]: ${message}`));
    this.name = "";
  }
}

const EVENTS = {
  SET: "set",
  GET: "get",
};

const getLogger = (msg) => {
  console.log(styleText("dim", `[cache] ${msg}`));
};

export default class RedisCache {
  static instance = null;
  #cache = new Map();

  constructor({ debugCache = false }) {
    this.logger = debugCache ? getLogger : () => {};

    if (!RedisCache.instance) {
      this.logger("creating new cache instance");
      RedisCache.instance = this;
    }

    this.listeners = new Map(Object.values(EVENTS).map((event) => [event, new Set()]));
    this.logger(`listeners initialized: ${JSON.stringify([...this.listeners])}`);
    return RedisCache.instance;
  }

  get(key) {
    this.logger(`getting key: ${key}`);
    this.listeners.get(EVENTS.GET).forEach((listener) => listener(key));
    return this.#cache.get(key) || null;
  }

  set(key, value, px = null) {
    this.logger(`setting key: ${key} to value: ${value}`);
    this.listeners.get(EVENTS.SET).forEach((listener) => listener(key, value));
    this.#cache.set(key, value);

    if (px) {
      setTimeout(() => {
        this.logger(`deleting key: ${key} after ${px}ms`);
        this.#cache.delete(key);
      }, px);
    }
  }

  subscribe(event, listener) {
    if (!this.listeners.has(event)) {
      throw new CacheError(`event: ${JSON.stringify(event)} does not exist`);
      return;
    }
    this.listeners.get(event).add(listener);

    return () => {
      this.logger(`removing listener for event: ${event}`);
      this.listeners.get(event).delete(listener);
      this.logger(`listeners left: ${JSON.stringify([...this.listeners])}`);
    };
  }
}
