import { getBabelOutputPlugin } from "@rollup/plugin-babel";
import terser from "@rollup/plugin-terser";
export default {
  input: "src/index.js",
  plugins: [
    getBabelOutputPlugin({
      presets: ["@babel/preset-env"],
    }),
    terser(),
  ],
  output: [
    {
      file: "dist/bundle.js",
      format: "cjs",
    },
  ],
};
