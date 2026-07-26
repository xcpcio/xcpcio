<script setup lang="ts">
import type { SchemaAnnotation } from "@board/composables/jsonSchemaCompletion";
import type { CompletionSource } from "@codemirror/autocomplete";
import type { EditorState } from "@codemirror/state";
import { addMarks, filterMarks, useCodeMirror } from "@board/composables/codemirror";
import { Decoration } from "@codemirror/view";

const props = defineProps<{
  modelValue: string;
  mode?: string;
  readOnly?: boolean;
  getHint?: CompletionSource;
  getAnnotations?: (state: EditorState) => SchemaAnnotation[];
}>();

const emit = defineEmits<{ (e: "update:modelValue", payload: string): void }>();

const el = ref<HTMLElement>();
const input = useVModel(props, "modelValue", emit, { passive: true });

onMounted(() => {
  const cm = useCodeMirror(el, input, reactive({
    autocomplete: props.getHint,
    ...toRefs(props),
  }));

  // render schema annotations (e.g. invalid keys or enum values) as
  // dashed-underlined marks, like the UnoCSS Playground's `.highlighted`
  function highlight() {
    if (!props.getAnnotations) {
      return;
    }
    const marks = props.getAnnotations(cm.state).map(({ from, to }) =>
      Decoration.mark({ class: "highlighted" }).range(from, to));
    cm.dispatch({
      effects: [
        filterMarks.of(() => false),
        addMarks.of(marks),
      ],
    });
  }

  let timer: ReturnType<typeof setTimeout> | undefined;
  watch(() => [props.modelValue, props.getAnnotations], () => {
    clearTimeout(timer);
    timer = setTimeout(highlight, 200);
  }, { immediate: true });
});
</script>

<template>
  <div
    ref="el"
    class="relative h-full font-mono text-sm"
    data-enable-grammarly="false"
  />
</template>

<style>
/* Ported from https://github.com/unocss/unocss/blob/main/packages-integrations/inspector/client/components/CodeMirror.vue
   (the editor component and theme of the UnoCSS Playground). */
#gtx-trans,
grammarly-extension,
deepl-inline-translate,
grammarly-popups,
deepl-inline-popup,
grammarly-desktop-integration {
  display: none !important;
}

.cm-editor {
  height: 100% !important;
  width: 100% !important;
  font-family: inherit;
}
.cm-content {
  cursor: text !important;
}

:root:not(.dark) .cm-search .cm-button {
  background-image: linear-gradient(#f5f6f7, #eee);
}
:root:not(.dark) .cm-search .cm-button:active {
  background-image: linear-gradient(#eee, #f5f6f7);
}

:root {
  --cm-font-family: "Fira Code", monospace;
  --cm-foreground: #393a3480;
  --cm-background: #fdfdfd;
  --cm-comment: #a0ada0;
  --cm-string: #b56959;
  --cm-number: #296aa3;
  --cm-variable: #59873a;
  --cm-keyword: #1c6b48;
  --cm-property: #b58451;
  --cm-definition-keyword: #ab5959;
  --cm-punctuation: #8e8f8b;
  --cm-decorator: #b07d48;
  --cm-line-highlight-background: #c9c9c910;
  --cm-line-highlight-border: #b0b0b030;
  --cm-tooltip-background: #fdfdfd;
  --cm-selection-background: #eeeeee;
  --cm-border: #9ca3af1a;
  /* scrollbars colors */
  --cm-ttc-c-thumb: #eee;
  --cm-ttc-c-track: white;
}

html.dark {
  --cm-scheme: dark;
  --cm-foreground: #d4cfbf80;
  --cm-background: #121212;
  --cm-comment: #758575;
  --cm-string: #d48372;
  --cm-keyword: #4d9375;
  --cm-number: #6394bf;
  --cm-variable: #c2b36e;
  --cm-property: #dd8e6e;
  --cm-definition-keyword: #cb7676;
  --cm-punctuation: #858585;
  --cm-decorator: #bd976a;
  --cm-line-number: #dedcd530;
  --cm-line-number-gutter: #eeeeee;
  --cm-line-highlight-background: #4d4d4d29;
  --cm-line-highlight-border: #3a3a3a80;
  --cm-tooltip-background: #121212;
  --cm-selection-background: #242424;
  /* scrollbars colors */
  --cm-ttc-c-thumb: #222;
  --cm-ttc-c-track: #111;
}

.cm-scroller::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.cm-scroller::-webkit-scrollbar-track {
  background: var(--cm-ttc-c-track);
}
.cm-scroller::-webkit-scrollbar-thumb {
  background-color: var(--cm-ttc-c-thumb);
  border-radius: 3px;
  border: 2px solid var(--cm-ttc-c-thumb);
}
.cm-scroller::-webkit-scrollbar-corner {
  background-color: var(--cm-ttc-c-track);
}
.cm-scroller {
  scrollbar-width: thin;
  scrollbar-color: var(--cm-ttc-c-thumb) var(--cm-ttc-c-track);
}

.highlighted,
.highlighted > span {
  border-bottom: 1px dashed currentColor;
}
</style>
