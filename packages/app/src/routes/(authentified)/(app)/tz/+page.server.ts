export const load = async ({ parent }) => {
  const { language } = await parent();

  return {
    timezones: Intl.supportedValuesOf("timeZone"),
    // @ts-expect-error Non-standard API
    guess: new Intl.Locale(language).timeZones?.[0] as string | undefined,
  };
};
