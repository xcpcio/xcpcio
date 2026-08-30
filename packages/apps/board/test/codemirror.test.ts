import type { CompletionSource } from "@codemirror/autocomplete";
import { currentCompletions } from "@codemirror/autocomplete";
import { describe, expect, it } from "vitest";
import { nextTick, reactive, ref } from "vue";
import { useCodeMirror } from "../src/composables/codemirror";
import { runtimeConfigHints } from "../src/pages/custom/runtimeConfigSchema";

// jsdom does not implement Range#getClientRects, which CodeMirror's
// selection-match layer calls during view measurement
if (!Range.prototype.getClientRects) {
  Range.prototype.getClientRects = (() => []) as unknown as () => DOMRectList;
}
if (!Range.prototype.getBoundingClientRect) {
  Range.prototype.getBoundingClientRect = () => ({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    toJSON: () => ({}),
  });
}

const configText = `{
  "pageType": "contest",
  "component": "board",
  "dataSource": "/data/contest.json"
}`;

function createEditor(input = ref(configText), autocomplete?: CompletionSource) {
  const parent = document.createElement("div");
  document.body.appendChild(parent);
  const el = ref<HTMLElement | null>(parent);
  const cm = useCodeMirror(el, input, reactive({ autocomplete }));

  return { cm, input, parent };
}

// dispatch a typing transaction and wait for the completion query
// (activateOnTypingDelay is 100ms) to run; cursorOffset places the cursor
// inside the inserted text (e.g. between auto-closed quotes)
async function type(cm: ReturnType<typeof useCodeMirror>, text: string, cursorOffset = text.length) {
  const pos = cm.state.doc.length;
  cm.dispatch({
    changes: { from: pos, insert: text },
    selection: { anchor: pos + cursorOffset },
    userEvent: "input.type",
  });
  await new Promise(resolve => setTimeout(resolve, 300));
}

function pressTab(cm: ReturnType<typeof useCodeMirror>) {
  cm.contentDOM.dispatchEvent(new KeyboardEvent("keydown", {
    key: "Tab",
    bubbles: true,
    cancelable: true,
  }));
}

describe("useCodeMirror", () => {
  it("syncs editor changes back to the input ref", () => {
    const { cm, input, parent } = createEditor();

    cm.dispatch({ changes: { from: 2, insert: "x" } });

    expect(input.value).toBe(cm.state.doc.toString());
    expect(input.value).toContain("x");

    cm.destroy();
    parent.remove();
  });

  it("replaces the editor content when the input changes externally", async () => {
    const { cm, input, parent } = createEditor();

    input.value = `{\n  "pageType": "custom"\n}`;
    await nextTick();

    expect(cm.state.doc.toString()).toBe(input.value);
    expect(cm.state.doc.toString()).toContain("custom");
    expect(cm.state.doc.toString()).not.toContain("dataSource");

    cm.destroy();
    parent.remove();
  });

  it("shows schema hints when typing inside auto-closed quotes", async () => {
    const { cm, parent } = createEditor(ref(""), runtimeConfigHints);

    // the cursor sits between the `""` pair, like closeBrackets leaves it
    await type(cm, `{\n  ""`, 5);

    const labels = currentCompletions(cm.state).map(o => o.label);
    expect(labels).toContain("pageType");
    expect(labels).toContain("dataSource");

    cm.destroy();
    parent.remove();
  });

  it("does not show hints right after a comma", async () => {
    const { cm, parent } = createEditor(ref(""), runtimeConfigHints);

    await type(cm, `{\n  "pageType": "contest",\n  `);

    expect(currentCompletions(cm.state)).toEqual([]);

    cm.destroy();
    parent.remove();
  });

  it("shows enum hints for values while typing", async () => {
    const { cm, parent } = createEditor(ref(""), runtimeConfigHints);

    await type(cm, `{\n  "pageType": "con`);

    const labels = currentCompletions(cm.state).map(o => o.label);
    expect(labels).toEqual(["contest"]);

    cm.destroy();
    parent.remove();
  });

  it("shows all enum options when the typed value matches none", async () => {
    const { cm, parent } = createEditor(ref(""), runtimeConfigHints);

    await type(cm, `{\n  "pageType": "bo`);

    const labels = currentCompletions(cm.state).map(o => o.label);
    expect(labels).toEqual(["index", "contest", "custom"]);

    cm.destroy();
    parent.remove();
  });

  it("accepts the open completion with Tab", async () => {
    const { cm, input, parent } = createEditor(ref(""), runtimeConfigHints);

    await type(cm, `{\n  "pag`);
    pressTab(cm);
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(cm.state.doc.toString()).toContain("pageType");
    expect(input.value).toContain("pageType");

    cm.destroy();
    parent.remove();
  });

  it("starts a completion query with Tab when the popup is not open", async () => {
    const { cm, parent } = createEditor(ref(""), runtimeConfigHints);

    // no waiting for the popup — Tab right after typing
    const pos = cm.state.doc.length;
    cm.dispatch({
      changes: { from: pos, insert: `{\n  "pag` },
      selection: { anchor: pos + 6 },
      userEvent: "input.type",
    });
    pressTab(cm);
    await new Promise(resolve => setTimeout(resolve, 300));

    const labels = currentCompletions(cm.state).map(o => o.label);
    expect(labels).toContain("pageType");

    cm.destroy();
    parent.remove();
  });

  it("shows valid enums for a complete value that does not match", async () => {
    const { cm, parent } = createEditor(ref(""), runtimeConfigHints);

    await type(cm, `{\n  "pageType": "board"`);

    const labels = currentCompletions(cm.state).map(o => o.label);
    expect(labels).toEqual(["index", "contest", "custom"]);

    cm.destroy();
    parent.remove();
  });

  it("shows the valid keys when the property name is unknown", async () => {
    const { cm, parent } = createEditor(ref(""), runtimeConfigHints);

    await type(cm, `{\n  "foobar": "x`);

    const labels = currentCompletions(cm.state).map(o => o.label);
    expect(labels).toContain("pageType");
    expect(labels).toContain("dataSource");

    cm.destroy();
    parent.remove();
  });

  it("marks JSON syntax errors with the linter", async () => {
    const { cm, parent } = createEditor(ref(`{\n  "pageType": "contest",\n}`));

    // JSON.parse errors are single-position diagnostics, rendered as an
    // inline lint point (the lint run is debounced by 300ms)
    await new Promise(resolve => setTimeout(resolve, 700));

    expect(cm.contentDOM.querySelector(".cm-lintPoint-error")).not.toBeNull();

    // fixing the JSON clears the error
    cm.dispatch({
      changes: {
        from: 0,
        to: cm.state.doc.length,
        insert: `{\n  "pageType": "contest"\n}`,
      },
    });
    await new Promise(resolve => setTimeout(resolve, 700));

    expect(cm.contentDOM.querySelector(".cm-lintPoint-error")).toBeNull();

    cm.destroy();
    parent.remove();
  });

  it("does not show schema hints without an autocomplete source", async () => {
    const { cm, parent } = createEditor(ref(""));

    await type(cm, `{\n  "pageType": "con`);

    // without the schema source only CodeMirror's word-completion
    // fallback runs, which cannot invent "contest"
    const labels = currentCompletions(cm.state).map(o => o.label);
    expect(labels).not.toContain("contest");
    expect(labels).not.toContain("index");

    cm.destroy();
    parent.remove();
  });
});
