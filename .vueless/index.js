// Vite version

// import type { Config } from "vueless/types";

// const modules = import.meta.glob("./*.config.ts", { eager: true });

// const components = {};

// for (const path in modules) {
//   const mod = modules[path];
//   const match = path.match(/\.\/(.*)\.config\.ts$/);
//   const name = match?.[1];
//   if (name) {
//     components[name] = mod.default;
//   }
// }

// export { components };

// NodeJS version

import fs from "fs";
import path from "path";
import { pathToFileURL, fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configDir = path.resolve(__dirname);
const files = fs.readdirSync(configDir).filter((f) => f.endsWith(".config.ts"));

const components = {};

for (const file of files) {
  const name = file.replace(".config.ts", "");
  const filePath = path.join(configDir, file);
  const module = await import(pathToFileURL(filePath).href);
  components[name] = module.default;
}

export { components };
