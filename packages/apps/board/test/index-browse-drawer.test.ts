import type { IndexBreadcrumb, IndexChildDirectory } from "@board/composables/indexPage";

import IndexBrowseDrawer from "@board/components/IndexBrowseDrawer.vue";
import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { createI18n } from "vue-i18n";
import { createMemoryHistory, createRouter } from "vue-router";

const directories: IndexChildDirectory[] = [
  {
    name: "51st",
    label: "51st",
    path: "/icpc/51st",
    contestCount: 20,
    latestStartTime: 1760000000,
  },
  {
    name: "50th",
    label: "50th",
    path: "/icpc/50th",
    contestCount: 19,
    latestStartTime: 1700000000,
  },
];

async function mountDrawer(options: {
  path?: string;
  breadcrumbs?: IndexBreadcrumb[];
} = {}) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", component: { template: "<div />" } },
      { path: "/:pathMatch(.*)*", component: { template: "<div />" } },
    ],
  });

  await router.push(options.path ?? "/icpc");
  await router.isReady();

  const i18n = createI18n({
    legacy: false,
    locale: "en",
    messages: {
      en: {
        common: { close: "Close" },
        index: {
          browse: "Browse",
          all_contests: "All Contests",
          sections: "Sections",
        },
      },
    },
  });

  const wrapper = mount(IndexBrowseDrawer, {
    attachTo: document.body,
    props: {
      directories,
      breadcrumbs: options.breadcrumbs,
    },
    global: {
      plugins: [router, i18n],
      stubs: {
        Teleport: true,
      },
    },
  });

  return { wrapper, router };
}

afterEach(() => {
  document.body.innerHTML = "";
  document.body.removeAttribute("style");
});

describe("indexBrowseDrawer.vue", () => {
  it("renders a browse trigger and keeps the drawer closed", async () => {
    const { wrapper } = await mountDrawer();

    const trigger = wrapper.get("[data-testid=\"index-browse-trigger\"]");
    expect(trigger.text()).toContain("Browse");
    expect(trigger.text()).toContain("2");
    expect(trigger.attributes("aria-expanded")).toBe("false");
    expect(wrapper.find("[role=\"dialog\"]").exists()).toBe(false);

    wrapper.unmount();
  });

  it("opens on click and lists the child directories", async () => {
    const { wrapper } = await mountDrawer();

    await wrapper.get("[data-testid=\"index-browse-trigger\"]").trigger("click");
    await flushPromises();

    const dialog = wrapper.get("[role=\"dialog\"]");
    expect(dialog.text()).toContain("Sections");
    expect(dialog.text()).toContain("51st");
    expect(dialog.text()).toContain("20");
    expect(dialog.text()).toContain("50th");
    expect(dialog.text()).toContain("19");
    expect(
      wrapper.get("[data-testid=\"index-browse-trigger\"]").attributes("aria-expanded"),
    ).toBe("true");

    wrapper.unmount();
  });

  it("closes on escape and restores focus to the trigger", async () => {
    const { wrapper } = await mountDrawer();
    const trigger = wrapper.get<HTMLButtonElement>("[data-testid=\"index-browse-trigger\"]");

    await trigger.trigger("click");
    await flushPromises();

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    await flushPromises();

    expect(wrapper.find("[role=\"dialog\"]").exists()).toBe(false);
    expect(document.activeElement).toBe(trigger.element);

    wrapper.unmount();
  });

  it("closes when the backdrop is clicked", async () => {
    const { wrapper } = await mountDrawer();

    await wrapper.get("[data-testid=\"index-browse-trigger\"]").trigger("click");
    await flushPromises();

    await wrapper.get("[data-testid=\"index-browse-backdrop\"]").trigger("click");
    await flushPromises();

    expect(wrapper.find("[role=\"dialog\"]").exists()).toBe(false);

    wrapper.unmount();
  });

  it("stays open after navigating to a directory with sections", async () => {
    const { wrapper, router } = await mountDrawer();

    await wrapper.get("[data-testid=\"index-browse-trigger\"]").trigger("click");
    await flushPromises();

    await wrapper.get("a[href=\"/icpc/51st\"]").trigger("click");
    await flushPromises();

    expect(router.currentRoute.value.path).toBe("/icpc/51st");
    expect(wrapper.find("[role=\"dialog\"]").exists()).toBe(true);
    // The clicked link is gone after the list re-renders, so focus stays in
    // the modal.
    expect(document.activeElement).toBe(wrapper.get("[role=\"dialog\"]").element);

    wrapper.unmount();
  });

  it("closes once the current directory has no more sections", async () => {
    const { wrapper } = await mountDrawer();

    await wrapper.get("[data-testid=\"index-browse-trigger\"]").trigger("click");
    await flushPromises();
    expect(wrapper.find("[role=\"dialog\"]").exists()).toBe(true);

    await wrapper.setProps({ directories: [] });
    await flushPromises();

    expect(wrapper.find("[role=\"dialog\"]").exists()).toBe(false);
    expect(wrapper.find("[data-testid=\"index-browse-trigger\"]").exists()).toBe(false);

    wrapper.unmount();
  });

  it("shows the breadcrumb trail inside the drawer", async () => {
    const { wrapper } = await mountDrawer({
      path: "/icpc/51st",
      breadcrumbs: [
        { label: "ICPC", path: "/icpc" },
        { label: "51st", path: "/icpc/51st" },
      ],
    });

    await wrapper.get("[data-testid=\"index-browse-trigger\"]").trigger("click");
    await flushPromises();

    const dialog = wrapper.get("[role=\"dialog\"]");
    expect(dialog.text()).toContain("All Contests");
    expect(dialog.text()).toContain("ICPC");
    expect(dialog.text()).toContain("51st");

    wrapper.unmount();
  });
});
