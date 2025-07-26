export const match = (param) => {
  if (param.length === 0) return true;
  const matches = param.match(
    /^(?<year>\d{4})(?:-(?<month>\d\d)(?:-(?<day>\d\d))?)?$/,
  );
  if (!matches) return false;

  try {
    if (matches.groups?.day) Temporal.PlainDate.from(param);
    else if (matches.groups?.month) Temporal.PlainYearMonth.from(param);

    return true;
  } catch {
    return false;
  }
};
