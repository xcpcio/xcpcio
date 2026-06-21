import { createPersons } from "@xcpcio/core";
import { describe, expect, it } from "vitest";

describe("person", () => {
  it("should handle null values in members array", () => {
    // Test case where array contains null elements
    const personsWithNull = [null, "张三", null, "李四", null];
    const result = createPersons(personsWithNull as any);

    expect(result.length).toBe(2);
    expect(result[0].name.fallback).toBe("张三");
    expect(result[1].name.fallback).toBe("李四");
  });

  it("should handle array with all null values", () => {
    const allNull = [null, null, null];
    const result = createPersons(allNull as any);

    expect(result.length).toBe(0);
  });

  it("should handle undefined in members array", () => {
    const personsWithUndefined = [undefined, "王五", undefined];
    const result = createPersons(personsWithUndefined as any);

    expect(result.length).toBe(1);
    expect(result[0].name.fallback).toBe("王五");
  });

  it("should handle mixed null and undefined", () => {
    const mixed = [null, "赵六", undefined, "孙七"];
    const result = createPersons(mixed as any);

    expect(result.length).toBe(2);
    expect(result[0].name.fallback).toBe("赵六");
    expect(result[1].name.fallback).toBe("孙七");
  });

  it("should handle normal array without nulls", () => {
    const normal = ["张三", "李四", "王五"];
    const result = createPersons(normal);

    expect(result.length).toBe(3);
    expect(result[0].name.fallback).toBe("张三");
    expect(result[1].name.fallback).toBe("李四");
    expect(result[2].name.fallback).toBe("王五");
  });

  it("should handle Person objects with null values", () => {
    const persons = [
      null,
      { name: "Person 1" },
      null,
      { name: "Person 2" },
    ];
    const result = createPersons(persons as any);

    expect(result.length).toBe(2);
    expect(result[0].name.fallback).toBe("Person 1");
    expect(result[1].name.fallback).toBe("Person 2");
  });

  it("should handle empty array", () => {
    const empty: any[] = [];
    const result = createPersons(empty);

    expect(result.length).toBe(0);
  });

  it("should handle undefined input", () => {
    const result = createPersons(undefined);

    expect(result.length).toBe(0);
  });

  it("should handle string input", () => {
    const result = createPersons("张三");

    expect(result.length).toBe(1);
    expect(result[0].name.fallback).toBe("张三");
  });

  it("should handle comma-separated string", () => {
    const result = createPersons("张三,李四,王五");

    expect(result.length).toBe(3);
    expect(result[0].name.fallback).toBe("张三");
    expect(result[1].name.fallback).toBe("李四");
    expect(result[2].name.fallback).toBe("王五");
  });
});
