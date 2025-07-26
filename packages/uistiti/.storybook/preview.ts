import type { Preview } from "@storybook/sveltekit";

import "modern-normalize/modern-normalize.css";
import "uistiti/global.css";
import "uistiti/reset.css";
import "uistiti/utils.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
