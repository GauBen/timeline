import { Temporal } from "@js-temporal/polyfill";

export const load = ({ data, url }) => {
  const eventInCreation = url.searchParams.get("new");

  return {
    ...data,
    eventInCreation: eventInCreation
      ? Temporal.PlainDateTime.from(eventInCreation)
      : undefined,
  };
};
