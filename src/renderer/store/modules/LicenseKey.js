const state = {
  days: 0,
  expiring: false,
  expired: false
}

const mutations = {
  SET_DAYS (state, days) {
    state.days = days
  },
  SET_LICENSE_EXPIRING (state, days) {
    state.expiring = days > 0 && days <= 30
  },
  SET_LICENSE_EXPIRED (state, days) {
    state.expired = days === 0
  }
}

const actions = {
  setDays ({ commit }, days) {
    commit('SET_DAYS', days)
  },
  setLicenseExpiring ({ commit }, days) {
    commit('SET_LICENSE_EXPIRING', days)
  },
  setLicenseExpired ({ commit }, days) {
    commit('SET_LICENSE_EXPIRED', days)
  }
}

export default {
  state,
  mutations,
  actions
}
