<template>
<div class="container">
  <p class="feed-header">{{ getSummary }}</p>
  <transition-group enter-active-class="animated fadeInRight"
    leave-active-class="animated fadeOutLeft"
    mode="out-in"
    appear>
    <div class="panel panel-body" v-for="activityItem in activityStream()" :key="activityItem.id">
      <div class="row">
        <div :class="getClass(activityItem)"
             class="col-xs-12 col-sm-12 col-md-10 col-lg-10">
          <div class="row align-items-center">
            <div class="col-xs-4 col-sm-4 col-md-6 col-lg-6">
              <img :src="getIcon(activityItem)" :alt="getText(activityItem)"
              style="display: inline; width: 18px; height:15px;"> {{ activityItem.type }}
              <span v-if="activityItem.actor"> by </span>{{ activityItem.actor }}
              <span v-if="activityItem.published !== undefined" class="pubdate"> {{ formatDate(activityItem.published) }}</span>
            </div>
            <div class="col">
              <a :href="activityItem.object.id">Object <img :src="linkIcon" style="height: 1em; width: auto;"/></a>
            </div>
            <div class="col">
              <span class=""><a :href="activityItem.id">Event <img :src="linkIcon" style="height: 1em; width: auto;"/></a></span>
            </div>
            <div class="col">
              <button type="button"
              data-toggle="collapse"
              :data-target="'#itemdates'+activityItem.id.replace(/[^\w\s]/gi, '')"
              class="visible-xs visible-sm collapsed btn btn-light">Dates:</button>
            </div>
          </div>
          <div class="row">
            <div class="col">
              <ul class="col dates-block collapse small list-group list-group-flush" :id="'itemdates'+activityItem.id.replace(/[^\w\s]/gi, '')" >
                <li class="list-group-item" v-if="activityItem.created !== undefined">Created: {{ new Date(activityItem.created).toLocaleString() }}</li>
                <li class="list-group-item" v-if="activityItem.updated !== undefined">Updated: {{ new Date(activityItem.updated).toLocaleString() }}</li>
                <li class="list-group-item" v-if="activityItem.published !== undefined">Published: {{ new Date(activityItem.published).toLocaleString() }}</li>
              </ul>
            </div>
          </div>
        </div>
        <div class="row align-items-center">
          <div class="col-xs-12 col-sm-8 col-md-8 col-lg-8">
            <preview-item :url="activityItem.object.id"> </preview-item> 
          </div>
        </div>
      </div>
    </div>
  </transition-group>
</div>
</template>

<script>
  import { tickerBus } from '../main';
  import Preview from './Preview.vue';
  import extlinkIcon from "../assets/extlink.svg";

  export default {
    data() {
      return {
        head: {},
        summary: "",
        lastPage: "",
        items:[],
        nextPage:"",
        ready: false
      };
    },
    props: {
      feedName: {
        type: String,
        default: ''
      },
      itemMax: {
        type: Number,
        default: 200
      }
    },
    components: {
      previewItem: Preview
    },
    computed: {
      getSummary() {
        if (this.summary) {
          return this.summary;
        } else {
          return this.feedName;
        }
      },
      linkIcon() {
        return extlinkIcon;
      }
    },
    methods: {
      formatDate(dateString) {
        var d = new Date(dateString);
        return d.toLocaleTimeString() + " (" + d.toLocaleDateString() + ")";
      },
      getTopLevel() {
        console.log('Getting Top Level information');
        var jsondata;
        this.$http.get(this.feedName)
                    .then(response => {
                      return response.json();
                    })
                    .then((data) => {
                      console.log("Top level for "+this.feedName+" pulled.");
                      this.head = data;
                      this.lastPage = this.head.last.id;
                      this.summary = this.head.summary;
                      this.$store.state.feeds[this.feedName].nextPage = this.head.last.id;
                      console.log("Last page URL:  "+this.lastPage);
                      this.ready = true;
                      this.pollFeed();
                      }, error => {
                      console.log(error);
                      });
      },
      pollPage() {
        this.ready = false; // turn off event refresh listener
        var url = this.$store.state.feeds[this.feedName].nextPage;
        this.$store.commit('changeState', 'loading');
        console.log("pollPage " + url);
        this.$http.get(url)
        .then(response => {
          return response.json();
        }, error => {
          console.log(error);
        })
        .then((data) => {
          this.$store.commit('addPolledPage', {feed: this.feedName, page: url, jsonData: data});
          if (this.$store.state.feeds[this.feedName].polledItems.length <= this.itemMax && this.$store.state.feeds[this.feedName].nextPage !== null) {
            this.pollPage();
          } else {
            this.$store.commit('setNextPage', {feed: this.feedName, url: this.lastPage});  // reset to top
            this.buildFeed();
          }
        });
      },
      pollFeed() {
        if (this.ready) {
          console.log("Polling Feed");
          this.pollPage();
        }
      },
      buildFeed() {
          console.log("buildFeed " + this.feedName);
          var hit;
          var polledItems = this.$store.state.feeds[this.feedName].polledItems;
          var stream = this.$store.state.feeds[this.feedName].stream;
          let lastid = stream.length > 0 ? stream[0].id : null;
          if (lastid !== null) {
            polledItems.forEach((item, idx) => {
              if (item.id === lastid) {
                hit = idx;
              }
            });
            if (hit) {
              // snip the polledItems to just the newer ones
              var newitems = polledItems.splice(0, hit+1)
              newitems.reverse();
              console.log("Adding new items");
              newitems.forEach((newitem) => {
                // add these items in reverse order to front of the stream
                this.$store.commit('addNewToStream', {feed: this.feedName, item: newitem});
              });
            } else {
              // no match - new polled items are newer than oldest stream item
              this.$store.commit('replaceStreamWithPolled', this.feedName);
            }
          } else {
            console.log("Populating stream");
            this.$store.commit('replaceStreamWithPolled', this.feedName);
          }
          this.$store.commit('trimStream', {feed: this.feedName, maxLength: this.itemMax});
          this.ready = true; // ready for another refresh now
          this.$store.commit('changeState', 'done');
          setTimeout(() => {
            this.$store.commit('changeState', 'idle');
          }, 2000);   // change to idle after 2 seconds
      },
      getIcon(activity) {
        let iconsrc = this.$store.state.activities[activity.type]
        if (iconsrc) {
          return iconsrc.src;
        } else {
          return this.$store.state.activities["_default"].src
        }
      },
      getText(activity) {
        let iconsrc = this.$store.state.activities[activity.type]
        if (iconsrc) {
          return iconsrc.text;
        } else {
          return this.$store.state.activities["_default"].text;
        }
      },
      getClass(activity) {
        var activityAge = (new Date() - new Date(activity.published)) / 1000;  // don't like this not being global
        if (activityAge > 7*24*60*60) { // week old+
          return "activity-old activity-"+activity.type;
        } else if (activityAge > 24*60*60) { // day old+
          return "activity activity-"+activity.type;
        } else {
          return "activity-new activity-"+activity.type;
        }
      },
      activityStream() {
        return this.$store.state.feeds[this.feedName].stream;
      }
    },
    created() {
      console.log("Created " + this.feedName);
      this.$store.commit('resetFeed', this.feedName);
      this.getTopLevel();
      tickerBus.$on('pulse', () => {
        if (this.ready) {
          this.$store.commit('clearPolledItems', this.feedName);
          this.pollFeed();
        }
      })
      tickerBus.$on('rebuild', () => {
        if (this.ready) {
          this.buildFeed();
        }
      });
    }
  }
</script>

<style scoped>
.activity {
  font-size: 1em;
  border-bottom: thin solid black;
}
.activity-old {
  font-weight: normal;
  font-style: italic;
  font-size: small;
}
.activity-new {
  font-weight: bold;
  font-size: 1.1em;
}

.pubdate {
  font-size: 0.6em;
  font-style: italic;
}

/* Each activity will have an 'activity-ACTIVITYTYPE' class attached */
.activity-Create {
  background-color: lightcoral;
}
.activity-Delete {
  background-color: darkgrey;
  color: white;
}
.activity-Update {
  background-color: lightgrey;
}

.list-group-item {
  padding: 6px 10px;
}

@include media-breakpoint-up(md)
{
    .dates-block
    {
        display: block;
    }
}

@include media-breakpoint-up(sm)
{
    .feed-header
    {
        font-size: 0.2em;
    }
}
</style>
