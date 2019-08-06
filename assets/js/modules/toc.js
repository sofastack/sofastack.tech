import { $, $$, Overlay } from './utils'

export default function() {

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
}