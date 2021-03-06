import axios from 'axios'

import { API_ROOT } from '../config.js'

const apiCall = (method, url, form_data, params) => {
  return axios({
    method: method,
    url: url,
    data: form_data,
    params: params,
    baseURL: API_ROOT + '/transactions/',
    withCredentials: true,
  })
    .then(response => Promise.resolve(response.data))
    .catch((error) => {
      // Error
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.headers)
        console.log(error.response.data)
        console.log(error.response.status)
        return Promise.reject(error.response)
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(error.request)
        return Promise.reject(error.request)
      }
    })
}

export default {
  // Get all of a user's transactions
  //  TODO: change user_id to active user when supported
  getRecentTransactions(user_id, amount) {
    return apiCall('get', user_id + '/amount/' + amount + '/')
  },
  getCurrentMonthCategorySpending(month, year) {
    return apiCall('get', 'categories/' + month + '/' + year + '/')
  },
  getTransactoinsByPage(query) {
    return apiCall('get', 'page/' + query.page + '/', null, query)
  },
  getAllTransactoins() {
    return apiCall('get', 'all/')
  },
  // getCurrentMonthCategorySpending(user_id, month, year) {
  //     return apiCall('get', 'get/categories/' + user_id + '/'+ month + '/' + year + '/')
  // },
  getCategoryPredictions(user_id, category) {
      // Fix issue with Gas/Automotive URL
      category = category.replace("/", "_");
      return apiCall('get', 'get/ml/' + user_id + '/'+ category + '/')
  },
  getUserCategories(user_id) {
      return apiCall('get', 'unique_categories/' + user_id + '/')
  },
  getLastYearMonthlySpending(user_id) {
      return apiCall('get', 'monthly_spendings/' + user_id + '/')
  },
  getAllModels(user_id) {
    return apiCall('get', 'ml_model/' + user_id + '/')
  },
}
