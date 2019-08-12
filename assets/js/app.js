import menuFunc from './modules/menu'
import tocFunc from './modules/toc'
import asideFunc from './modules/aside'
import searchFunc from './modules/search'
import zoom from 'zoom-image'
import 'zoom-image/css/zoom-image.css'

import { $$ } from './modules/utils'

const main = () => {
  // Menu
  menuFunc()

  // TOC
  tocFunc()

  // aside get_code
  asideFunc()

  // search page
  searchFunc()

  // image zoon
  $$('.typo img').forEach(imgElem => {
    zoom(imgElem)
  })
}

document.addEventListener('DOMContentLoaded', main)