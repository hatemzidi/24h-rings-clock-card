import resolve from '@rollup/plugin-node-resolve';
import {babel} from '@rollup/plugin-babel';
import serve from "rollup-plugin-serve";
import terser from '@rollup/plugin-terser'
import {litCss} from 'rollup-plugin-css-lit'

export default {
    input: 'src/index.js',
    output: {
        file: 'dist/24h-rings-clock-card.js',
        format: 'iife',
        //format: "es",
        compact: true,
        sourcemap: false,
    },
    plugins: [
        litCss({minify: true, inline: {assets: {}}}),
        babel({
            exclude: "node_modules/**",
        }),
        resolve(),
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
