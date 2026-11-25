import type { JsonSchema, SchemaAnnotation } from "@board/composables/jsonSchemaCompletion";
import type { RuntimeComponent, RuntimePageType } from "@board/types";
import type { CompletionSource } from "@codemirror/autocomplete";
import type { EditorState } from "@codemirror/state";
import { computeSchemaAnnotations, createJsonSchemaCompletionSource } from "@board/composables/jsonSchemaCompletion";

export const runtimeConfigSchema: JsonSchema = {
  type: "object",
  properties: {
    pageType: {
      type: "string",
      enums: ["index", "contest", "custom"] satisfies RuntimePageType[],
    },
    component: {
      type: "string",
      enums: ["board", "resolver", "balloon", "countdown"] satisfies RuntimeComponent[],
    },
    dataSource: { type: "string" },
    baseUrl: { type: "string" },
    cdnHost: { type: "string" },
    dataHost: { type: "string" },
    dataRegion: { type: "string" },
    defaultLang: { type: "string", enums: ["en", "zh-CN"] },
    refetchInterval: { type: "number" },
  },
};

export const runtimeConfigHints: CompletionSource = createJsonSchemaCompletionSource(runtimeConfigSchema);

export function runtimeConfigAnnotations(state: EditorState): SchemaAnnotation[] {
  return computeSchemaAnnotations(runtimeConfigSchema, state);
}
