// scripts/patch-feral-blob.js
//
// Fixes feral-blob's "Only two keyframes currently supported with spring
// and inertia animations" crash. JellyBlobMascot's internal mood/bounce
// animations use type:"spring" (or "inertia") with multi-value keyframe
// arrays (e.g. y: [0, -19, -5, -9]) — Framer Motion 12 only allows exactly
// 2 keyframes for spring/inertia. Tween animations support arrays of any
// length and look visually equivalent for this kind of bounce curve, so we
// swap the animation type rather than touching the keyframe values.
//
// This only rewrites files inside node_modules/feral-blob, so it can't
// affect framer-motion/motion behavior anywhere else in the app. Run this
// once, then generate a durable patch with:
//   npx patch-package feral-blob
//
// Usage: node scripts/patch-feral-blob.js

const fs = require("fs");
const path = require("path");

const PACKAGE_DIR = path.join(process.cwd(), "node_modules", "feral-blob");

// Matches type:"spring" / type: 'spring' / type:"inertia" / type: 'inertia'
// in any quote style, replacing only the type value.
const SPRING_OR_INERTIA = /type\s*:\s*(["'])(spring|inertia)\1/g;

function walk(dir, onFile) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, onFile);
    } else if (entry.isFile() && /\.(js|mjs|cjs)$/.test(entry.name)) {
      onFile(fullPath);
    }
  }
}

function main() {
  if (!fs.existsSync(PACKAGE_DIR)) {
    console.error(
      `❌ Could not find ${PACKAGE_DIR}. Make sure "npm install" has been run first.`
    );
    process.exit(1);
  }

  let filesChanged = 0;
  let replacementsMade = 0;

  walk(PACKAGE_DIR, (filePath) => {
    const original = fs.readFileSync(filePath, "utf8");
    let replacementsInFile = 0;

    const updated = original.replace(SPRING_OR_INERTIA, (match, quote) => {
      replacementsInFile++;
      return `type:${quote}tween${quote}`;
    });

    if (replacementsInFile > 0) {
      fs.writeFileSync(filePath, updated, "utf8");
      filesChanged++;
      replacementsMade += replacementsInFile;
      console.log(
        `✅ Patched ${replacementsInFile} occurrence(s) in ${path.relative(process.cwd(), filePath)}`
      );
    }
  });

  if (replacementsMade === 0) {
    console.warn(
      "⚠️  No spring/inertia occurrences found. The package structure may " +
      "have changed, or the bundle uses a minified variable name instead " +
      "of the string \"spring\"/\"inertia\" directly. Open the stack trace's " +
      "file (from the runtime error) and search for \"spring\" manually."
    );
  } else {
    console.log(
      `\n🎉 Done. Patched ${replacementsMade} occurrence(s) across ${filesChanged} file(s).\n` +
      `Next step: run "npx patch-package feral-blob" to save this as a ` +
      `durable patch that reapplies automatically on every future "npm install".`
    );
  }
}

main();