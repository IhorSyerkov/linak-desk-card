import resolve from "rollup-plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";
import babel from "rollup-plugin-babel";
import serve from "rollup-plugin-serve";
import { terser } from "rollup-plugin-terser";
import json from '@rollup/plugin-json';
import image from "@rollup/plugin-image";

export default {
  input: ["src/linak-desk-card.ts"],
  output: {
    dir: "./dist",
    format: "es",
  },
  plugins: [
    resolve(),
    typescript(),
    json(),
    image(),
    babel({
      exclude: "node_modules/**",
    }),
    terser(),
    serve({
      contentBase: "./dist",
      host: "0.0.0.0",
      port: 5000,
      allowCrossOrigin: true,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    }),
  ],
};
