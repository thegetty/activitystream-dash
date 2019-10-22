<template>
  <span>
    <button class="btn btn-info btn-sm preview-button" @click="previewToggle">{{ toggleText }}</button>
    <div v-if="visiblePreview">
      <div v-if="jsonData !== undefined" class="card" style="width: auto;">
        <div class="card-header card-title">
          <h6 v-if="getWebpage(jsonData)"><a :href="getWebpage(jsonData)">{{ jsonData._label }}</a></h6>
          <h6 v-else>{{ jsonData._label }}</h6>
        </div>
        <div class="card-body">
          <ul class="link-group link-group-flush">
            <li class="list-group-item" v-for="ident in jsonData.identified_by">{{ ident._label }} ({{ident.type}}): {{ident.content}}
<!--               <ul v-if="ident.classified_as !== undefined">
                <li v-for="classflinks in ident.classified_as"><a :href="classflinks.id">{{ classflinks._label }} </a><em>
                  {{ vocabFlavour(classflinks.id) }}
                </em></li>
              </ul> -->
            </li>
          </ul>
          Classified as:
          <ul v-if="jsonData.classified_as !== undefined">
            <li v-for="classflinks in jsonData.classified_as"><a :href="classflinks.id">{{ labelOrLink(classflinks) }} </a><em>
              {{ vocabFlavour(classflinks.id) }}
            </em></li>
          </ul>
        </div>
      </div>
      <div v-else>
        <div style="height: 20px" class="text-center"><img :src="loadIcon" alt="Loading"></div>
      </div>
    </div>
  </span>
</template>

<script>
import loadingIcon from "../assets/ajax-loader.gif";

  export default {
    props: ['url'],
    data() {
      return {
        status: 'hide',
        jsonData: undefined,
        visiblePreview: false,
        vocabs: {
          "http://vocab.getty.edu/aat": "(AAT)"
        }
      };
    },
    methods: {
      previewToggle() {
        if (!this.visiblePreview) {
          this.loadPreview();
        }
        this.visiblePreview = !this.visiblePreview;
      },
      loadPreview() {
        console.log('Getting Item information');
        this.$http.get(this.url)
                    .then(response => {
                      return response.json();
                    })
                    .then((data) => {
                      this.jsonData = data;
                      this.status = 'done';
                      }, error => {
                      console.log(error);
                      });
      },
      vocabFlavour(subjURI) {
        var vocabLabel = "";
        Object.keys(this.vocabs).forEach((vk) => {
          if (subjURI.startsWith(vk)) {
            vocabLabel = this.vocabs[vk];
          }
        })
        return vocabLabel;
      },
      labelOrLink(node) {
        if (node._label !== undefined && node._label) {
          return node._label;
        } else {
          return node.id;
        }
      },
      getWebpage(node) {
        var htmlrep = false;
        var lastPts = 0;
        var currentBestUrl = "";
        if (node.subject_of !== undefined) {
          node.subject_of.forEach((subjofNode) => {
            var pts = 0
            if (subjofNode.format === "text/html") {
              pts += 3;
            }
            
            if (subjofNode.type === "LinguisticObject") {
              pts += 2;
            }

            if (subjofNode.classified_as !== undefined) {
              subjofNode.classified_as.forEach((cfAs) => {
                if (cfAs._label.toLowerCase() === "web page") {
                  pts += 1;
                }
                if (cfAs._label.toLowerCase() === "primary") {
                  pts += 2;
                }
                if (cfAs.id === "http://vocab.getty.edu/aat/300264578") { // Web page
                  pts += 1;
                }
                if (cfAs.id === "http://vocab.getty.edu/aat/300404670") { // Primary
                  pts += 3;
                }
              })
            }
            console.log(subjofNode.id + " ===> " + pts + " pts.");
            if (pts > lastPts) {
              currentBestUrl = subjofNode.id;
              lastPts = pts;
            }
          })

          if (lastPts >= 5) {
            htmlrep = currentBestUrl;
          }
        }
        return htmlrep;
      }
    },
    computed: {
      toggleText() {
        if (this.visiblePreview) {
          return "Hide Preview";
        } else {
          return "Preview";
        }
      },
      loadIcon() {
        return loadingIcon;
      }
    }
  }
</script>

<style scoped>
  .preview-button {
    padding: 0.2em 0.1em;
    margin: 0.2em 0.1em;
  }

  .card {
    font-size: smaller;
  }

  .list-group-item {
    padding: 6px 10px;
  }

</style>