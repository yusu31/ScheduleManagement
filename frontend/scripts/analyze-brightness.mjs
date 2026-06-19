import sharp from 'sharp'
import { readdir, stat } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const THEMES_DIR = path.join(__dirname, '..', 'public', 'themes')
const DARK_THRESHOLD = 120  // 0-255, この値以下なら dark: true

async function getAverageLuminance(imagePath) {
  try {
    const image = sharp(imagePath)
    const meta = await image.metadata()

    // SVGはスキップ
    if (meta.format === 'svg') return null

    const { data, info } = await image
      .resize(80, 80, { fit: 'cover', position: 'centre' })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })

    let total = 0
    const pixels = info.width * info.height
    for (let i = 0; i < data.length; i += 3) {
      const r = data[i], g = data[i + 1], b = data[i + 2]
      // ITU-R BT.709 luminance
      total += 0.2126 * r + 0.7152 * g + 0.0722 * b
    }
    return Math.round(total / pixels)
  } catch {
    return null
  }
}

async function scanDir(dir, base = '') {
  const results = []
  const entries = await readdir(dir)
  for (const entry of entries) {
    const full = path.join(dir, entry)
    const s = await stat(full)
    if (s.isDirectory()) {
      results.push(...await scanDir(full, path.join(base, entry)))
    } else if (/\.(jpg|jpeg|png|webp|gif)$/i.test(entry)) {
      results.push({ file: path.join(base, entry), full })
    }
  }
  return results
}

const files = await scanDir(THEMES_DIR)
const rows = []

for (const { file, full } of files) {
  const lum = await getAverageLuminance(full)
  if (lum === null) {
    rows.push({ file, lum: 'SVG/skip', dark: null })
  } else {
    rows.push({ file, lum, dark: lum < DARK_THRESHOLD })
  }
}

// 結果出力
console.log('\n=== テーマ画像 輝度解析結果 ===')
console.log(`(閾値: ${DARK_THRESHOLD} 以下 → dark: true)\n`)
for (const r of rows.sort((a, b) => (a.lum ?? 999) - (b.lum ?? 999))) {
  const flag = r.dark === true ? '🌙 dark: true ' : r.dark === false ? '☀️  --------- ' : '⬜ SVG skip  '
  console.log(`${flag}  lum=${String(r.lum).padStart(3)}  ${r.file}`)
}

// ThemeContext.tsx 用のサマリ
const darkFiles = rows.filter(r => r.dark === true).map(r => r.file)
console.log('\n=== dark: true にすべきファイル ===')
darkFiles.forEach(f => console.log('  ' + f))
