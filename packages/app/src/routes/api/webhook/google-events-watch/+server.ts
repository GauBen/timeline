export const POST = async ({ request }) => {
  console.log(request.headers);
  return new Response("OK");
};
