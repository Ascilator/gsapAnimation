gsap.registerPlugin(ScrollTrigger)

const firstScreenAppear = 200
const firstScreenLeave = 500
const firstScreenFadeOut = 150

const supheaderWidth = 290
const revealScroll = 300
const pauseScroll = 500
const flyScale = 0.15

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

ScrollTrigger.matchMedia({
  '(min-width: 769px)': () => {
    const supheaderItems = gsap.utils.toArray('.supheader_item')
    const animationItems = gsap.utils.toArray('.animation_item')

    const totalScroll =
      firstScreenAppear +
      firstScreenLeave +
      supheaderItems.length * revealScroll +
      (supheaderItems.length - 1) * pauseScroll

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

    supheaderItems.forEach((supItem, index) => {
      const start = firstScreenAppear + firstScreenLeave + index * (revealScroll + pauseScroll)

      timeline.to(
        supItem,
        {
          width: supheaderWidth,
          duration: revealScroll,
          ease: 'none'
        },
        start
      )

      const fromItem = animationItems[index]
      const toItem = animationItems[index + 1]
      if (!fromItem || !toItem) return

      const realImg = fromItem.querySelector('.image_part img:not(.flying_clone)')
      const clone = fromItem.querySelector('.flying_clone')
      const targetIcon = supItem.querySelector('.supheader_item_image')
      const flyState = { p: 0 }

      timeline.set(realImg, { opacity: 0 }, start)

      timeline.to(
        flyState,
        {
          p: 1,
          duration: revealScroll,
          ease: 'none',
          onUpdate: () => updateFlyingClone(clone, targetIcon, flyState.p, flyScale)
        },
        start
      )

      timeline.to(
        fromItem.querySelector('.text_part'),
        {
          opacity: 0,
          duration: revealScroll / 2,
          ease: 'none'
        },
        start
      )

      timeline.fromTo(toItem, { left: '100%' }, { left: '0%', duration: revealScroll, ease: 'none' }, start)
    })
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
