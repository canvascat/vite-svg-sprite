import type FastGlob from 'fast-glob'
import type { OptimizeOptions } from 'svgo'

export type OrArray<T> = T | T[]

export interface ViteSvgSpriteOptions {
  /**
   * icons folder, all svg files in it will be converted to svg sprite.
   */
  iconDirs: OrArray<Pick<FastGlob.Options, 'cwd' | 'ignore'> | string>

  /**
   * svgo configuration, used to compress svg
   *
   * @default：true
   */
  svgoOptions?: boolean | OptimizeOptions

  /**
   * icon format
   *
   * @default: [name]
   */
  symbolId?: string | ((id: string) => string)
}

export interface FileStats {
  relativeName: string
  mtimeMs?: number
  code: string
  symbolId?: string
}

export type ModuleCodeOptions = {
  createSymbolId: (id: string) => string
  optimizeOptions: OptimizeOptions | false
  fastGlobOptions: FastGlob.Options[]
}
