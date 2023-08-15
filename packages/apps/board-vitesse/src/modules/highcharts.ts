import { type UserModule } from "~/types";

export const install: UserModule = ({ isClient, app, router }) => {
  if (!isClient) {
    return;
  }

  router.isReady().then(async () => {
    const HighchartsVue = await import("highcharts-vue");

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    app.use(HighchartsVue);
  }).catch(() => {});
};
