import { z } from "zod";

export const timezones = new Set(Intl.supportedValuesOf("timeZone"));
export const TimezoneSchema = z.string().refine((tz) => timezones.has(tz));
