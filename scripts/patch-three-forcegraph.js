#!/usr/bin/env node
// Guards three-forcegraph layoutTick against undefined state.layout.
// Fixed upstream in >=1.44.0; react-force-graph-3d@1.29 ships 1.43.x.
const { execSync } = require('child_process');
const fs = require('fs');

const NEEDLE  = '} else {\n          state.layout[isD3Sim';
const REPLACE = '} else if (state.layout) {\n          state.layout[isD3Sim';

const files = execSync(
  'find node_modules/.bun -path "*/three-forcegraph/dist/three-forcegraph.mjs" 2>/dev/null',
  { encoding: 'utf8' }
).trim().split('\n').filter(Boolean);

let patched = 0;
for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  if (!src.includes(NEEDLE)) continue; // already patched or different version
  fs.writeFileSync(file, src.replace(NEEDLE, REPLACE));
  patched++;
  console.log('patched:', file);
}
if (!patched) console.log('three-forcegraph: no patch needed');
