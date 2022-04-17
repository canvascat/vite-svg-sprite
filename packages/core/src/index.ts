import type { Plugin } from 'vite'
import type { OptimizedSvg, OptimizeOptions } from 'svgo'
import type {
  ViteSvgSpriteOptions,
  FileStats,
  ModuleCodeOptions,
  OrArray,
} from './typing'
import fg from 'fast-glob'
import type FastGlob from 'fast-glob'
import getEtag from 'etag'
import cors from 'cors'
import { readFile } from 'fs/promises'
import { extname } from 'path'
import SVGCompiler from 'svg-baker'
import { optimize } from 'svgo'
import { normalizePath } from 'vite'
import {
  SVG_DOM_ID,
  SVG_ICONS_CLIENT,
  SVG_SPRITE_REGISTER_NAME,
  XMLNS,
  XMLNS_LINK,
} from './constants'

export * from './typing'

function normalizeOptions(
  options: OrArray<ViteSvgSpriteOptions>,
): ModuleCodeOptions[] {
  if (!Array.isArray(options)) options = [options]

  return options.map(
    ({ svgoOptions = true, symbolId = '[name]', iconDirs }) => {
      const optimizeOptions = svgoOptions === true ? {} : svgoOptions
      if (!Array.isArray(iconDirs)) iconDirs = [iconDirs]
      const fastGlobOptions = iconDirs.map<FastGlob.Options>((cwd) =>
        typeof cwd === 'string' ? { cwd } : cwd,
      )
      let createSymbolId: (id: string) => string
      if (typeof symbolId === 'string') {
        if (!symbolId.includes('[name]')) {
          throw new Error('SymbolId must contain [name] string!')
        }
        createSymbolId = (id: string) => createSymbolIdFn(id, symbolId)
      } else {
        createSymbolId = symbolId
      }
      return { fastGlobOptions, optimizeOptions, createSymbolId }
    },
  )
}

export function createSvgSpritePlugin(
  opt: ViteSvgSpriteOptions | ViteSvgSpriteOptions[],
): Plugin {
  const cache = new Map<string, FileStats>()

  let isBuild = false
  const options = normalizeOptions(opt)

  return {
    name: 'vite:svg-sprite',
    configResolved(resolvedConfig) {
      isBuild = resolvedConfig.command === 'build'
    },
    resolveId(id) {
      return [SVG_SPRITE_REGISTER_NAME, SVG_ICONS_CLIENT].includes(id)
        ? id
        : null
    },

    async load(id, ssr) {
      if (!isBuild && !ssr) return null

      const isRegister = id.endsWith(SVG_SPRITE_REGISTER_NAME)
      const isClient = id.endsWith(SVG_ICONS_CLIENT)

      if (ssr && !isBuild && (isRegister || isClient)) {
        return `export default {}`
      }

      const { code, idSet } = await createModuleCode(cache, options)
      if (isRegister) {
        return code
      }
      if (isClient) {
        return idSet
      }
    },
    configureServer: ({ middlewares }) => {
      middlewares.use(cors({ origin: '*' }))
      middlewares.use(async (req, res, next) => {
        const url = normalizePath(req.url!)

        const registerId = `/@id/${SVG_SPRITE_REGISTER_NAME}`
        const clientId = `/@id/${SVG_ICONS_CLIENT}`
        if ([clientId, registerId].some((item) => url.endsWith(item))) {
          res.setHeader('Content-Type', 'application/javascript')
          res.setHeader('Cache-Control', 'no-cache')
          const { code, idSet } = await createModuleCode(cache, options)
          const content = url.endsWith(registerId) ? code : idSet

          res.setHeader('Etag', getEtag(content, { weak: true }))
          res.statusCode = 200
          res.end(content)
        } else {
          next()
        }
      })
    },
  }
}

async function createModuleCode(
  cache: Map<string, FileStats>,
  options: ModuleCodeOptions[],
) {
  const { insertHtml, idSet } = await compilerSprite(cache, options)

  // const xmlns = `xmlns="${XMLNS}"`
  // const xmlnsLink = `xmlns:xlink="${XMLNS_LINK}"`
  // const html = insertHtml
  //   .replace(new RegExp(xmlns, 'g'), '')
  //   .replace(new RegExp(xmlnsLink, 'g'), '')

  const code = `
       if (typeof window !== 'undefined') {
         function loadSvg() {
           var body = document.body;
           var svgDom = document.getElementById('${SVG_DOM_ID}');
           if(!svgDom) {
             svgDom = document.createElementNS('${XMLNS}', 'svg');
             svgDom.style.position = 'absolute';
             svgDom.style.width = '0';
             svgDom.style.height = '0';
             svgDom.id = '${SVG_DOM_ID}';
             svgDom.setAttribute('xmlns','${XMLNS}');
             svgDom.setAttribute('xmlns:link','${XMLNS_LINK}');
           }
           svgDom.innerHTML = ${JSON.stringify(insertHtml)};
           body.insertBefore(svgDom, body.firstChild);
         }
         if(document.readyState === 'loading') {
           document.addEventListener('DOMContentLoaded', loadSvg);
         } else {
           loadSvg()
         }
      }
        `
  return {
    code: `${code}\nexport default {}`,
    idSet: `export default ${JSON.stringify(Array.from(idSet))}`,
  }
}

/**
 * Preload all sprite in advance
 * @param cache
 * @param options
 */
async function compilerSprite(
  cache: Map<string, FileStats>,
  options: ModuleCodeOptions[],
) {
  const result = { cache, insertHtml: '', idSet: new Set<string>() }

  for (const opt of options) {
    const { fastGlobOptions } = opt
    for (const fastGlobOpt of fastGlobOptions) {
      const svgFilsStats = fg.sync('**/*.svg', {
        ...fastGlobOpt,
        stats: true,
        absolute: true,
      })

      for (const entry of svgFilsStats) {
        const { path, stats: { mtimeMs } = {} } = entry
        const cacheStat = cache.get(path)
        let svgSymbol
        let symbolId
        let relativeName = ''

        const getSymbol = async () => {
          relativeName = normalizePath(path).replace(
            normalizePath(fastGlobOpt.cwd + '/'),
            '',
          )
          symbolId = opt.createSymbolId(relativeName)
          svgSymbol = await compilerIcon(path, symbolId, opt.optimizeOptions)
          result.idSet.add(symbolId)
        }

        if (cacheStat) {
          if (cacheStat.mtimeMs !== mtimeMs) {
            await getSymbol()
          } else {
            svgSymbol = cacheStat.code
            symbolId = cacheStat.symbolId
            symbolId && result.idSet.add(symbolId)
          }
        } else {
          await getSymbol()
        }

        svgSymbol &&
          cache.set(path, {
            mtimeMs,
            relativeName,
            code: svgSymbol,
            symbolId,
          })
        result.insertHtml += `${svgSymbol || ''}`
      }
    }
  }
  return result
}

async function compilerIcon(
  file: string,
  symbolId: string,
  svgOptions: OptimizeOptions | false,
): Promise<string | null> {
  if (!file) {
    return null
  }

  let content = await readFile(file, 'utf-8')

  if (svgOptions) {
    const { data } = optimize(content, svgOptions) as OptimizedSvg
    content = data || content
  }

  // fix cannot change svg color  by  parent node problem
  // content = content.replace(/stroke="[a-zA-Z#0-9]*"/, 'stroke="currentColor"')
  const svgSymbol = await new SVGCompiler().addSymbol({
    id: symbolId,
    content,
    path: file,
  })
  return svgSymbol.render()
}

function createSymbolIdFn(name: string, symbolId?: string) {
  if (!symbolId) {
    return name
  }

  let id = symbolId

  const { fileName = '', dirName } = discreteDir(name)
  if (symbolId.includes('[dir]')) {
    id = id.replace(/\[dir\]/g, dirName)
    if (!dirName) {
      id = id.replace('--', '-')
      if (id.startsWith('-')) {
        id = id.slice(1)
      }
    }
  }
  id = id.replace(/\[name\]/g, fileName)
  return id.replace(extname(id), '')
}

function discreteDir(name: string) {
  if (!normalizePath(name).includes('/')) {
    return {
      fileName: name,
      dirName: '',
    }
  }
  const strList = name.split('/')
  const fileName = strList.pop()
  const dirName = strList.join('-')
  return { fileName, dirName }
}
