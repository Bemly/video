const cfg: string = await Deno.readTextFile("./config.json");
console.log("Deno.readTextFile →", JSON.parse(cfg));

const server = Deno.serve({ port: 8123, onListen() {} }, (_req: Request) => new Response(cfg));
console.log("Deno.serve →", await (await fetch("http://localhost:8123")).text());
Deno.exit(0);
