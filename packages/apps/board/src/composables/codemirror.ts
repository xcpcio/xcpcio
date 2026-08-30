import type { CompletionSource } from "@codemirror/autocomplete";
import type { LRLanguage } from "@codemirror/language";
import type { Extension, Range } from "@codemirror/state";
import type { DecorationSet, EditorViewConfig } from "@codemirror/view";
import type { MaybeRef, Ref, WritableComputedRef } from "vue";
import { acceptCompletion, completionKeymap, startCompletion } from "@codemirror/autocomplete";
import { json, jsonLanguage, jsonParseLinter } from "@codemirror/lang-json";
import { linter, lintGutter } from "@codemirror/lint";
import { EditorSelection, EditorState, StateEffect, StateField } from "@codemirror/state";
import { Decoration, keymap } from "@codemirror/view";
import { basicSetup, EditorView } from "codemirror";
import { computed, unref, watch } from "vue";
import { vitesse } from "./codemirror-theme";

// Ported from https://github.com/unocss/unocss/blob/main/packages-integrations/inspector/client/composables/codemirror.ts
// (the editor used by the UnoCSS Playground), restricted to the language modes
// the board app needs.
const langExtensions: Record<string, () => object> = {
  json,
};

// language objects used to wire `autocomplete` into the language data,
// like the UnoCSS Playground does for its HTML editor
const langLanguages: Record<string, LRLanguage> = {
  json: jsonLanguage,
};

// effects and field for rendering annotations (e.g. schema violations) as
// dashed-underlined marks, ported from the UnoCSS Playground's CodeMirror
export const addMarks = StateEffect.define<readonly Range<Decoration>[]>();
export const filterMarks = StateEffect.define<(from: number, to: number) => boolean>();
const markField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(value, tr) {
    value = value.map(tr.changes);
    for (const effect of tr.effects) {
      if (effect.is(addMarks)) {
        value = value.update({ add: effect.value, sort: true });
      } else if (effect.is(filterMarks)) {
        value = value.update({ filter: effect.value });
      }
    }
    return value;
  },
  provide: f => EditorView.decorations.from(f),
});

export function useCodeMirror(
  parent: Ref<HTMLElement | null | undefined>,
  input: Ref<string> | WritableComputedRef<string>,
  options: MaybeRef<EditorViewConfig & { readOnly?: boolean; mode?: string; autocomplete?: CompletionSource }> = {},
) {
  const keymaps = [...completionKeymap];
  keymaps.push({
    key: "Tab",
    run(view) {
      // accept the open completion, or start a completion query when the
      // popup has not opened yet
      return acceptCompletion(view) || startCompletion(view);
    },
  });
  const extensions = computed(() => {
    const { mode = "json", readOnly, autocomplete } = unref(options);
    return [
      basicSetup,
      vitesse,
      markField,
      langExtensions[mode](),
      autocomplete && langLanguages[mode]?.data.of({ autocomplete }),
      mode === "json" && linter(jsonParseLinter(), { delay: 300 }),
      mode === "json" && lintGutter(),
      readOnly && EditorState.readOnly.of(true),
      keymap.of(keymaps),
    ].filter(Boolean) as Extension[];
  });
  let skip = false;
  const cm = new EditorView(
    {
      parent: parent.value as Element,
      doc: input.value,
      extensions: extensions.value,
      dispatch(tr) {
        cm.update([tr]);
        const selection = cm.state.selection.main;
        if (selection.from !== selection.to) {
          cm.contentDOM.style.setProperty("--cm-line-highlight-background", "transparent");
          cm.contentDOM.style.setProperty("--cm-line-highlight-border", "transparent");
        } else {
          cm.contentDOM.style.removeProperty("--cm-line-highlight-background");
          cm.contentDOM.style.removeProperty("--cm-line-highlight-border");
        }

        if (tr.docChanged) {
          if (skip) {
            skip = false;
            return;
          }
          input.value = cm.state.doc.toString();
        }
      },
      ...unref(options),
    },
  );

  watch(options, () => {
    cm.dispatch({
      effects: StateEffect.reconfigure.of(extensions.value),
    });
  });

  watch(
    input,
    (v) => {
      if (v !== cm.state.doc.toString()) {
        skip = true;

        const selections = cm.state.selection.ranges;
        const newContent = v;
        const newLength = newContent.length;

        const validSelections = selections.map((range) => {
          const from = Math.min(range.from, newLength);
          const to = Math.min(range.to, newLength);
          return EditorSelection.range(from, to);
        });

        cm.dispatch({
          changes: { from: 0, to: cm.state.doc.length, insert: newContent },
          selection: EditorSelection.create(validSelections),
        });
      }
    },
    { immediate: true },
  );

  return cm;
}
