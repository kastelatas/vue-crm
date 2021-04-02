import dotenv from 'dotenv'

dotenv.config();

export default {
  mode: 'spa',
  /*
  ** Headers of the page
  */
  head: {
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#fff' },
  /*
  ** Global CSS
  */
  css: [
    '~/assets/css/fonts.css',
    '~/assets/css/bootstrap.min.css',
    { src: '~/assets/sass/main.scss', lang: 'scss' },
    { src: '~/assets/sass/dark-theme.scss', lang: 'scss' }
  ],
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    '~/plugins/ws',
    '~/plugins/global',
    '~/plugins/filters',
    '~/plugins/directives'
  ],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
    '@nuxt/typescript-build'
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [],
  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    extend() { // extend (config, ctx) {
    }
  },
  env: (process.env.NODE_ENV !== 'production') ? {
    API_HOST: process.env.API_HOST,
    API_METRIC_HOST: process.env.API_METRIC_HOST
  } : {}
}
