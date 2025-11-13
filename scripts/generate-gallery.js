import { execSync } from "child_process"
import { fileURLToPath } from "url"
import fs from "fs"
import path from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const command = `find games/*/gallery -type f \\( -iname "*.png" -o -iname "*.gif" -o -iname "*.jpg" -o -iname "*.jpeg" \\)`
const output = execSync(command, { encoding: "utf-8" })

// Parse the output into a structured object
const files = output.trim().split("\n").filter(Boolean)
const galleries = {}

files.forEach((filePath) => {
  // Extract game ID and relative path
  // games/TTGDX/gallery/cover.png -> TTGDX, cover.png
  const match = filePath.match(/games\/([^/]+)\/gallery\/(.+)/)
  if (match) {
    const [, gameId, relativePath] = match
    if (relativePath === "cover.png") return // Skip cover images
    if (!galleries[gameId]) galleries[gameId] = []
    galleries[gameId].push(`/${relativePath}`)
  }
})

fs.writeFileSync(
  path.join(path.dirname(__dirname), "./public/image-gallery.json"),
  JSON.stringify(galleries).trim()
)

console.log(
  `\nGallery data generated for ${Object.keys(galleries).length} games!\n`
)
