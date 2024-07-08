import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

export const config = dotenv.config()
export const outDir = path.join(process.cwd(), process.env.OUT_DIR || '')
export const port = process.env.PORT || '8010'
export const lrPort = Number(process.env.LR_PORT || '35729')
export const isDev = process.env.DEV === '1'
export const isVerbose = process.env.VERBOSE === '1'
export const isLR = process.env.LR === '1'

export let build: string
try {
  build = fs.readFileSync('./BUILD', 'utf8').trim()
  console.log(`Build: ${build}`)
} catch (err) {
  console.error(err)
  throw err
}
