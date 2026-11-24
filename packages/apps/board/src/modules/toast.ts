import type { UserModule } from "@board/types";
import ToastPlugin from "vue-toast-notification";

import "vue-toast-notification/dist/theme-sugar.css";
import "../styles/toast.css";

export const install: UserModule = ({ app }) => {
  app.use(ToastPlugin, {
    position: "bottom-right",
  });
};
