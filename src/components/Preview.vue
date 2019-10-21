<template>
  <span>
    <button class="btn btn-info btn-sm preview-button" @click="previewToggle">{{ toggleText }}</button>
    <div v-if="visiblePreview">
      <div v-if="jsonData !== undefined" class="card" style="width: auto;">
        <div class="card-header card-title">
          <h6>{{ this.jsonData._label }} "{{ this.jsonData.type }}" - <a :href="jsonData.id">(item)</a></h6>
        </div>
        <div class="card-body">
          <ul class="link-group link-group-flush">
            <li class="list-group-item" v-for="ident in jsonData.identified_by">{{ ident._label }} ({{ident.type}}): {{ident.content}}
              <ul v-if="ident.classified_as !== undefined">
                <li v-for="classflinks in ident.classified_as"><a :href="classflinks.id">{{ classflinks._label }} </a><em>
                  {{ vocabFlavour(classflinks.id) }}
                </em></li>
              </ul>
            </li>
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