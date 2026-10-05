// Compiles app/globals.css with the same Tailwind + Lightning CSS steps as the production build
// and reports whether the given selectors survive. Usage: node scripts/css-check.mjs ak-heartbeat ak-marquee
import fs from 'node:fs'
import postcss from 'postcss'
import tailwind from '@tailwindcss/postcss'
import { transform } from 'lightningcss'

const src = fs.readFileSync('app/globals.css', 'utf8')
const out = await postcss([tailwind({ optimize: process.env.OPT === '1' })]).process(src, { from: 'app/globals.css' })
const min = transform({ filename: 'globals.css', code: Buffer.from(out.css), minify: true }).code.toString()
for (const name of process.argv.slice(2)) {
  console.log(name, 'tailwind:', out.css.includes(name), 'minified:', min.includes(name))
}
