import { Database } from "bun:sqlite";

const db = new Database(":memory:");
console.log("bun:sqlite →", db.query("select 42 as answer").get());

const server = Bun.serve({ port: 3001, fetch: () => new Response("hello from Bun.serve") });
console.log("Bun.serve  →", await (await fetch("http://localhost:3001/")).text());
process.exit(0);
