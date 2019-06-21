const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

class Overlay {
  constructor() {
    const overlayDOM = document.createElement('div')
    overlayDOM.setAttribute('class', "js-overlay")

    document.body.appendChild(overlayDOM)
    this._overlayDOM = overlayDOM
    this._isShow = false
  }

  static create() {
    return new Overlay()
  }

  isShow() {
    return this._isShow
  }

  show() {
    this._overlayDOM.classList.add('-show')
    this._isShow = true
    // disable body's scroll
    document.body.classList.add('-noscroll')
  }

  hide() {
    this._overlayDOM.classList.remove('-show')
    this._isShow = false
    document.body.classList.remove('-noscroll')
  }

  addClickEvent(fn) {
    this._overlayDOM.addEventListener('click', fn, { once: true })
  }

  destroy() {
    document.body.classList.remove('-noscroll')
    this._overlayDOM.remove()
  }
}


const main = () => {
  // Menu
  if ($('#mobile-menu-icon')) {
    $('#mobile-menu-icon').addEventListener('click', function() {
      const overlay = Overlay.create()
      overlay.show()
      $('#mobile-menu').classList.add("-active")
      overlay.addClickEvent(() => {
        $('#mobile-menu').classList.remove("-active")
        overlay.hide()
      })
    })
  }

  // TOC
  function getTOCItem(dom) {
    return dom.parentElement.parentElement
  }

  if ($('.link.-current')) {
    let ele = getTOCItem($('.link.-current').parentElement)
    while (ele.classList.contains('item')) {
      ele.classList.add("-show")
      ele = getTOCItem(ele)
    }
  }

  if ($$('.arrow')) {
    $$('.arrow').forEach(arrow => {
      arrow.parentElement.addEventListener('click', function() {
        this.parentElement.classList.toggle('-show')
      })
    })
  }

  // TOC drawer
  if ($('#js-drawer-handle')) {
    const overlay = Overlay.create()

    $('#js-drawer-handle').addEventListener('click', function() {
      const show = () => {
        overlay.show()
        this.classList.add('-show')
        $('#js-drawer').classList.add('-show')
      }

      const hide = () => {
        $('#js-drawer').classList.remove('-show')
        this.classList.remove('-show')
        overlay.hide()
      }

      if (!overlay.isShow()) {
        show()
        overlay.addClickEvent(() => {
          hide()
        })
      } else {
        hide()
      }
    })
  }

  // aside get_code
  if ($("#js-code")) {
    const _buttons = $$("#js-code .button")

    const httpBtn = _buttons[0]
    const sshBtn = _buttons[1]
    const input = $("#js-code .input")
    const copyBtn = $("#js-code .addon")

    const github = input.value.trim()

    httpBtn.addEventListener('click', () => {
      httpBtn.classList.add('-selected')
      sshBtn.classList.remove('-selected')
      input.value = `${github}.git`
    })

    sshBtn.addEventListener('click', () => {
      httpBtn.classList.remove('-selected')
      sshBtn.classList.add('-selected')
      input.value = `${github.replace('https:', 'git@github.com:')}.git`
    })

    copyBtn.addEventListener('click', () => {
      input.focus()
      input.select()
      try {
        document.execCommand('copy');
      } catch (err) {}
      input.blur()
    })

    httpBtn.click()
  }
}

document.addEventListener('DOMContentLoaded', main)
