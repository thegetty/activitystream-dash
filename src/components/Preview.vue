<template>
  <span>
    <button class="btn btn-info btn-sm preview-button" @click="previewToggle">{{ toggleText }}</button>
    <div v-if="visiblePreview">
      <div v-if="jsonData !== undefined" class="card">
        <div class="card-body">
          <h5 class="card-title">{{ this.jsonData._label }}</h5>
          <p class="card-text small">Type: {{ this.jsonData.type }} - <a :href="jsonData.id">(item)</a></p>
          <ul>
            <li v-for="ident in jsonData.identified_by"><a :href="ident.id">{{ ident._label }} ({{ident.type}}): {{ident.content}}</a></li>
          </ul>
        </div>
      </div>
      <div v-else>
        <div style="height: 20px" class="text-center"><img src="/static/ajax-loader.gif" alt="Loading"></div>
      </div>
    </div>
  </span>
</template>

<script>
  export default {
    props: ['url'],
    data() {
      return {
        status: 'hide',
        jsonData: undefined,
        visiblePreview: false
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
      }
    },
    computed: {
      toggleText() {
        if (this.visiblePreview) {
          return "Hide Preview";
        } else {
          return "Preview";
        }
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

</style>