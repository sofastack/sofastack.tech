import menuFunc from './modules/menu'
import tocFunc from './modules/toc'
import asideFunc from './modules/aside'
import searchFunc from './modules/search'

const main = () => {
  // Menu
  menuFunc()

  // TOC
  tocFunc()

  // aside get_code
  asideFunc()

  // search page
  searchFunc()
}

document.addEventListener('DOMContentLoaded', main)
