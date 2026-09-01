import fs from "node:fs"
import YAML from "yaml"

const [basePath, overlayPath, outPath] = process.argv.slice(2)

const base = YAML.parse(fs.readFileSync(basePath, "utf8"))
const overlay = YAML.parse(fs.readFileSync(overlayPath, "utf8"))

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value)

const deepMerge = (target, patch) => {
  if (!isPlainObject(target) || !isPlainObject(patch)) return patch
  const merged = { ...target }
  for (const [key, value] of Object.entries(patch)) {
    merged[key] = key in target ? deepMerge(target[key], value) : value
  }
  return merged
}

base.configuration = deepMerge(base.configuration, overlay.configuration ?? {})

for (const patch of overlay.plugins ?? []) {
  const entry = base.plugins.find((plugin) => plugin.source === patch.source)
  if (!entry) {
    throw new Error(`quartz.config.yaml patches an unknown plugin: ${patch.source}`)
  }
  Object.assign(entry, patch)
}

fs.writeFileSync(outPath, YAML.stringify(base))
