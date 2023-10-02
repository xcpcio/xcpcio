import ToastPlugin from "vue-toast-notification";
import "vue-toast-notification/dist/theme-sugar.css";

import { type UserModule } from "~/types";

export const install: UserModule = ({ app }) => {
  app.use(ToastPlugin, {
    position: "bottom-right",
  });
};
