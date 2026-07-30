export function createSlideController(transitions, { onSettle } = {}) {
  const lastSlide = transitions.length
  let current = 0
  let animating = false

  function settle() {
    animating = false
    if (onSettle) onSettle(current)
  }

  function stepForward(onDone) {
    const tl = transitions[current]
    current += 1
    tl.eventCallback('onComplete', onDone)
    tl.play(0)
  }

  function stepBackward(onDone) {
    current -= 1
    const tl = transitions[current]
    tl.eventCallback('onReverseComplete', onDone)
    tl.reverse()
  }

  function next() {
    if (animating || current >= lastSlide) return
    animating = true
    stepForward(settle)
  }

  function prev() {
    if (animating || current <= 0) return
    animating = true
    stepBackward(settle)
  }

  function goTo(target) {
    target = Math.max(0, Math.min(lastSlide, target))
    if (animating || target === current) return
    animating = true

    function advance() {
      if (current === target) {
        settle()
        return
      }
      if (current < target) stepForward(advance)
      else stepBackward(advance)
    }

    advance()
  }

  function destroy() {
    transitions.forEach(tl => tl.kill())
  }

  return { next, prev, goTo, destroy }
}

export function bindWheelAndTouchNavigation(controller, { cooldown, wheelThreshold = 2, touchThreshold = 80 } = {}) {
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
