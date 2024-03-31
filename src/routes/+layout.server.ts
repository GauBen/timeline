export const load = ({ request }) => {
  const acceptLanguage = request.headers.get("accept-language");
  const language = acceptLanguage ? acceptLanguage.split(",")[0] : "en-US";
  return { language };
};
