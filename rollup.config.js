// Import rollup plugins

import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser'


export default {
    plugins: [
        // Resolve bare module specifiers to relative paths
        resolve(),
        // Minify JS
        terser(),


    ],
    input: 'src/index.js',
    output: {
        file: 'dist/24h-rings-clock-card.js',
        format: 'es',
        compact: true,
        sourcemap: false,
    },
    preserveEntrySignatures: 'strict',
};