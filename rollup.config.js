// Import rollup plugins

import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser'
import { babel } from "@rollup/plugin-babel";
import summary from "rollup-plugin-summary";



export default {
    plugins: [
        babel({
            babelHelpers: 'bundled',
            exclude: "node_modules/**",
        }),
        // Resolve bare module specifiers to relative paths
        resolve(),
        // Minify JS
        terser({
            compress: {
                unsafe: true,
                // An extra pass can squeeze out an extra byte or two.
                passes: 2,
            },
            output: {
                // some preserves @license and @preserve comments
                comments: 'some',
                inline_script: false,
            },
            ecma: 2021,
            module: true,
            warnings: true,
            mangle: true,
            keep_fnames: true,
            keep_classnames: true
        }),
        summary()
    ],
    input: 'src/index.js',
    output: {
        file: 'dist/24h-rings-clock-card.js',
        format: 'iife',
        compact: true,
        sourcemap: false,
    },
    preserveEntrySignatures: 'strict',
};