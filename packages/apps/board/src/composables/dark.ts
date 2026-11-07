// these APIs are auto-imported from @vueuse/core
export const isDark = useDark();
export const toggleDark = useToggle(isDark);
export const preferredDark = usePreferredDark();

// Highcharts >=13 picks its palette from `prefers-color-scheme` by default,
// which ignores the app's own theme toggle. The `highcharts-light` /
// `highcharts-dark` classes on an ancestor pin the chart palette to the app
// theme instead.
if (typeof document !== "undefined") {
  watchEffect(() => {
    document.documentElement.classList.toggle("highcharts-dark", isDark.value);
    document.documentElement.classList.toggle("highcharts-light", !isDark.value);
  });
}
