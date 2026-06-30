#!/usr/bin/env node
// Guards three-forcegraph layoutTick against undefined state.layout.
// Fixed upstream in >=1.44.0; react-force-graph-3d@1.29 ships 1.43.x.
const fs = require('fs');
const path = require('path');

const NEEDLE  = '} else {\n          state.layout[isD3Sim';
const REPLACE = '} else if (state.layout) {\n          state.layout[isD3Sim';

function findFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    try {
      const stat = fs.statSync(filePath);
      if (stat && stat.isDirectory()) {
        results = results.concat(findFiles(filePath));
      } else {
        const normalizedPath = filePath.replace(/\\/g, '/');
        if (normalizedPath.endsWith('three-forcegraph/dist/three-forcegraph.mjs')) {
          results.push(filePath);
        }
      }
    } catch (e) {
      // Ignore inaccessible directories or symlinks
    }
  }
  return results;
}

const files = findFiles(path.join('node_modules', '.bun'));

let patched = 0;
for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  if (!src.includes(NEEDLE)) continue; // already patched or different version
  fs.writeFileSync(file, src.replace(NEEDLE, REPLACE));
  patched++;
  console.log('patched:', file);
}
if (!patched) console.log('three-forcegraph: no patch needed');
