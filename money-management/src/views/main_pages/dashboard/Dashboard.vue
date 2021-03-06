<template>
  <div class="wrapper">
    <div class="container-fluid">

      <!-- Page-Title -->
      <div class="row">
        <div class="col-sm-12">
          <div class="page-title-box">

            <h4 class="page-title">Dashboard</h4>
          </div>
        </div>
      </div>
      <!-- end page title end breadcrumb -->
      <div class="row">
        <div class="col-sm-12">
          <div id="spending_alert" >
            {{ this.alertText }}
            <button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>

          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-lg-8">
          <div class="card-box">
            <h4 class="text-dark  header-title m-t-0 m-b-30">Monthly Spending</h4>
            <div class="widget-chart text-center">
              <div style="min-width: 200px; min-height: 200px;">
                <canvas style="width: 100%; height: 250px;" id="monthly-chart"></canvas>
              </div>

            </div>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="card-box">
            <h4 class="text-dark header-title m-t-0 m-b-30">Spending This Month
              <div class="pull-right">
                <router-link :to="{name:'transactions'}" class="text-primary">See All</router-link>
              </div>
            </h4>
            <canvas style="width: 100%; height: 250px;" id="category-chart"></canvas>
          </div>
        </div>
      </div>
      <!-- end row -->


      <div class="row">
        <div class="col-lg-8">
          <div class="card-box" style="height:400px;">
            <h4 class="text-dark header-title m-b-30">
              <div class="pull-right">
                <router-link :to="{name:'transactions'}" class="text-primary">See All</router-link>
              </div>
              Latest Transactions
            </h4>
            <table class="table">
              <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Payment Method</th>
                <th>Vendor</th>
                <th>Location</th>
              </tr>
              </thead>
              <tbody>
              <!-- User Transactions Concise Table -->
              <tr v-for="(tx, index) in transactions" v-if="index<8">
                <td>{{tx.sale_date.slice(0, 10)}}</td>
                <td>{{tx.sale_date.slice(11, 16)}}</td>
                <td>${{tx.amount.toFixed(2)}}</td>
                <td>{{tx.category}}</td>
                <td>{{tx.payment_method}}</td>
                <td>{{tx.location.vendor_name}}</td>
                <td>{{tx.location.city}}, {{tx.location.state}}</td>
              </tr>
              </tbody>
            </table>
            <div v-if="!transactions" class="text-center">
              <p>You have no transactions.</p>
              <button class="btn btn-primary">
                Explore
              </button>
            </div>
          </div>
        </div>
        <!-- end col -8 -->
        <div class="col-lg-4">
          <div class="card-box" style="height:400px;">
            <h4 class="text-dark header-title">Tips</h4>
            <div class="inbox-widget">
              <a v-for="tip in tips" :href="tip.url" target = "_blank">
                <div class="inbox-item">
                  <p class="inbox-item-author">{{tip.header}}</p>
                  <p class="inbox-item-text">{{tip.text}} <span class="pull-right"></span></p>
                </div>
              </a>
            </div>
          </div>

        </div>

      </div>
      <!-- end row -->
    </div>
    <!-- end container -->
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Utils from '../../../components/Util.vue'
// import Chart from 'chart.js'

export default {
  name: "Dashboard",
  data() {
    return {
      transactions: {},
      categorySpendings: {},
      categories: [],
      categorySpendings: [],
      alertType: "",
      alertText: "",
      tips: [],
    };
  },
  computed: {
    ...mapGetters({
      is_login: "is_login",
      me: "me"
    })
  },
  methods: {
    timeFromNow(time) {
      return moment(time).fromNow();
    },
    // Generate labels for transactions?
    generateLabels() {
      const list_hours = [];
      const d = new Date();
      let hour = d.getHours();
      for (let i = 0; i < 24; i += 1) {
        list_hours.unshift(hour + ":00");
        hour -= 1;
        if (hour === -1) hour += 24;
      }
      return list_hours;
    },
    // Retrieve all of a user's transactions
    getTransactoinsByPage() {
      this.$store.dispatch("getTransactoinsByPage", 1).then(response => {
        this.transactions = response;
      });
    },
    getRecentTransactions(user_id, amount) {
      let params = {}
      params.user_id = this.me.user_id
      params.amount = 5
      this.$store.dispatch("getRecentTransactions", params).then(result => {
        this.transactions = result
      });
    },
    // Get the category breakdown spending for the current month
    getCurrentMonthCategorySpendings(month, year) {
      let params = {
        month: month,
        year: year
      };

      this.$store
        .dispatch("getCurrentMonthCategorySpendings", params)
        .then(result => {
          this.categorySpendings = result;
          let months = Object.keys(this.categorySpendings);
          this.categories = Object.keys(this.categorySpendings[months[0]]);
          let spendings = [];
          for (let category of this.categories) {
            spendings.push(
              this.categorySpendings[months[0]][category].toFixed(2)
            );
          }
          this.categorySpendings = spendings;
          this.getOverspendingCategories(month);
          this.createDonutChart("category-chart");
        });
    },
    // Create the donut category chart
    createDonutChart(chartId) {
      const ctx = document.getElementById(chartId);
      const myChart = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: this.categories,
          datasets: [
            {
              backgroundColor: [
                "#FE0000",
                "#017DD7",
                "#2DCB76",
                "#FFEC02",
                "#9D46C9",
                "#63B5D3",
                "#4FDA22",
                "#FE7F16",
                "#809BE5",
                "#26D7AD"
              ],
              data: this.categorySpendings
            }
          ]
        },
        options: {
          title: {
            display: false
          },
          legend: {
            display: false
          }
        }
      });
    },
    // Get colors for the bars in the bar chart (leveraging spending)
    getBarColors(spendings) {
      let threshold = 0.03
      let bad = "#D22F2F"
      let ok = "#004879"
      let good = "#2DCB76"
      let total = 0
      let active_months = 0
      for(let spending of spendings) {
        if(spending != null) {
          total += spending
          active_months += 1
        }
      }
      let avg = total / active_months
      this.sendSpendingAlert(avg, threshold, spendings[spendings.length - 1])
      let colors = []
      for (let spending of spendings) {
        if (spending >= avg + avg*threshold){
          colors.push(bad)
        }
        else if (spending <= avg - avg*threshold) {
          colors.push(good)
        }
        else {
          colors.push(ok)
        }
      }
      return colors
    },
    // Alert the user of current spending
    sendSpendingAlert(avg, threshold, month_spending) {
      const ctx = document.getElementById("spending_alert");
      if (month_spending == null)
        month_spending = 0
      month_spending = month_spending.toFixed(2)
      let money_diff = (Math.abs((month_spending - avg).toFixed(2))).toFixed(2)
      let percent_diff = Math.abs(((avg - month_spending) / avg) * 100).toFixed(1)
      if (month_spending >= avg + avg*threshold){
        this.alertType = "danger"
        this.alertText = "Uh-oh, you're spending more than usual this month. Your spending is $" + month_spending + ". This is $" + money_diff + " higher than usual."
        ctx.className = "alert alert-danger alert-dismissable"
      }
      else if (month_spending <= avg - avg*threshold) {
        this.alertType = "success"
        this.alertText = "You're doing great this month! Your spending is $" + month_spending + ". This is $" + money_diff + " lower than usual."
        ctx.className = "alert alert-success alert-dismissable"
      }
      else {
        this.alertType = "info"
        this.alertText = "Your spending is right on track this month! Your spending is $" + month_spending +". This is $" + money_diff + " different than usual."
        ctx.className = "alert alert-info alert-dismissable"
      }
    },
    // Create the bar monthly spending chart
    createBarChart(chartId, months, spendings) {
      let colors = this.getBarColors(spendings);
      const ctx = document.getElementById(chartId);
      const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: months,
          datasets: [
            {
              backgroundColor: colors,
              data: spendings,
            }
          ]
        },
        options: {
          title: {
            display: false,
          },
          legend: {
            display: false,
          }
        }
      });
    },
    // Get the user's total spending for the last year
    getLastYearMonthlySpending() {
      this.$store.dispatch("getLastYearMonthlySpending", this.me.user_id).then(result => {
        let months = result[0]
        let spendings = result[1]
        this.createBarChart("monthly-chart", months, spendings)
      });
    },
    // Get a recommended spending tip for a user
    getTip(category, index){
      if(category == "Dining"){
        return Utils.dining_urls[index];
      }
      if(category == "Merchandise"){
        return Utils.merchandise_urls[index];
      }
      if(category == "Gas/Automotive"){
        return Utils.gas_automotive_urls[index];
      }
      if(category == "Insurance"){
        return Utils.insurance_urls[index];
      }
      if(category == "Healthcare"){
        return Utils.healthcare_urls[index];
      }
      if(category == "Entertainment"){
        return Utils.entertainment_urls[index];
      }
      if(category == "Grocery"){
        return Utils.grocery_urls[index];
      }
      if(category == "Travel"){
        return Utils.travel_urls[index];
      }
      return Utils.capital_one_urls[index];
    },
    // Find categories overspent in
    getOverspendingCategories(month) {
      let threshold = 0.03;
      let index = 0;
      let spending = 0;
      let pred = 0;
      let overspent_categories = [];
      let number_tips = 5;
      this.$store.dispatch("getAllModels", this.me.user_id).then(result => {
        let all_models = result;
        for(let model of all_models) {
          index = this.categories.indexOf(model.category);
          pred = model.slope * month + model.intercept;
          if(((this.categorySpendings[index] - pred)/this.categorySpendings[index]) >= threshold) {
            overspent_categories.push(model.category);
          }
        }
        for(let i = 0; i < number_tips; i++) {
          let tip = this.getTip(overspent_categories[i % overspent_categories.length], i);
          this.tips.push(this.getTip(overspent_categories[i % overspent_categories.length], i));
        }
      });
    }
  },
  // Call these functions before the page loads (mounts)
  beforeMount() {
    var d = new Date();
    // TODO: Fix month (User data not in October yet)
    this.getCurrentMonthCategorySpendings(d.getMonth(), d.getFullYear())
    this.getRecentTransactions();
    this.getLastYearMonthlySpending();
  },
};
</script>

<style scoped>
.card-box-no-outline {
  padding: 20px;
  -webkit-border-radius: 5px;
  border-radius: 5px;
  -moz-border-radius: 5px;
  background-clip: padding-box;
  margin-bottom: 20px;
  background-color: #ffffff;
}
</style>
