import { setLanguageTag } from "$paraglide/runtime.js";

export const load = ({ data }) => {
  setLanguageTag(data.language);
};
