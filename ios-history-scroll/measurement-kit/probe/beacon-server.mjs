import http from "node:http";
import fs from "node:fs";
const out = process.argv[2];
http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") { res.end(); return; }
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => { fs.appendFileSync(out, body + "\n"); res.end("ok"); });
}).listen(47999, "127.0.0.1");
