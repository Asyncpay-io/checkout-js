import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
export default {
  input: "src/index.ts",
  plugins: [typescript(), terser()],
  output: [
    {
      file: "dist/bundle.js",
      format: "cjs",
    },
  ],
};
