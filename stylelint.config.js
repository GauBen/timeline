/** @type {import("stylelint").Config} */
export default {
  extends: [
    "stylelint-config-standard-scss",
    "stylelint-config-recess-order",
    "stylelint-config-html/svelte",
  ],
  rules: {
    "custom-property-empty-line-before": null,
  },
};
