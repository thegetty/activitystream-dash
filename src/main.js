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
      console.log("'loadData' called here");
      tickerBus.$emit('pulse');
    }
  },
  mounted() {
    this.loadData();

    setInterval(function () {
      this.loadData();
    }.bind(this), 10000);   // 10 second interval
  }
});
