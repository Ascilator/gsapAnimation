gsap.registerPlugin(ScrollTrigger)

const firstScreenAppear = 200
const firstScreenLeave = 500
const firstScreenFadeOut = 150

const supheaderWidth = 290
const flyScale = 0.15

const INTRO_DURATION = 0.3
const FIRST_SCREEN_LEAVE_DURATION = 0.8
const CARD_TRANSITION_DURATION = 0.3
const TRANSITION_EASE = 'power2.inOut'

function updateFlyingClone(clone, target, progress, endScale) {
  gsap.set(clone, { x: 0, y: 0, scale: 1 })
  const cloneRect = clone.getBoundingClientRect()
  const targetRect = target.getBoundingClientRect()
  const dx = targetRect.left + targetRect.width / 2 - (cloneRect.left + cloneRect.width / 2)
  const dy = targetRect.top + targetRect.height / 2 - (cloneRect.top + cloneRect.height / 2)
  const scale = typeof endScale === 'function' ? endScale(cloneRect, targetRect) : endScale

  gsap.set(clone, {
    x: dx * progress,
    y: dy * progress,
    scale: gsap.utils.interpolate(1, scale, progress),
    opacity: 1 - progress
  })
}

function addFirstScreenAnimation(timeline, { flyLogo = true } = {}) {
  timeline.fromTo('.first_screen_image', { opacity: 0 }, { opacity: 1, duration: firstScreenAppear })
  timeline.fromTo('.first_screen_text', { opacity: 0 }, { opacity: 1, duration: firstScreenAppear }, '<')

  timeline.to(
    '.first_screen',
    { backgroundColor: '#f7f7f7', duration: firstScreenFadeOut, ease: 'none' },
    firstScreenAppear
  )
  timeline.to('.first_screen_text', { opacity: 0, duration: firstScreenFadeOut, ease: 'none' }, firstScreenAppear)

  timeline.to('.first_screen', { autoAlpha: 0, duration: firstScreenLeave, ease: 'none' }, firstScreenAppear)

  if (!flyLogo) return

  const firstScreenLogo = document.querySelector('.first_screen_image img:not(.flying_clone)')
  const firstScreenLogoClone = document.querySelector('.first_screen_image .flying_clone')
  const headerLogo = document.querySelector('.header .left_part img')

  timeline.set(firstScreenLogo, { opacity: 0 }, firstScreenAppear)

  const logoFlyState = { p: 0 }
  timeline.to(
    logoFlyState,
    {
      p: 1,
      duration: firstScreenLeave,
      ease: 'none',
      onUpdate: () =>
        updateFlyingClone(
          firstScreenLogoClone,
          headerLogo,
          logoFlyState.p,
          (cloneRect, targetRect) => targetRect.width / cloneRect.width
        )
    },
    firstScreenAppear
  )
}

function playFirstScreenIntro() {
  const tl = gsap.timeline({ defaults: { ease: TRANSITION_EASE } })
  tl.fromTo('.first_screen_image', { opacity: 0 }, { opacity: 1, duration: INTRO_DURATION })
  tl.fromTo('.first_screen_text', { opacity: 0 }, { opacity: 1, duration: INTRO_DURATION }, '<')
  return tl
}

function buildFirstScreenLeaveTimeline() {
  const tl = gsap.timeline({ paused: true, defaults: { ease: TRANSITION_EASE } })
  const fadeDuration = FIRST_SCREEN_LEAVE_DURATION * (firstScreenFadeOut / firstScreenLeave)

  tl.to('.first_screen', { backgroundColor: '#f7f7f7', duration: fadeDuration, ease: 'none' }, 0)
  tl.to('.first_screen_text', { opacity: 0, duration: fadeDuration, ease: 'none' }, 0)
  tl.to('.first_screen', { autoAlpha: 0, duration: FIRST_SCREEN_LEAVE_DURATION, ease: 'none' }, 0)

  const firstScreenLogo = document.querySelector('.first_screen_image img:not(.flying_clone)')
  const firstScreenLogoClone = document.querySelector('.first_screen_image .flying_clone')
  const headerLogo = document.querySelector('.header .left_part img')

  tl.set(firstScreenLogo, { opacity: 0 }, 0)

  const logoFlyState = { p: 0 }
  tl.to(
    logoFlyState,
    {
      p: 1,
      duration: FIRST_SCREEN_LEAVE_DURATION,
      ease: 'none',
      onUpdate: () =>
        updateFlyingClone(
          firstScreenLogoClone,
          headerLogo,
          logoFlyState.p,
          (cloneRect, targetRect) => targetRect.width / cloneRect.width
        )
    },
    0
  )

  return tl.pause(0)
}

function growSupheaderIcon(tl, supItem) {
  tl.to(supItem, { width: supheaderWidth, duration: CARD_TRANSITION_DURATION, ease: 'none' }, 0)
}

function flyCardImageIntoIcon(tl, fromItem, supItem) {
  const realImg = fromItem.querySelector('.image_part img:not(.flying_clone)')
  const clone = fromItem.querySelector('.flying_clone')
  const targetIcon = supItem.querySelector('.supheader_item_image')
  const flyState = { p: 0 }

  tl.set(realImg, { opacity: 0 }, 0)
  tl.to(
    flyState,
    {
      p: 1,
      duration: CARD_TRANSITION_DURATION,
      ease: 'none',
      onUpdate: () => updateFlyingClone(clone, targetIcon, flyState.p, flyScale)
    },
    0
  )
}

function fadeOutCardText(tl, fromItem) {
  tl.to(fromItem.querySelector('.text_part'), { opacity: 0, duration: CARD_TRANSITION_DURATION * 0.6, ease: 'none' }, 0)
}

function slideInNextCard(tl, toItem) {
  tl.fromTo(toItem, { left: '100%' }, { left: '0%', duration: CARD_TRANSITION_DURATION, ease: 'none' }, 0)
}

function buildCardTransitionTimeline(supItem, fromItem, toItem) {
  const tl = gsap.timeline({ paused: true, defaults: { ease: TRANSITION_EASE } })

  growSupheaderIcon(tl, supItem)
  flyCardImageIntoIcon(tl, fromItem, supItem)
  fadeOutCardText(tl, fromItem)
  slideInNextCard(tl, toItem)

  return tl.pause(0)
}

let firstScreenIntroPlayed = false

ScrollTrigger.matchMedia({
  '(min-width: 769px)': () => {
    const supheaderItems = gsap.utils.toArray('.supheader_item')
    const animationItems = gsap.utils.toArray('.animation_item')

    const transitions = [buildFirstScreenLeaveTimeline()]

    supheaderItems.forEach((supItem, index) => {
      const fromItem = animationItems[index]
      const toItem = animationItems[index + 1]
      if (!fromItem || !toItem) return
      transitions.push(buildCardTransitionTimeline(supItem, fromItem, toItem))
    })

    if (!firstScreenIntroPlayed) {
      firstScreenIntroPlayed = true
      playFirstScreenIntro()
    }

    const lastSlide = transitions.length
    let current = 0
    let animating = false

    function goNext() {
      if (animating || current >= lastSlide) return
      animating = true
      const tl = transitions[current]
      current += 1
      tl.eventCallback('onComplete', () => {
        animating = false
      })
      tl.play(0)
    }

    function goPrev() {
      if (animating || current <= 0) return
      animating = true
      current -= 1
      const tl = transitions[current]
      tl.eventCallback('onReverseComplete', () => {
        animating = false
      })
      tl.reverse()
    }

    const wheelCooldown = Math.max(FIRST_SCREEN_LEAVE_DURATION, CARD_TRANSITION_DURATION) * 1000 + 100
    let wheelLocked = false

    function handleWheel(event) {
      event.preventDefault()
      if (wheelLocked || Math.abs(event.deltaY) < 2) return
      wheelLocked = true
      if (event.deltaY > 0) goNext()
      else goPrev()
      setTimeout(() => {
        wheelLocked = false
      }, wheelCooldown)
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
      if (Math.abs(deltaY) < 40) return
      if (deltaY > 0) goNext()
      else goPrev()
    }

    document.body.classList.add('is_slider_mode')

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd)

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
      document.body.classList.remove('is_slider_mode')
      transitions.forEach(tl => tl.kill())
    }
  },

  '(max-width: 768px)': () => {
    const totalScroll = firstScreenAppear + firstScreenLeave

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: '.trigger',
        start: 'top top',
        end: `+=${totalScroll}`,
        pin: true,
        scrub: true,
        markers: true
      }
    })

    addFirstScreenAnimation(timeline)
  }
})

document.querySelectorAll('.faq_question').forEach(button => {
  button.addEventListener('click', () => {
    const item = button.closest('.faq_item')
    const isOpen = item.classList.toggle('is-open')

    button.setAttribute('aria-expanded', String(isOpen))
  })
})
