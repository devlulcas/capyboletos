import { expect, test } from "vitest";

import { substringReplace, substr } from "../src/utils/string";

test("substringReplace", () => {
  const result = substringReplace("abcdefg", "12345678", 0, 1);
  expect(result).toBe("12345678bcdefg");
});

const base = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

test("substr should return the full string when starting with 0 without a length", () => {
  expect(substr(base, 0)).toBe(
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
  );
});

test("substr should return the rest string when starting with 10 without a length", () => {
  expect(substr(base, 10)).toBe("klmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ");
});

test("substr should go back on the string when starting with -10 without a length", () => {
  expect(substr(base, -10)).toBe("QRSTUVWXYZ");
});

test("substr should return the first then chars when starting with 0 with length 10", () => {
  expect(substr(base, 0, 10)).toBe("abcdefghij");
});

test("substr should return the next 10 chars when starting with 10 with length 10", () => {
  expect(substr(base, 10, 10)).toBe("klmnopqrst");
});

test("substr should return nothing when the length is 0", () => {
  expect(substr(base, 10, 0)).toBe("");
  expect(substr(base, -10, 0)).toBe("");
});

test("substr should return nothing when the length is negative", () => {
  expect(substr(base, 0, -10)).toBe("");
  expect(substr(base, 10, -10)).toBe("");
  expect(substr(base, -10, -10)).toBe("");
});
