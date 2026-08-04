import { readFile } from "node:fs/promises";
import { validateDataset } from "../lib/validation.js";

const dataset = JSON.parse(await readFile(new URL("../data/rentals.json", import.meta.url), "utf8"));
const result = validateDataset(dataset);

for (const warning of result.warnings) console.warn(`WARNING: ${warning}`);
for (const error of result.errors) console.error(`ERROR: ${error}`);

if (result.errors.length) process.exitCode = 1;
else console.log(`Validated ${dataset.rentals.length} rental records with ${result.warnings.length} review warning(s).`);
