import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/uber',
      name: 'uber',
      component: require('@/components/Uber').default
    },
    {
      path: '/lyft',
      name: 'lyft',
      component: require('@/components/Lyft').default
    },
    {
      path: '/',
      name: 'main-page',
      component: require('@/components/Main').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
