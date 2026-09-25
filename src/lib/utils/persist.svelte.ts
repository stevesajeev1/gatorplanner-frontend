import { browser } from '$app/environment';
import { SvelteMap } from 'svelte/reactivity';

type SerializeFn<V, P> = (value: V) => P;
type DeserializeFn<V, P> = (serialized: P) => V;

export class PersistedMap<K, V, P = V> {
  #key: string;
  #serialize: SerializeFn<V, P>;
  #deserialize: DeserializeFn<V, P>;

  map = new SvelteMap<K, V>();

  constructor(
    key: string,
    serialize: SerializeFn<V, P> = (value: V) => value as unknown as P,
    deserialize: DeserializeFn<V, P> = (value: P) => value as unknown as V
  ) {
    this.#key = key;
    this.#serialize = serialize;
    this.#deserialize = deserialize;

    if (!browser) return;

    const stored = localStorage.getItem(this.#key);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as [K, P][];

        for (const [key, value] of parsed) {
          this.map.set(key, this.#deserialize(value));
        }
      } catch (e) {
        console.error(`Failed to parse localStorage key "${this.#key}":`, e);
      }
    }

    $effect.root(() => {
      $effect(() => {
        const serialized = Array.from(this.map.entries()).map(
          ([key, value]) => [key, this.#serialize(value)] as [K, P]
        );

        localStorage.setItem(this.#key, JSON.stringify(serialized));
      });
    });
  }

  get value() {
		return this.map;
	}

  get size() {
    return this.map.size;
  }

  get(key: K) {
    return this.map.get(key);
  }

  set(key: K, value: V) {
    this.map.set(key, value);
    return this;
  }

  delete(key: K) {
    return this.map.delete(key);
  }

  has(key: K) {
    return this.map.has(key);
  }

  keys() {
    return this.map.keys();
  }

  entries() {
    return this.map.entries();
  }
}

export class PersistedArray<T, P = T> {
  #key: string;
  #serialize: SerializeFn<T, P>;
  #deserialize: DeserializeFn<T, P>;

  array = $state<T[]>([]);

  constructor(
    key: string,
    serialize: SerializeFn<T, P> = (value: T) => value as unknown as P,
    deserialize: DeserializeFn<T, P> = (value: P) => value as unknown as T
  ) {
    this.#key = key;
    this.#serialize = serialize;
    this.#deserialize = deserialize;

    if (!browser) return;

    const stored = localStorage.getItem(this.#key);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as P[];
        this.array = parsed.map(this.#deserialize);
      } catch (e) {
        console.error(`Failed to parse localStorage key "${key}":`, e);
      }
    }

    $effect.root(() => {
      $effect(() => {
        const serialized = this.array.map(this.#serialize);
        localStorage.setItem(this.#key, JSON.stringify(serialized));
      });
    });
  }

  get value() {
		return this.array;
	}

  push(...items: T[]) {
    return this.array.push(...items);
  }

  find(predicate: (value: T, index: number, array: T[]) => boolean) {
    return this.array.find(predicate);
  }

  filter(predicate: (value: T, index: number, array: T[]) => unknown) {
    return this.array.filter(predicate);
  }

  reduce<U>(callback: (accumulator: U, value: T, index: number, array: T[]) => U, initialValue: U) {
    return this.array.reduce(callback, initialValue);
  }

  [Symbol.iterator]() {
    return this.array[Symbol.iterator]();
  }

  replace(values: T[]) {
    this.array = values;
    return this;
  }
}
