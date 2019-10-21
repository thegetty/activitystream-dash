<template>
  <div class="container align-self-center">
    <div class="row">
      <div class="col-md-10 col-xs-12 col-sm-10">
      <nav class="navbar navbar-default navbar-fixed-top navbar-expand-md navbar-expand-lg navbar-expand-xl navbar-light bg-light">
        <div class="navbar-brand" href="#">
          <app-status-display :icons="icons" :key="this.$store.loadingState"></app-status-display>
        </div>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav mr-auto">
            <li class="nav-item dropdown active">
              <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button"
                 data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                Feeds
              </a>
              <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                <div href="#" class="dropdown-item" v-for="feed in feedlist"
                              :class="{ active: feed === currentFeed }" @click="changeFeed(feed)">
                  {{ feed }}
                </div>
              </div>
            </li>
            <li class="nav-item dropdown active">
              <a class="nav-link dropdown-toggle" href="#" id="pollSizeDropdown" role="button"
                 data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                Poll size
              </a>
              <div class="dropdown-menu" aria-labelledby="pollSizeDropdown">
                <div href="#" class="dropdown-item" v-for="pollSize in refreshSizes"
                              :class="{ active: pollSize === itemMax }" @click="changePollSize(pollSize)"
                              style="cursor: pointer;">
                  {{ pollSize }}
                </div>
              </div>
            </li>
            <li class="nav-item dropdown active">
              <a class="nav-link dropdown-toggle" href="#" id="pollRateDropdown" role="button"
                 data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                Poll every
              </a>
              <div class="dropdown-menu" aria-labelledby="pollRateDropdown">
                <div href="#" class="dropdown-item" v-for="rate in refreshRates"
                              :class="{ active: rate === refreshSeconds }" @click="changeRefreshRate(rate)"
                              style="cursor: pointer;">
                  {{ rate }}s
                </div>
              </div>
            </li>
          </ul>
        </div>
      </nav>
      </div>
    </div>
    <div class="row">
      <div class="col-12 align-self-center">
          <app-feed-display :feedName="currentFeed"
                            :itemMax="itemMax"></app-feed-display>
      </div>
    </div>
    <footer v-if="message" class="alert alert-info">{{ message }}</footer>

<!-- DEBUG responses -->

    <div class="row" v-if="debug">
      <div class="col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3 col-lg-6 col-lg-offset-3">
        <div class="alert alert-info text-center">Debug panel <br><br>
        <button class="btn btn-primary" @click="tmpshiftState">Rotate state</button>
        <button class="btn btn-primary" @click="refreshFeed">Force Reload</button>
        <button class="btn btn-primary" @click="rebuildFeed">Rebuild</button>
        <button class="btn btn-primary" @click="debug = $store.state.feeds['https://mart.getty.edu/activity-stream'].stream.length">Debug</button>
        {{ debug }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Status from './components/Status.vue';
import FeedDisplay from './components/FeedDisplay.vue';
import { tickerBus } from './main';

import failIcon from "./assets/fail.svg";
import tickIcon from "./assets/tick.svg";
import loadIcon from "./assets/ajax-loader.gif";

export default {
  data() {
    return {
      icons: {
        fail: {color: 'lightcoral', src: failIcon},
        done: {color: 'lightgreen', src: tickIcon},
        loading: {color: 'white', src: loadIcon}
      },
      refreshSizes: [10,50,100,200],
      refreshRates: [5,10,20,30,60],
      itemMax:50,
      tmpStateList: ['done', 'loading', 'fail', 'idle'],
      debug: false
    };
  },
  components: {
    appStatusDisplay: Status,
    appFeedDisplay: FeedDisplay
  },
  methods: {
    tmpshiftState() {
      let newState = this.tmpStateList.pop();
      this.$store.commit('changeState', newState);
      console.log("newState: " + newState);
      console.log("Stored State: " + this.$store.state.loadingState);
      this.tmpStateList.unshift(newState);
    },
    refreshFeed() {
      tickerBus.$emit('pulse', 1);
    },
    rebuildFeed() {
      tickerBus.$emit('rebuild', 1);
    },
    changeFeed(feed) {
      this.$store.state.currentFeed = feed;
    },
    changePollSize(size) {
      console.log("Changed size to "+size);
      this.itemMax = size;
    },
    changeRefreshRate(rate) {
      console.log("Changed rate to "+rate);
      this.$store.state.refreshRate = rate * 1000;
    }
  },
  computed: {
    message() {
      return "Poll size: " + this.itemMax + " activities, polls every " + this.refreshSeconds + "s.";
    },
    currentFeed() {
      return this.$store.state.currentFeed;
    },
    feedlist() {
      return this.$store.state.feedlist;
    },
    refreshSeconds() {
      return Math.floor(this.$store.state.refreshRate / 1000);
    }
  },
  created() {
    // TODO initialize the feed
    this.feedlist.sort();
    this.$store.state.currentFeed = this.feedlist[0];
  }
}

</script>

<style>

</style>
