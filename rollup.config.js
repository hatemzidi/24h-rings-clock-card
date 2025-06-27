// Import rollup plugins

import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser'
import { babel } from "@rollup/plugin-babel";



export default {
    plugins: [
        babel({
            babelHelpers: 'bundled',
            exclude: "node_modules/**",
        }),
        // Resolve bare module specifiers to relative paths
        resolve(),
        // Minify JS
        terser(),
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