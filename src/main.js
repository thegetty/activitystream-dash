import Vue from 'vue';
import VueResource from 'vue-resource';
import App from './App.vue';

import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

import { store } from './store/store';

Vue.use(VueResource);

export const tickerBus = new Vue();

new Vue({
  el: '#app',
  store,
  render: h => h(App),
  methods: {
    loadData() {
      var refreshPeriod = 10000;
      tickerBus.$emit('pulse');
      if (this.$store.state.refreshRate !== undefined) {
        refreshPeriod = this.$store.state.refreshRate;
        console.log("Setting the refresh period to " + refreshPeriod);
      }
      setTimeout(function () {
        this.loadData();
      }.bind(this), refreshPeriod);   // 10 second interval
    }
  },
  mounted() {
    this.loadData();
  }
});
