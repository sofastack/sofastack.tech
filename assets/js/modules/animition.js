import { $ } from './utils'
import SVG from 'svg.js'
// import debounce from 'lodash-es/debounce'

// import a from '../../svg/a.svg'
// import b from '../../svg/b.svg'

import box from '../../svg/box.svg'
import debris1 from '../../svg/float/debris-1.svg'
import debris2 from '../../svg/float/debris-2.svg'
import debris3 from '../../svg/float/debris-3.svg'

function loadSVG() {

  const svgMap = {
    // a: {
    //   svg: a,
    //   // transform: 'tranlateX(45)'
    // },
    debris1: {
      svg: debris1,
    },
    debris2: {
      svg: debris2,
    },
    debris3: {
      svg: debris3,
    },
    box: {
      svg: box,
    },
  }

  Object.keys(svgMap).forEach(val => {
    const div = document.createElement('div')
    $("#js-home-animition").appendChild(div)
    div.innerHTML = svgMap[val].svg
    div.setAttribute("id", val)
    // div.style.position = 'absolute'
    // div.style.transform = svgMap[val].transform
  })
}

function interpolate(x) {
  return x
}

export default function() {
  if (!$("#js-home-animition")) {
    return
  }

  loadSVG()

  SVG.select('#box svg').first().size(600, 600)
  SVG.select('#debris1 svg').first().size(200, 200)
  SVG.select('#debris2 svg').first().size(200, 200)
  SVG.select('#debris3 svg').first().size(200, 200)

  // 上下
  const a = SVG.select('#box #a')
  const h = SVG.select('#box #h')

  // 前后
  const b = SVG.select('#box #b')
  const d = SVG.select('#box #d')

  // 左
  const c = SVG.select('#box #c')
  const e = SVG.select('#box #e')

  // 右
  const f = SVG.select('#box #f')
  const g = SVG.select('#box #g')

  function animate(fraction, animateConfig) {
    const len = interpolate(fraction) * 700

    const config = { 
      ease: '<>', 
      duration: 1, 
      // delay: 0,
      ...animateConfig,
    }

    // 上下
    a.animate(config).move(-len * 0.2, -len * 0.7)
    h.animate(config).move(len * 0.2, len * 0.8)

    // 前后
    b.animate(config).move(len * 0.5, -len * 0.3)
    d.animate(config).move(-len * 0.5, len * 0.3)

    // 左
    c.animate(config).move(-len, -len * 0.8)
    e.animate(config).move(-len * 0.5, 0)

    // 右
    f.animate(config).move(len * 0.7, len * 0.3)
    g.animate(config).move(len * 0.7, -len * 0.5)
  }

  (function debrisFloatAnimate() {
    SVG.select('#debris1 svg g').animate({
      ease: '<>', 
      duration: 5000, 
    }).move(-Math.random() * 200, Math.random() * 70)

    SVG.select('#debris2 svg g').animate({
      ease: '<>', 
      duration: 5000, 
    }).move(Math.random() * 140, Math.random() * 100)

    SVG.select('#debris3 svg g').animate({
      ease: '<>', 
      duration: 5000, 
    }).move(Math.random() * 100, Math.random() * 100)

    setTimeout(debrisFloatAnimate, 8000)
  })()

  // vars
  const processDom = document.getElementsByClassName('home-container')[0]
  let boxRect = calcBoxRect()

  let hover = false
  let isBreak = false

  function calcBoxRect() {
    const rect = processDom.getBoundingClientRect()
    return rect
  }

  function onMousemove(evt) {
    const { clientX } = evt
    animate((clientX - boxRect.left) / boxRect.width)
  }

  window.addEventListener('resize', () => {
    boxRect = calcBoxRect()
  })

  processDom.addEventListener('mouseenter', () => {
    hover = true
  })
  processDom.addEventListener('mouseleave', () => {
    hover = false
  })
  processDom.addEventListener('mousemove', onMousemove)


  setInterval(() => {

    if (hover) {
      return
    }

    if (!isBreak) {
      animate(1, {
        duration: 2500,
      })
    } else {
      animate(0, {
        duration: 3000,
      })
    }

    isBreak = !isBreak

  }, 4000)
}