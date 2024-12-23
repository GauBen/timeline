import type { Preview } from "@storybook/svelte";

import "modern-normalize/modern-normalize.css";
import "uistiti/global.css";

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