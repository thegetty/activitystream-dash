import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export const store = new Vuex.Store({
  state: {
    feeds: {},
    feedlist: [
      "https://mart.getty.edu/activity-stream"
    ],
    currentFeed: null,
    loadingState: 'idle',
    message: null,
    activities: {
        Create: {src: require('../assets/tick.svg'), text: "Create"},
        Update: {src: require('../assets/update.svg'), text: "+/-"},
        Delete: {src: require('../assets/fail.svg'), text: "Delete"},
        _default: {src: require('../assets/tick.svg'), text:""}
    }
  },
  mutations: {
    changeState(state, newState) {
      state.loadingState = newState;
    },
    clearPolledItems(state, feed) {
      state.feeds[feed].polledItems = [];
    },
    addPolledPage(state, pkg) {
      console.log("addPolledPage");
      state.feeds[pkg.feed].polled[pkg.page] = pkg.jsonData;
      if (pkg.jsonData !== undefined) {
        var items = pkg.jsonData.orderedItems || pkg.jsonData.items;
        items.forEach((item) => {
          // newest to oldest, but should be older than what's there already
          state.feeds[pkg.feed].polledItems.push(item);
        });
        state.feeds[pkg.feed].nextPage = pkg.jsonData.previous ? pkg.jsonData.previous.id : null;
      }
    },
    setNextPage(state, pkg) {
      state.feeds[pkg.feed].nextPage = pkg.url;
    },
    replaceStreamWithPolled(state, feed) {
      state.feeds[feed].stream = [];
      state.feeds[feed].polledItems.forEach((item) => {
        state.feeds[feed].stream.push(item);
      });
    },
    addNewToStream(state, pkg) {
      state.feeds[pkg.feed].stream.unshift(pkg.item);
    },
    trimStream(state, pkg) {
      state.feeds[pkg.feed].stream.splice(pkg.maxLength);
    },
    resetFeed(state, feed) {
      Vue.set(state.feeds, feed, {
        id: feed,
        stream: [],
        polled: {},
        polledItems: [],
        polling: false,
        nextPage: null
      } );
      
    }
  }
});