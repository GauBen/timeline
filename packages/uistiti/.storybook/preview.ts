import type { Preview } from "@storybook/sveltekit";

import "uistiti/css";

const preview: Preview = {
  tags: ["autodocs"],
  parameters: {
    docs: {
      codePanel: true,
    },
  },
};

export default preview;
