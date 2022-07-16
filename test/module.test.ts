import { expect, test } from "vitest";

import { calculateModule10, calculateModule11 } from "../src/utils/module";

test("calculateModule10", () => {
  // 261533-4
  const first = calculateModule10("261533");
  expect(first).toBe(4);

  // 17643-8
  const second = calculateModule10("17643");
  expect(second).toBe(8);
});

test("calculateModule11", () => {
  // 5555555555-8
  const first = calculateModule11("5555555555");
  expect(first).toBe(8);
});
