// https://vitepress.dev/guide/custom-theme
import Theme from 'vitepress/theme'
import './style.css'
import 'virtual:group-icons.css'
import 'markdown-it-steps/style.css'
import BackToTopButton from '@miletorix/vitepress-back-to-top-button'
import '@miletorix/vitepress-back-to-top-button/style.css'

export default {
  extends: Theme,
  enhanceApp(ctx) {
    BackToTopButton(ctx.app)
  }
}
