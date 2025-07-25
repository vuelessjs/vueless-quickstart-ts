import { defineConfig, loadEnv } from "vite";
import path from "node:path";
import fs from "node:fs";

/* Vite plugins */
import Vue from "@vitejs/plugin-vue";
import Yaml from "@modyfi/vite-plugin-yaml";
import Eslint from "vite-plugin-eslint";
import VueI18n from "@intlify/unplugin-vue-i18n/vite";
import { visualizer as BuildVisualizer } from "rollup-plugin-visualizer";
import { Vueless, UnpluginComponents, TailwindCSS } from "vueless/plugin-vite";

/* Vite config */
export default ({ mode }) => {
  // Load environment variables
  process.env = {
    ...process.env,
    ...loadEnv(mode, process.cwd()),
  };

  const isDev = mode === "development";
  const isProd = mode === "production";

  return defineConfig({
    plugins: [
      Vue(),
      Yaml(),
      Eslint({
        failOnError: isProd,
        failOnWarning: isProd,
      }),
      TailwindCSS(),
      Vueless(),
      UnpluginComponents(),
      VueI18n({
        defaultSFCLang: "yaml",
        strictMessage: false,
        runtimeOnly: false,
      }),

      BuildVisualizer({
        template: "treemap",
        gzipSize: true,
        brotliSize: true,
        filename: "report.html",
        emitFile: false,
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "~": path.resolve(__dirname, "."),
        ...getModuleAliases(),
      },
    },
    build: {
      sourcemap: false,
      outDir: path.resolve(__dirname, process.env.VITE_OUTPUT_DIR || "dist"),
    },
    optimizeDeps: {
      include: [
        "vue",
        "vue-router",
        "pinia",
        "@vuelidate/core",
        "@vuelidate/validators",
      ],
    },
  });
};

/**
 * Generate vite aliases for modules.
 * Converts: `./src/modules/Payments` into `#Payments`.
 * @returns {object} Module aliases object
 */
function getModuleAliases() {
  const srcDir = path.resolve(__dirname, "./src/modules");

  // Check if modules directory exists
  if (!fs.existsSync(srcDir)) {
    return {};
  }

  const folders = fs.readdirSync(srcDir).filter((name) => {
    const fullPath = path.join(srcDir, name);

    return fs.statSync(fullPath).isDirectory();
  });

  return folders.reduce((acc, folderName) => {
    acc[`#${folderName}`] = path.join(srcDir, folderName);

    return acc;
  }, {});
}
