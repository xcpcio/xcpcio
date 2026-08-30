import { CompletionContext } from "@codemirror/autocomplete";
import { json } from "@codemirror/lang-json";
import { EditorState } from "@codemirror/state";
import { describe, expect, it } from "vitest";
import { computeSchemaAnnotations } from "../src/composables/jsonSchemaCompletion";
import { runtimeConfigAnnotations, runtimeConfigHints, runtimeConfigSchema } from "../src/pages/custom/runtimeConfigSchema";

function hints(doc: string, pos = doc.length) {
  const state = EditorState.create({ doc, extensions: [json()] });
  return runtimeConfigHints(new CompletionContext(state, pos, false));
}

describe("runtimeConfigHints", () => {
  it("suggests the top-level keys while typing a property name", () => {
    const doc = `{\n  "pag`;
    const result = hints(doc);
    expect(result).not.toBeNull();

    const labels = result!.options.map(o => o.label);
    expect(labels).toContain("pageType");
    expect(labels).toContain("dataSource");
    expect(labels).toContain("refetchInterval");
    expect(labels).toHaveLength(9);
    // `pag` matches pageType, so normal filtering applies
    expect(result!.filter).toBe(true);
    // replace the typed prefix, keeping the opening quote
    expect(result!.from).toBe(doc.indexOf("pag"));
  });

  it("shows all keys when the typed property name matches none", () => {
    const doc = `{\n  "bo`;
    const result = hints(doc);
    expect(result).not.toBeNull();
    expect(result!.options.map(o => o.label)).toHaveLength(9);
    // no schema key matches `bo` — show them all without filtering
    expect(result!.filter).toBe(false);
    expect(result!.from).toBe(doc.indexOf("bo"));
  });

  it("suggests all keys inside empty quotes", () => {
    const doc = `{\n  ""`;
    const result = hints(doc, doc.length - 1);
    expect(result).not.toBeNull();
    expect(result!.options.map(o => o.label)).toHaveLength(9);
    expect(result!.from).toBe(doc.length - 1);
  });

  it("does not suggest keys right after a comma", () => {
    expect(hints(`{\n  "pageType": "contest",\n  `)).toBeNull();
  });

  it("suggests keys inside quotes after a comma, excluding existing ones", () => {
    const doc = `{\n  "pageType": "contest",\n  ""`;
    const result = hints(doc, doc.length - 1);
    expect(result).not.toBeNull();

    const labels = result!.options.map(o => o.label);
    expect(labels).not.toContain("pageType");
    expect(labels).toContain("component");
    expect(labels).toContain("dataSource");
    expect(result!.from).toBe(doc.length - 1);
  });

  it("suggests enum values while typing a quoted value", () => {
    const doc = `{\n  "pageType": "con`;
    const result = hints(doc);
    expect(result).not.toBeNull();
    expect(result!.options.map(o => o.label)).toEqual(["index", "contest", "custom"]);

    // `con` matches contest, so normal filtering applies
    expect(result!.filter).toBe(true);
    // inside quotes → replace the partial value, apply the bare label
    expect(result!.from).toBe(doc.indexOf("con"));
    expect(result!.options.find(o => o.label === "contest")?.apply).toBe("contest");
  });

  it("shows all enum options when the typed value matches none", () => {
    const doc = `{\n  "pageType": "bo`;
    const result = hints(doc);
    expect(result).not.toBeNull();
    expect(result!.options.map(o => o.label)).toEqual(["index", "contest", "custom"]);
    // `bo` matches no enum — show them all without filtering
    expect(result!.filter).toBe(false);
    expect(result!.from).toBe(doc.indexOf("bo"));
  });

  it("suggests valid enums for a complete value that does not match", () => {
    const doc = `{\n  "pageType": "board"`;
    const result = hints(doc);
    expect(result).not.toBeNull();
    expect(result!.options.map(o => o.label)).toEqual(["index", "contest", "custom"]);
    expect(result!.filter).toBe(false);
    // replace the whole value, keeping its quotes
    expect(result!.from).toBe(doc.indexOf("board"));
    expect(result!.to).toBe(doc.indexOf("board") + 5);
  });

  it("suggests enum values inside empty quotes", () => {
    const doc = `{\n  "pageType": ""`;
    const result = hints(doc, doc.length - 1);
    expect(result).not.toBeNull();
    expect(result!.options.map(o => o.label)).toEqual(["index", "contest", "custom"]);
    expect(result!.from).toBe(doc.length - 1);
    expect(result!.options.find(o => o.label === "index")?.apply).toBe("index");
  });

  it("does not suggest values right after the colon", () => {
    expect(hints(`{\n  "pageType": `)).toBeNull();
  });

  it("replaces a partial unquoted value with a quoted one", () => {
    const doc = `{\n  "pageType": c`;
    const result = hints(doc);
    expect(result).not.toBeNull();
    expect(result!.options.map(o => o.label)).toEqual(["index", "contest", "custom"]);
    expect(result!.from).toBe(doc.indexOf("c"));
    expect(result!.options.find(o => o.label === "index")?.apply).toBe("\"index\"");
  });

  it("suggests the valid keys when the property name is unknown", () => {
    const doc = `{\n  "foobar": "x`;
    const result = hints(doc);
    expect(result).not.toBeNull();

    const labels = result!.options.map(o => o.label);
    expect(labels).toContain("pageType");
    expect(labels).toContain("dataSource");
    // applying replaces the invalid property name, keeping its quotes
    expect(result!.from).toBe(doc.indexOf("foobar"));
    expect(result!.to).toBe(doc.indexOf("foobar") + 6);
    expect(result!.filter).toBe(false);
  });

  it("returns null for fields without enum values", () => {
    const doc = `{\n  "refetchInterval": ""`;
    expect(hints(doc, doc.length - 1)).toBeNull();
  });

  it("returns null right after a complete valid value", () => {
    expect(hints(`{\n  "pageType": "contest"`)).toBeNull();
  });

  it("returns null for a complete key that is already in the object", () => {
    expect(hints(`{\n  "pageType": "contest",\n  "pageType"`)).toBeNull();
  });

  it("does not force-show other keys while re-typing an existing key", () => {
    const doc = `{\n  "pageType": "contest",\n  "pageT`;
    const result = hints(doc);
    expect(result).not.toBeNull();
    // the partial matches the existing key — normal (empty) filtering
    expect(result!.filter).toBe(true);
  });
});

describe("computeSchemaAnnotations", () => {
  function annotations(doc: string) {
    const state = EditorState.create({ doc, extensions: [json()] });
    return computeSchemaAnnotations(runtimeConfigSchema, state);
  }

  it("marks property names that are not in the schema", () => {
    const doc = `{\n  "foobar": "x"\n}`;
    expect(annotations(doc)).toEqual([{ from: doc.indexOf("foobar"), to: doc.indexOf("foobar") + 6 }]);
  });

  it("marks enum values that match no option", () => {
    const doc = `{\n  "pageType": "board"\n}`;
    expect(annotations(doc)).toEqual([{ from: doc.indexOf("board"), to: doc.indexOf("board") + 5 }]);
  });

  it("does not mark a valid config", () => {
    expect(annotations(`{\n  "pageType": "contest",\n  "component": "board"\n}`)).toEqual([]);
  });

  it("does not mark free-form string fields", () => {
    expect(annotations(`{\n  "dataSource": "anything"\n}`)).toEqual([]);
  });

  it("does not mark empty or partial values", () => {
    expect(annotations(`{\n  "pageType": ""\n}`)).toEqual([]);
    expect(annotations(`{\n  "pageType": "bo`)).toEqual([]);
  });

  it("returns nothing for a non-object document", () => {
    expect(annotations(`[]`)).toEqual([]);
    expect(annotations(``)).toEqual([]);
  });

  it("is wired as runtimeConfigAnnotations", () => {
    const state = EditorState.create({
      doc: `{\n  "pageType": "board"\n}`,
      extensions: [json()],
    });
    expect(runtimeConfigAnnotations(state)).toHaveLength(1);
  });
});
