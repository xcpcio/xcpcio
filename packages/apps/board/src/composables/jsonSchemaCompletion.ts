import type { Completion, CompletionContext, CompletionResult, CompletionSource } from "@codemirror/autocomplete";
import type { EditorState, Text } from "@codemirror/state";
import type { SyntaxNode } from "@lezer/common";
import { ensureSyntaxTree, syntaxTree } from "@codemirror/language";

export interface JsonSchema {
  type?: "object" | "string" | "number" | "boolean";
  enums?: string[];
  properties?: Record<string, JsonSchema>;
}

export interface SchemaAnnotation {
  from: number;
  to: number;
}

/**
 * Build a CodeMirror completion source that suggests property names and
 * enum values while editing JSON, driven by a lightweight schema.
 *
 * Hints open once the user starts typing inside quotes (e.g. after `""`),
 * not right after `{`, `,`, or `:`. When the typed content does not match
 * the schema — a property name that matches no key, or an enum value that
 * matches no option — the valid options are shown anyway (`filter: false`)
 * so the user can pick a correct one.
 */
export function createJsonSchemaCompletionSource(schema: JsonSchema): CompletionSource {
  return (context): CompletionResult | null => {
    const tree = ensureSyntaxTree(context.state, context.pos, 100) ?? syntaxTree(context.state);
    const node = tree.resolveInner(context.pos, -1);
    if (!node) {
      return propertyCompletions(context, schema, null, false);
    }

    // whether the cursor is inside a quoted string — the popup only opens
    // once the user starts typing inside quotes (e.g. after `""`), not
    // right after `{`, `,`, or `:`. Property names parse as an isolated
    // `PropertyName` node (no separate `String` token), values as `String`.
    let inString = false;
    for (let n: SyntaxNode | null = node; n; n = n.parent) {
      if (n.name === "String" || n.name === "PropertyName") {
        inString = true;
        break;
      }
    }
    // climb to the enclosing Property, Object, or the document root
    let cur: SyntaxNode | null = node;
    let prop: SyntaxNode | null = null;
    while (cur) {
      if (cur.name === "Property") {
        prop = cur;
        break;
      }
      if (cur.name === "Object" || cur.name === "JsonText") {
        break;
      }
      cur = cur.parent;
    }

    if (prop) {
      const nameNode = prop.firstChild; // PropertyName
      // the cursor is inside the property name → complete the object's keys
      // (compared by name, not node identity — tree nodes from
      // resolveInner and firstChild are distinct instances)
      let p: SyntaxNode | null = node;
      while (p && p !== prop) {
        if (p.name === "PropertyName") {
          // the key is complete (cursor at/after its end) — wait for the
          // `:`, nothing to suggest
          if (p.to <= context.pos) {
            return null;
          }
          return propertyCompletions(context, schema, prop.parent, inString);
        }
        p = p.parent;
      }
      // otherwise the cursor is in the value part (or right after the `:`)
      const valueNode = nameNode?.nextSibling?.nextSibling ?? null;
      return valueCompletions(context, schema, keyName(context.state, nameNode), prop.parent, nameNode, valueNode, inString);
    }

    if (cur?.name === "JsonText") {
      return propertyCompletions(context, schema, null, inString);
    }

    // the cursor is directly inside an Object
    const last = lastChildBefore(cur, context.pos);
    if (last?.name === "Property") {
      return valueCompletions(context, schema, keyName(context.state, last.firstChild), cur, last.firstChild, last.lastChild, inString);
    }
    return propertyCompletions(context, schema, cur, inString);
  };
}

function lastChildBefore(obj: SyntaxNode | null, pos: number): SyntaxNode | null {
  if (!obj) {
    return null;
  }
  let last: SyntaxNode | null = null;
  for (let ch = obj.firstChild; ch; ch = ch.nextSibling) {
    if (ch.from < pos) {
      last = ch;
    } else {
      break;
    }
  }
  return last;
}

function keyName(state: EditorState, node: SyntaxNode | null): string | null {
  if (!node) {
    return null;
  }
  const text = state.sliceDoc(node.from, node.to);
  return text.startsWith("\"") && text.endsWith("\"") ? text.slice(1, -1) : text;
}

// resolve the schema level for an object via its ancestor property names,
// e.g. a nested `{ "pageType": { ... } }` resolves to properties.pageType
function objectSchema(context: CompletionContext, schema: JsonSchema, obj: SyntaxNode | null): JsonSchema | null {
  const path: string[] = [];
  let cur = obj?.parent ?? null;
  while (cur) {
    if (cur.name === "Property") {
      const name = keyName(context.state, cur.firstChild);
      if (name) {
        path.unshift(name);
      }
    }
    cur = cur.parent;
  }
  let level: JsonSchema | null = schema;
  for (const key of path) {
    level = level.properties?.[key] ?? null;
    if (!level) {
      return null;
    }
  }
  return level;
}

function wordStart(doc: Text, pos: number): number {
  let from = pos;
  while (from > 0 && /\w/.test(doc.sliceString(from - 1, from))) {
    from--;
  }
  return from;
}

// same subsequence matching CodeMirror's own completion filter uses
function fuzzyMatch(label: string, typed: string): boolean {
  const lower = label.toLowerCase();
  const t = typed.toLowerCase();
  let i = 0;
  for (let j = 0; j < lower.length && i < t.length; j++) {
    if (lower[j] === t[i]) {
      i++;
    }
  }
  return i === t.length;
}

function propertyCompletions(context: CompletionContext, schema: JsonSchema, obj: SyntaxNode | null, inString: boolean): CompletionResult | null {
  const level = objectSchema(context, schema, obj);
  const properties = level?.properties;
  if (!properties) {
    return null;
  }

  const existing = new Set<string>();
  if (obj) {
    for (let ch = obj.firstChild; ch; ch = ch.nextSibling) {
      if (ch.name === "Property") {
        const name = keyName(context.state, ch.firstChild);
        if (name) {
          existing.add(name);
        }
      }
    }
  }

  const options: Completion[] = [];
  for (const [name, child] of Object.entries(properties)) {
    if (existing.has(name)) {
      continue;
    }
    options.push({
      label: name,
      type: "property",
      detail: child.type,
    });
  }
  if (!options.length) {
    return null;
  }

  const from = wordStart(context.state.doc, context.pos);
  // nothing typed yet and the cursor is not inside quotes (e.g. right
  // after `{` or `,`) — wait for the user to start the key
  if (from === context.pos && !inString) {
    return null;
  }
  const typed = context.state.doc.sliceString(from, context.pos);
  // the key is already in the object — nothing to suggest (e.g. right
  // after a completion was accepted)
  if (existing.has(typed)) {
    return null;
  }
  // when the typed key matches none of the valid ones, show them all so
  // the user can pick a correct name; when it matches a schema key that
  // is already present, normal (empty) filtering applies
  const filter = options.some(o => fuzzyMatch(o.label, typed))
    || Object.keys(properties).some(k => fuzzyMatch(k, typed));

  return {
    from,
    filter,
    options,
  };
}

function valueCompletions(
  context: CompletionContext,
  schema: JsonSchema,
  key: string | null,
  obj: SyntaxNode | null,
  nameNode: SyntaxNode | null,
  valueNode: SyntaxNode | null,
  inString: boolean,
): CompletionResult | null {
  const keySchema = key ? schema.properties?.[key] : undefined;
  if (keySchema === undefined) {
    // the property name does not match the schema — suggest the valid
    // keys, replacing the property name itself
    return keyCorrections(context, schema, obj, nameNode);
  }
  const enums = keySchema.enums;
  if (!enums?.length) {
    return null;
  }

  const doc = context.state.doc;
  const complete = valueNode !== null
    && valueNode.name !== ":"
    && valueNode.name !== "⚠"
    && valueNode.to <= context.pos;
  if (complete) {
    // a complete value was just typed — keep quiet unless it does not
    // match the schema, in which case offer the valid options
    const valueText = doc.sliceString(valueNode.from, valueNode.to);
    if (enums.some(v => valueText === `"${v}"`)) {
      return null;
    }
    return {
      from: valueNode.from + 1,
      to: valueNode.to - 1,
      filter: false,
      options: enums.map((value): Completion => ({
        label: value,
        type: "enum",
        apply: value,
      })),
    };
  }

  // when the value is already inside quotes, apply the bare value and keep
  // the quotes; otherwise apply a quoted string
  const valueStart = valueNode !== null && valueNode.name !== ":" ? valueNode.from : context.pos;
  const prefix = doc.sliceString(valueStart, context.pos);
  const quoted = prefix.includes("\"");
  const from = quoted ? valueStart + 1 : valueStart;
  // nothing typed yet and the cursor is not inside quotes (e.g. right
  // after `:`) — wait for the user to start the value
  if (from === context.pos && !inString) {
    return null;
  }
  // when the typed value matches none of the valid ones, show them all so
  // the user can pick a correct option
  const typed = doc.sliceString(from, context.pos);
  const filter = enums.some(v => fuzzyMatch(v, typed));

  return {
    from,
    filter,
    options: enums.map((value): Completion => ({
      label: value,
      type: "enum",
      apply: quoted ? value : `"${value}"`,
    })),
  };
}

// suggest the valid keys of the enclosing object, applying to the property
// name (the cursor is in its value position)
function keyCorrections(context: CompletionContext, schema: JsonSchema, obj: SyntaxNode | null, nameNode: SyntaxNode | null): CompletionResult | null {
  if (!nameNode) {
    return null;
  }
  const level = objectSchema(context, schema, obj);
  const properties = level?.properties;
  if (!properties) {
    return null;
  }

  const existing = new Set<string>();
  if (obj) {
    for (let ch = obj.firstChild; ch; ch = ch.nextSibling) {
      if (ch.name === "Property") {
        const name = keyName(context.state, ch.firstChild);
        if (name) {
          existing.add(name);
        }
      }
    }
  }

  const options: Completion[] = [];
  for (const [name, child] of Object.entries(properties)) {
    if (existing.has(name)) {
      continue;
    }
    options.push({
      label: name,
      type: "property",
      detail: child.type,
    });
  }
  if (!options.length) {
    return null;
  }

  // replace the invalid property name, keeping its quotes
  return {
    from: nameNode.from + 1,
    to: nameNode.to - 1,
    filter: false,
    options,
  };
}

/**
 * Compute the positions of schema violations — property names that are not
 * part of the schema, and enum values that match no option — for rendering
 * as dashed-underlined annotations, like the UnoCSS Playground does for
 * its transformer highlight annotations.
 */
export function computeSchemaAnnotations(schema: JsonSchema, state: EditorState): SchemaAnnotation[] {
  const tree = ensureSyntaxTree(state, state.doc.length, 100) ?? syntaxTree(state);
  const root = tree.topNode.firstChild;
  if (!root || root.name !== "Object") {
    return [];
  }

  const annotations: SchemaAnnotation[] = [];
  collectObjectAnnotations(schema, state, root, annotations);
  return annotations;
}

function collectObjectAnnotations(schema: JsonSchema, state: EditorState, obj: SyntaxNode, annotations: SchemaAnnotation[]) {
  for (let ch = obj.firstChild; ch; ch = ch.nextSibling) {
    if (ch.name !== "Property") {
      continue;
    }

    const nameNode = ch.firstChild;
    const key = keyName(state, nameNode);
    const keySchema = key ? schema.properties?.[key] : undefined;
    if (!keySchema) {
      // the property name does not match the schema — mark the key
      if (nameNode) {
        annotations.push({ from: nameNode.from + 1, to: nameNode.to - 1 });
      }
      continue;
    }

    const valueNode = ch.lastChild;
    const enums = keySchema.enums;
    if (enums?.length && valueNode?.name === "String") {
      // mark complete values that match no option (empty values are still
      // being typed)
      const valueText = state.sliceDoc(valueNode.from, valueNode.to);
      const inner = valueText.startsWith("\"") && valueText.endsWith("\"")
        ? valueText.slice(1, -1)
        : valueText;
      if (inner && !enums.includes(inner)) {
        annotations.push({ from: valueNode.from + 1, to: valueNode.to - 1 });
      }
    } else if (keySchema.properties && valueNode?.name === "Object") {
      collectObjectAnnotations(keySchema, state, valueNode, annotations);
    }
  }
}
