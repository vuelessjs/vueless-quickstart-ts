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

// Inline plugin configurations
const vueI18Config = {
  defaultSFCLang: "yaml",
  strictMessage: false,
  runtimeOnly: false,
};

const buildVisualizerConfig = {
  template: "treemap",
  gzipSize: true,
  brotliSize: true,
  filename: "report.html",
  emitFile: false,
};

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
      VueI18n(vueI18Config),

      // Build visualization (dev/build analysis)
      BuildVisualizer(buildVisualizerConfig),
    ].filter(Boolean),

    server: {
      port: parseInt(process.env.VITE_DEV_PORT) || 4100,
      host: process.env.VITE_DEV_HOST || "localhost",
      open: process.env.VITE_AUTO_OPEN === "true",
    },

    preview: {
      port: parseInt(process.env.VITE_PREVIEW_PORT) || 4200,
    },

    resolve: {
      extensions: [".vue", ".js", ".ts", ".jsx", ".tsx"],
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "~": path.resolve(__dirname, "."),
        ...getModuleAliases(),
      },
    },

    build: {
      sourcemap: isDev || process.env.VITE_BUILD_SOURCEMAP === "true",
      outDir: path.resolve(__dirname, process.env.VITE_OUTPUT_DIR || "dist"),

      // Minification
      minify: isProd ? "terser" : false,

      // Chunk size warning limit
      chunkSizeWarningLimit: 1000,
    },

    // Dependency optimization
    optimizeDeps: {
      include: [
        "vue",
        "vue-router",
        "pinia",
        "date-fns",
        "date-fns-tz",
        "date-fns/locale",
        "@vuelidate/core",
        "@vuelidate/validators",
      ],
    },

    // Define global constants
    define: {
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
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
