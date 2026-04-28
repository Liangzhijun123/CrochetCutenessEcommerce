#!/usr/bin/env node
// Fixes pnpm hard-link deduplication issue on macOS where numbered variants
// (e.g. "index 2.js") are created but the base file ("index.js") is missing.
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const pnpmDir = path.join(__dirname, '..', 'node_modules', '.pnpm')
if (!fs.existsSync(pnpmDir)) process.exit(0)

let fixed = 0
function scan(dir) {
  let entries
  try { entries = fs.readdirSync(dir) } catch { return }
  for (const entry of entries) {
    const full = path.join(dir, entry)
    let stat
    try { stat = fs.statSync(full) } catch { continue }
    if (stat.isDirectory()) {
      scan(full)
    } else if (entry.match(/ 2\.(js|mjs|cjs)$/)) {
      const base = path.join(dir, entry.replace(/ 2(\.(js|mjs|cjs))$/, '$1'))
      if (!fs.existsSync(base)) {
        try {
          fs.copyFileSync(full, base)
          fixed++
        } catch {}
      }
    }
  }
}

scan(pnpmDir)
if (fixed > 0) console.log(`[fix-pnpm-links] Fixed ${fixed} missing module(s).`)
