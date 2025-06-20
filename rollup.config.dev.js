import resolve from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';
import serve from "rollup-plugin-serve";
import terser from '@rollup/plugin-terser'
import json from '@rollup/plugin-json';

export default {
    input: 'src/index.js',
    output: {
        file: 'dist/24h-rings-clock-card.js',
        format: "es",
        compact: true,
        sourcemap: false,
    },
    plugins: [
        resolve(),
        json(),
        babel({
            exclude: "node_modules/**",
        }),
        terser(),
        serve({
            contentBase: "./dist",
            host: "0.0.0.0",
            port: 5555,
            allowCrossOrigin: true,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
        }),
    ],
};
