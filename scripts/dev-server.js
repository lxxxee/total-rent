import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";

const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json" };
createServer(async (request, response) => {
  const path = request.url === "/" ? "/index.html" : request.url;
  try {
    const file = await readFile(join(process.cwd(), path));
    response.writeHead(200, { "Content-Type": types[extname(path)] || "application/octet-stream" });
    response.end(file);
  } catch {
    response.writeHead(404); response.end("Not found");
  }
}).listen(3000, () => console.log("Total Rent: http://localhost:3000"));
