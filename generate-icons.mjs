import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { deflateSync } from 'zlib'

const __dirname = dirname(fileURLToPath(import.meta.url))

function crc32(buf) {
  const table = []
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1)
    table[n] = c
  }
  let crc = 0xffffffff
  for (const b of buf) crc = table[(crc ^ b) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function uint32BE(n) {
  const b = Buffer.allocUnsafe(4)
  b.writeUInt32BE(n, 0)
  return b
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii')
  const len = uint32BE(data.length)
  const crcBuf = Buffer.concat([typeBytes, data])
  return Buffer.concat([len, typeBytes, data, uint32BE(crc32(crcBuf))])
}

function generatePNG(size) {
  const pixels = []

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const cx = size / 2, cy = size / 2
      const r = size / 2
      const radius = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
      const cornerRadius = size * 0.18

      // Rounded rectangle check
      const inRect = x >= 0 && x < size && y >= 0 && y < size
      const inCorner = (ax, ay) => Math.sqrt((x - ax) ** 2 + (y - ay) ** 2) > cornerRadius
      const isCorner = (x < cornerRadius && y < cornerRadius && inCorner(cornerRadius, cornerRadius)) ||
                       (x > size - cornerRadius && y < cornerRadius && inCorner(size - cornerRadius, cornerRadius)) ||
                       (x < cornerRadius && y > size - cornerRadius && inCorner(cornerRadius, size - cornerRadius)) ||
                       (x > size - cornerRadius && y > size - cornerRadius && inCorner(size - cornerRadius, size - cornerRadius))

      if (isCorner) {
        pixels.push(0xF5, 0xF0, 0xEB, 0) // transparent
        continue
      }

      // Gradient background: dark brown to light brown
      const t = (x + y) / (size * 2)
      const r1 = Math.round(0x6B + t * (0xC8 - 0x6B))
      const g1 = Math.round(0x4C + t * (0xA8 - 0x4C))
      const b1 = Math.round(0x2A + t * (0x82 - 0x2A))

      // Draw scale of justice icon
      const s = size
      const lw = Math.max(2, Math.round(s * 0.03)) // line width
      const topY = cy - s * 0.22
      const botY = cy + s * 0.26
      const barY = cy - s * 0.06
      const leftX = cx - s * 0.25
      const rightX = cx + s * 0.25
      const panR = s * 0.095
      const panY = barY + s * 0.16

      const isOnLine = (x1, y1, x2, y2, px, py, w) => {
        const dx = x2 - x1, dy = y2 - y1
        const len = Math.sqrt(dx * dx + dy * dy)
        if (len === 0) return false
        const t = ((px - x1) * dx + (py - y1) * dy) / (len * len)
        if (t < 0 || t > 1) return false
        const nearX = x1 + t * dx, nearY = y1 + t * dy
        return Math.sqrt((px - nearX) ** 2 + (py - nearY) ** 2) <= w
      }

      const isOnArc = (acx, acy, ar, px, py, w) => {
        const dist = Math.sqrt((px - acx) ** 2 + (py - acy) ** 2)
        if (Math.abs(dist - ar) > w) return false
        return py >= acy // bottom half
      }

      const isIcon =
        isOnLine(cx, topY, cx, botY, x, y, lw) || // vertical post
        isOnLine(leftX, barY, rightX, barY, x, y, lw) || // horizontal bar
        isOnLine(leftX, barY, leftX, panY - panR, x, y, lw) || // left chain
        isOnLine(rightX, barY, rightX, panY - panR, x, y, lw) || // right chain
        isOnLine(cx - s * 0.12, botY, cx + s * 0.12, botY, x, y, lw) || // base
        isOnArc(leftX, panY, panR, x, y, lw) ||  // left pan
        isOnArc(rightX, panY, panR, x, y, lw)   // right pan

      if (isIcon) {
        pixels.push(255, 255, 255, 230)
      } else {
        pixels.push(r1, g1, b1, 255)
      }
    }
  }

  // Build PNG
  const IHDR = Buffer.concat([
    uint32BE(size), uint32BE(size),
    Buffer.from([8, 6, 0, 0, 0]) // 8-bit RGBA
  ])

  // Raw image data with filter bytes
  const rawData = []
  for (let y = 0; y < size; y++) {
    rawData.push(0) // filter type: None
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4
      rawData.push(pixels[idx], pixels[idx + 1], pixels[idx + 2], pixels[idx + 3])
    }
  }

  const compressed = deflateSync(Buffer.from(rawData))

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), // PNG signature
    chunk('IHDR', IHDR),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

mkdirSync(join(__dirname, 'public/icons'), { recursive: true })
writeFileSync(join(__dirname, 'public/icons/icon-192.png'), generatePNG(192))
console.log('Generated icon-192.png (192x192)')
writeFileSync(join(__dirname, 'public/icons/icon-512.png'), generatePNG(512))
console.log('Generated icon-512.png (512x512)')
