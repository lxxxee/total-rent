import { cp, mkdir, rm } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const dist = new URL("../dist/", import.meta.url);
await rm(dist, { recursive: true, force: true });
await mkdir(new URL("data/", dist), { recursive: true });

for (const file of ["index.html", "app.js", "styles.css"]) await cp(new URL(file, root), new URL(file, dist));
for (const file of ["rentals.json", "pending-changes.json"]) await cp(new URL(`data/${file}`, root), new URL(`data/${file}`, dist));
console.log("Built private dashboard assets in dist/.");
