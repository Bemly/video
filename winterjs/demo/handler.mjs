export default {
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/api/hello") return new Response("hello from winterjs\n");
    return new Response(JSON.stringify({ path: url.pathname }) + "\n", {
      headers: { "content-type": "application/json" },
    });
  },
};
