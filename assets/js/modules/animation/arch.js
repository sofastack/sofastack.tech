import SVG from 'svg.js'
import { $, $$ } from '../utils'
import { mountSVG } from './index.js'
// import debounce from 'lodash-es/debounce'

import arch from '../../../svg/arch.svg'

function loadArchSVG() {
  const archSvgMap = {
    arch: {
      svg: arch,
    },
  }

  mountSVG("#js-arch-animation", archSvgMap)
}


function archAnimation() {

  const animateConfig = {
    duration: 400,
  }

  if (window.innerWidth <= 568) {
    SVG.select('#arch svg').first().size(320, 220)
  } else {
    SVG.select('#arch svg').first().size(600, 440)
  }


  let state = 'INIT'

  const groupMap = {
    TR: SVG.select('#arch #tr'),
    TL: SVG.select('#arch #tl'),
    BL: SVG.select('#arch #bl'),
    BR: SVG.select('#arch #br'),
  }

  const cirMap = {
    TR: SVG.select('#arch #cir-tr'),
    TL: SVG.select('#arch #cir-tl'),
    BL: SVG.select('#arch #cir-bl'),
    BR: SVG.select('#arch #cir-br'),
  }

  const iconMap = {
    TR: SVG.select('#arch #icon-micro'),
    TL: SVG.select('#arch #icon-servi'),
    BL: SVG.select('#arch #icon-immut'),
    BR: SVG.select('#arch #icon-decla'),
  }

  const textMap = {
    TR: SVG.select('#arch #text-micro'),
    TL: SVG.select('#arch #text-servi tspan'),
    BL: SVG.select('#arch #text-immut tspan'),
    BR: SVG.select('#arch #text-decla'),
  }

  const textBGMap = {
    TR: SVG.select('#arch #text-bg-tr'),
    TL: SVG.select('#arch #text-bg-tl'),
    BL: SVG.select('#arch #text-bg-bl'),
    BR: SVG.select('#arch #text-bg-br'),
  }

  const line = SVG.select('#arch #border-line')
  const mainBG = SVG.select('#arch #main-bg')

  const shadow = SVG.select('#arch #cir-shadow').first()
  const textCloud = SVG.select('#arch #text-cloud').first()

  const mainBGPoints = mainBG.first().attr('points')

  function getReverseDir(direction) {
    // if (direction === 'INIT') {
    //   return 'INIT'
    // }

    const isTop = direction[0] === 'T'
    const isLeft = direction[1] === 'L'

    return `${isTop ? 'B' : 'T'}${isLeft ? 'R' : 'L'}`
  }

  function moveLine(direction) {
    const len = 95

    const getPoint = (dir) => {
      const cir = cirMap[dir]

      let w = 0
      let v = 0
      if (dir === direction) {
        w = dir[1] === 'L' ? -len : len
        v = dir[0] === 'T' ? -len : len
      }
      if (dir === getReverseDir(direction)) {
        w = (dir[1] !== 'L' ? -len : len) / 2
        v = (dir[0] !== 'T' ? -len : len) / 2
      }
      return [cir.first().cx() + w, cir.first().cy() + v]
    }

    const points = new SVG.PointArray([
      getPoint('TR'), getPoint('TL'), getPoint('BL'), getPoint('BR'), getPoint('TR')
    ]).toString()

    line
      .animate(animateConfig)
      .attr({
        points,
      })
    mainBG
      .animate(animateConfig)
      .attr({
        points,
      })

    let w = direction[1] === 'L' ? -len : len
    let v = direction[0] === 'T' ? -len : len
    groupMap[direction]
      .animate(animateConfig)
      .dmove(w, v)

    const rDir = getReverseDir(direction)
    groupMap[rDir]
      .animate(animateConfig)
      .dmove(w / 2, v / 2)
  }

  const positionBackMap = {}
  Object.keys(cirMap).forEach((direction) => {
    // const cir = cirMap[direction]
    const icon = iconMap[direction]
    // const text = textMap[direction]

    positionBackMap[direction] = {
      icon: {
        x: icon.first().x(),
        y: icon.first().y(),
      },
    }
  })

  function animateReset(notReset) {
    if (state === 'INIT') {
      return
    }

    // 重置
    if (!notReset) {
      shadow
        .animate(animateConfig)
        .move(0)

      textCloud
        .animate(animateConfig)
        .attr({
          opacity: 1,
        })

      line
        .animate(animateConfig)
        .attr({
          points: mainBGPoints,
        })
      mainBG
        .animate(animateConfig)
        .attr({
          points: mainBGPoints,
        })
    }

    Object.keys(cirMap).forEach((dir) => {

      const group = groupMap[dir]
      const cir = cirMap[dir]
      const icon = iconMap[dir]
      const text = textMap[dir]
      const textBG = textBGMap[dir]

      group
        .move(0, 0)

      cir
        // .animate(animateConfig)
        .attr({
          r: 60.56,
        })
        .style({
          fill: '#7cbbfc',
        })

      const { x, y } = positionBackMap[dir].icon

      icon
        .scale(1)
        .move(x, y)
        .attr({
          fill: '#000',
        })

      text
        // .animate(animateConfig)
        .attr({
          fill: '#000',
        })

      textBG.attr({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      })
    })
  }

  function moveCenterCir(dir) {
    if (dir[1] === 'L') {
      shadow.animate(animateConfig).move(0)
    } else {
      shadow.animate(animateConfig).move(90)
    }

    textCloud.animate(animateConfig).attr({
      opacity: 0.6,
    })
  }

  function runAnimate(direction) {
    const cir = cirMap[direction]
    const icon = iconMap[direction]
    const text = textMap[direction]
    const textBG = textBGMap[direction]

    const cx = cir.first().cx()
    const cy = cir.first().cy()

    moveCenterCir(direction)

    moveLine(direction)

    cir
      .animate(animateConfig)
      .attr({
        r: 120,
      })
      .style({
        fill: '#2e73d7',
      })

    const rDir = getReverseDir(direction)

    cirMap[rDir]
      .animate(animateConfig)
      .attr({
        r: 45,
      })

    icon.center(cx, cy)
      .animate(animateConfig)
      .scale(1.6)
      .attr({
        fill: '#fff',
      })

    const padding = 20

    const bbox = text.bbox()
    textBG.attr({
      x: bbox.x - padding * 2,
      y: bbox.y - padding,
      width: 0,
      height: bbox.height + padding * 2,
      fill: '#fff',
    })

    text
      .animate(animateConfig)
      .attr({
        fill: '#fff',
      })

    textBG
      .animate(animateConfig)
      .attr({
        fill: '#2e73d7',
        width: bbox.width + padding * 4,
      })
  }

  function setDescription(dir) {
    $$(`#js-arch .description-container`).forEach(it => {
      it.classList.add('-hidden')
    })
    $(`#js-arch .${dir}`).classList.remove('-hidden')
  }

  function makeListener(dir) {
    return () => {
      if (state === dir) {
        // animateReset()
        // setDescription('INIT')
      } else {
        animateReset(true)
        runAnimate(dir)
        state = dir

        setDescription(dir)
      }
    }
  }

  Object.keys(cirMap).forEach(dir => {
    groupMap[dir].on('mouseenter', makeListener(dir))
    groupMap[dir].on('touchstart', makeListener(dir))
    // cirMap[dir].on('mouseleave', animateReset)
  })

  const resetListener = () => {
    animateReset()
    state = 'INIT'

    setDescription('INIT')
  }

  textCloud.on('mouseenter', resetListener)
  textCloud.on('touchstart', resetListener)
}

export {
  loadArchSVG,
  archAnimation,
}