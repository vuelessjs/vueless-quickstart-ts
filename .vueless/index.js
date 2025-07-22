import UHeader from "./UHeader.config";

export const components = {
  UHeader,
};

// TODO: discuss how to implement auto imports for config files.

// import esbuild from "esbuild";
// import fs from "fs";
// import path from "path";
// import url from "node:url";
// import process from "node:process";

// import { isCSR, isSSR } from "vueless";

// let components = {};

// function getUrl() {
//   try {
//     return window.url;
//   } catch {
//     return url;
//   }
// }

// async function buildTSFile(entryPath, configOutFile) {
//   await esbuild.build({
//     entryPoints: [entryPath],
//     outfile: configOutFile,
//     bundle: true,
//     platform: "node",
//     format: "esm",
//     target: "ESNext",
//     loader: { ".ts": "ts" },
//   });
// }

// if (isSSR) {
//   const url = getUrl();

//   const __dirname = `${process.cwd()}/.vueless`;

//   const configDir = path.resolve(__dirname);
//   const files = fs.readdirSync(configDir);

//   for (const file of files) {
//     const name = file.replace(".config.ts", "");
//     const filePath = path.join(configDir, file);
//     const module = await import(url.pathToFileURL(filePath).href);
//     components[name] = module.default;
//   }
// }

// if (isCSR) {
//   const modules = import.meta.glob("./*.config.ts", { eager: true });

//   for (const path in modules) {
//     const mod = modules[path];
//     const match = path.match(/\.\/(.*)\.config\.ts$/);
//     const name = match?.[1];
//     if (name) {
//       components[name] = mod.default;
//     }
//   }
// }

// console.log(components);

// export { components };
