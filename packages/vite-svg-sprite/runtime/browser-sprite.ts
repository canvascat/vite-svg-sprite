import BrowserSprite from 'svg-baker-runtime';

const SPRITE_NODE_ID = '__SVG_SPRITE_NODE__';
const SPRITE_GLOBAL_VAR_NAME = Symbol.for('__SVG_SPRITE__');

/** 获取全局唯一 BrowserSprite */
function findSprite() {
  if (SPRITE_GLOBAL_VAR_NAME in window) return window[SPRITE_GLOBAL_VAR_NAME] as BrowserSprite;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sprite = new BrowserSprite({ attrs: { 'aria-hidden': 'true', 'id': SPRITE_NODE_ID } as any });
  Object.assign(window, { [SPRITE_GLOBAL_VAR_NAME]: sprite });
  return sprite;
}

function loadSprite(sprite: BrowserSprite) {
  const existing = document.getElementById(SPRITE_NODE_ID);

  if (existing) {
    sprite.attach(existing);
  } else {
    sprite.mount(document.body as unknown as string, true);
  }
}

function domReady(callback: () => void) {
  if (document.body || (/^loaded|^i|^c/).test(document.readyState)) {
    callback();
  } else {
    document.addEventListener('DOMContentLoaded', function listener() {
      document.removeEventListener('DOMContentLoaded', listener);
      callback();
    });
  }
}

const sprite = findSprite()
domReady(() => loadSprite(sprite))

export default sprite;
