import {
  FIRST_SCREEN_LEAVE_DURATION,
  CARD_TRANSITION_DURATION,
  playFirstScreenIntro,
  buildFirstScreenLeaveTimeline,
  buildCardTransitionTimeline
} from './animation.js'
import { createSlideController, bindWheelAndTouchNavigation } from './slider.js'

gsap.registerPlugin(ScrollTrigger)

let firstScreenIntroPlayed = false

ScrollTrigger.matchMedia({
  '(min-width: 1121px)': () => {
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

    const slider = createSlideController(transitions)
    const cooldown = Math.max(FIRST_SCREEN_LEAVE_DURATION, CARD_TRANSITION_DURATION) * 1000 + 100
    const unbindNavigation = bindWheelAndTouchNavigation(slider, { cooldown })

    const handleSupheaderClick = index => () => slider.goTo(index + 1)
    const supheaderClickHandlers = supheaderItems.map((supItem, index) => {
      const handler = handleSupheaderClick(index)
      supItem.addEventListener('click', handler)
      return handler
    })

    const headerLogo = document.querySelector('.header .left_part img')
    const handleLogoClick = () => slider.goTo(0)
    headerLogo.addEventListener('click', handleLogoClick)

    document.body.classList.add('is_slider_mode')

    return () => {
      unbindNavigation()
      supheaderItems.forEach((supItem, index) => supItem.removeEventListener('click', supheaderClickHandlers[index]))
      headerLogo.removeEventListener('click', handleLogoClick)
      document.body.classList.remove('is_slider_mode')
      slider.destroy()
    }
  },

  '(max-width: 1120px)': () => {
    const transitions = [buildFirstScreenLeaveTimeline()]
    const cooldown = FIRST_SCREEN_LEAVE_DURATION * 1000 + 100

    let unbindNavigation = null

    function bindNavigation() {
      if (!unbindNavigation) unbindNavigation = bindWheelAndTouchNavigation(slider, { cooldown })
    }

    function handleScroll() {
      if (window.scrollY <= 0) bindNavigation()
    }

    const slider = createSlideController(transitions, {
      onSettle: current => {
        if (current === transitions.length && unbindNavigation) {
          unbindNavigation()
          unbindNavigation = null
        }
      }
    })

    if (!firstScreenIntroPlayed) {
      firstScreenIntroPlayed = true
      playFirstScreenIntro()
    }

    bindNavigation()
    window.addEventListener('scroll', handleScroll)

    const headerLogo = document.querySelector('.header .left_part img')
    const handleLogoClick = () => slider.goTo(0)
    headerLogo.addEventListener('click', handleLogoClick)

    document.body.classList.add('is_slider_mode')

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (unbindNavigation) unbindNavigation()
      headerLogo.removeEventListener('click', handleLogoClick)
      document.body.classList.remove('is_slider_mode')
      slider.destroy()
    }
  }
})

document.querySelectorAll('.faq_question').forEach(button => {
  button.addEventListener('click', () => {
    const item = button.closest('.faq_item')
    const isOpen = item.classList.toggle('is-open')

    button.setAttribute('aria-expanded', String(isOpen))
  })
})
