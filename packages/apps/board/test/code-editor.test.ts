import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import CodeEditor from "../src/components/CodeEditor.vue";
import { runtimeConfigAnnotations } from "../src/pages/custom/runtimeConfigSchema";

const configText = `{
  "pageType": "contest",
  "component": "board",
  "dataSource": "/data/contest.json"
}`;

describe("codeEditor.vue", () => {
  it("renders the model value as editor content", () => {
    const wrapper = mount(CodeEditor, {
      props: { modelValue: configText },
      attachTo: document.body,
    });

    expect(wrapper.find(".cm-editor").exists()).toBe(true);
    expect(wrapper.find(".cm-content").text()).toContain("pageType");
    expect(wrapper.find(".cm-content").text()).toContain("/data/contest.json");

    wrapper.unmount();
  });

  it("updates the editor content when the model value changes externally", async () => {
    const wrapper = mount(CodeEditor, {
      props: { modelValue: configText },
      attachTo: document.body,
    });

    await wrapper.setProps({ modelValue: `{\n  "pageType": "custom"\n}` });

    expect(wrapper.find(".cm-content").text()).toContain("custom");
    expect(wrapper.find(".cm-content").text()).not.toContain("dataSource");

    wrapper.unmount();
  });

  it("renders dashed marks for schema violations", async () => {
    const wrapper = mount(CodeEditor, {
      props: {
        modelValue: `{\n  "pageType": "board"\n}`,
        getAnnotations: runtimeConfigAnnotations,
      },
      attachTo: document.body,
    });

    // annotations are debounced by 200ms
    await new Promise(resolve => setTimeout(resolve, 400));

    const marks = wrapper.findAll(".highlighted");
    expect(marks.length).toBe(1);
    expect(marks[0]!.text()).toBe("board");

    wrapper.unmount();
  });

  it("does not render marks for a valid config", async () => {
    const wrapper = mount(CodeEditor, {
      props: {
        modelValue: `{\n  "pageType": "contest"\n}`,
        getAnnotations: runtimeConfigAnnotations,
      },
      attachTo: document.body,
    });

    await new Promise(resolve => setTimeout(resolve, 400));

    expect(wrapper.findAll(".highlighted")).toEqual([]);

    wrapper.unmount();
  });
});
