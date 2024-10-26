import { defineConfig } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		dts({
			include: ["src"],
			outDir: "dist",
			rollupTypes: true,
			strictOutput: true,
			pathsToAliases: false,
			bundledPackages: ["@prozilla-os/*"],
			tsconfigPath: "tsconfig.build.json",
		}),
	],
	build: {
		lib: {
			entry: resolve(__dirname, "src/main.ts"),
			formats: ["es"],
		},
		rollupOptions: {
			external: ["vite", "path", "fs", "typescript", /vite-plugin-/g, /@vitejs\/plugin-/g, "rollup", "@prozilla-os/core", "@prozilla-os/shared"],
			output: {
				assetFileNames: "assets/[name][extname]",
				chunkFileNames: "chunks/[name]-[hash].js",
				entryFileNames: "[name].js",
			},
		},
		sourcemap: true,
	},
});