import { mkdir, rm, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const dist = new URL("../dist/", import.meta.url);
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

await writeFile(new URL("index.html", dist), `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <title>Total Rent</title>
  <style>
    :root { color-scheme: dark; font-family: ui-sans-serif, system-ui, sans-serif; }
    body { min-height: 100vh; margin: 0; display: grid; place-items: center; background: #070b12; color: #e8eef8; }
    main { width: min(88vw, 32rem); padding: 2rem; border: 1px solid #263247; border-radius: 1.5rem; background: #0d1420; box-shadow: 0 24px 80px #0008; }
    .status { color: #60e6a8; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
    h1 { margin: .6rem 0; font-size: clamp(2rem, 9vw, 3.5rem); }
    p { color: #aab7ca; line-height: 1.6; }
    a { display: inline-block; margin-top: 1rem; color: #071019; background: #60e6a8; padding: .8rem 1rem; border-radius: .8rem; font-weight: 700; text-decoration: none; }
  </style>
</head>
<body><main>
  <div class="status">LINE service online</div>
  <h1>Total Rent</h1>
  <p>Financial records are private and are not published on this website. Sign in to the private GitHub repository to manage approved data, or use the Total Rent LINE account for summaries.</p>
  <a href="https://github.com/lxxxee/total-rent">Open private repository</a>
</main></body>
</html>`);

console.log("Built public status page without rental data.");
