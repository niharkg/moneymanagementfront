import transactionApi from '../../api/transaction-api.js'
import * as types from '../mutation-types.js'

const state = {
  transaction: {}
}

const getters = {
  me_wallet: state => state.wallet,
  balances: state => {
    if (state.wallet) return state.wallet.balances
    return null
  },
  transactions: state => {
    if (state.wallet) return state.transactions
    return null
  }
}

const actions = {
  // Get all of  a user's transactions
  getRecentTransactions({ commit }, params) {
    console.log("here")
    return transactionApi.getRecentTransactions(params.user_id, params.amount)
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => Promise.reject(error))
  },
  // Get all of  a user's transactions
  getCurrentMonthCategorySpendings({ commit }, params) {
    console.log(params)
    return transactionApi.getCurrentMonthCategorySpending(params.month, params.year)
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => Promise.reject(error))
  },

  getTransactoinsByPage({ commit }, page_id) {
    return transactionApi.getTransactoinsByPage(page_id)
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => Promise.reject(error))
  },
}

const mutations = {
  [types.LIST_TRANSACTIONS](state, response) {
    state.wallet = response
  },
}

export default {
  state,
  getters,
  actions,
  mutations,
}
