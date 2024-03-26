import { BinaryLike, BinaryToTextEncoding, createHash } from "node:crypto";
import path from 'node:path';

const postfixRE = /[?#].*$/
export function cleanUrl(url: string): string {
  return url.replace(postfixRE, '')
}

export function getHash(
  buffer: BinaryLike,
  algorithm = "md5",
  encoding: BinaryToTextEncoding = "hex",
  maxLength = 9999
) {
  return createHash(algorithm).update(buffer).digest(encoding).slice(0, maxLength);
}

const STRINGIFIED_REGEXP = /^'|".*'|"$/;
/** If already stringified - return original content */
export function stringify(content: unknown) {
  if (typeof content === 'string' && STRINGIFIED_REGEXP.test(content)) {
    return content;
  }
  return JSON.stringify(content, null, 2);
}


// import.meta.url
export function interpolateName(resourcePath: string, name: string, content: string) {
  const parsed = path.parse(resourcePath);
  const ext = parsed.ext.slice(1) || 'bin';
  const basename = parsed.name || 'file'
  if (parsed.dir) resourcePath = parsed.dir + path.sep
  const directory = resourcePath.replace(/\\/g, '/').replace(/\.\.(\/)?/g, '_$1');
  const folder = path.basename(directory);
  const query = '';

  let url = name || '[hash].[ext]';

  if (content) {
    // Match hash template
    url = url
      // `hash` and `contenthash` are same in `loader-utils` context
      // let's keep `hash` for backward compatibility
      .replace(
        /\[(?:([^[:\]]+):)?(?:hash|contenthash)(?::([a-z]+\d*))?(?::(\d+))?\]/gi,
        (all, hashType, digestType, maxLength) =>
          getHash(content, hashType, digestType, parseInt(maxLength, 10))
      )
  }

  url = url
    .replace(/\[ext\]/gi, () => ext)
    .replace(/\[name\]/gi, () => basename)
    .replace(/\[path\]/gi, () => directory)
    .replace(/\[folder\]/gi, () => folder)
    .replace(/\[query\]/gi, () => query);

  return url;
}