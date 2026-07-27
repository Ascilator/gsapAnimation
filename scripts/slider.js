export function createSlideController(transitions) {
  const lastSlide = transitions.length
  let current = 0
  let animating = false

  function next() {
    if (animating || current >= lastSlide) return
    animating = true
    const tl = transitions[current]
    current += 1
    tl.eventCallback('onComplete', () => {
      animating = false
    })
    tl.play(0)
  }

  function prev() {
    if (animating || current <= 0) return
    animating = true
    current -= 1
    const tl = transitions[current]
    tl.eventCallback('onReverseComplete', () => {
      animating = false
    })
    tl.reverse()
  }

  function destroy() {
    transitions.forEach(tl => tl.kill())
  }

  return { next, prev, destroy }
}

export function bindWheelAndTouchNavigation(controller, { cooldown, wheelThreshold = 2, touchThreshold = 40 } = {}) {
  let wheelLocked = false

  function handleWheel(event) {
    event.preventDefault()
    if (wheelLocked || Math.abs(event.deltaY) < wheelThreshold) return
    wheelLocked = true
    if (event.deltaY > 0) controller.next()
    else controller.prev()
    setTimeout(() => {
      wheelLocked = false
    }, cooldown)
  }

  let touchStartY = null

  function handleTouchStart(event) {
    touchStartY = event.touches[0].clientY
  }

  function handleTouchMove(event) {
    event.preventDefault()
  }

  function handleTouchEnd(event) {
    if (touchStartY === null) return
    const deltaY = touchStartY - event.changedTouches[0].clientY
    touchStartY = null
    if (Math.abs(deltaY) < touchThreshold) return
    if (deltaY > 0) controller.next()
    else controller.prev()
  }

  window.addEventListener('wheel', handleWheel, { passive: false })
  window.addEventListener('touchstart', handleTouchStart, { passive: true })
  window.addEventListener('touchmove', handleTouchMove, { passive: false })
  window.addEventListener('touchend', handleTouchEnd)

  return () => {
    window.removeEventListener('wheel', handleWheel)
    window.removeEventListener('touchstart', handleTouchStart)
    window.removeEventListener('touchmove', handleTouchMove)
    window.removeEventListener('touchend', handleTouchEnd)
  }
}
