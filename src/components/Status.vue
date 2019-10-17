<template>
  <span>
  Getty Feeds
        <img :src="imageSrc" style="width:18px; height:15px;" v-if="inProgress"/>
        <span style="width:18px; height:15px; padding-bottom: 15px; padding-right: 14px;" v-else>&nbsp;</span>
  </span>
</template>

<script>
  export default {
    props: ['icons'],
    computed: {
      imageSrc() {
        return this.icons[this.$store.state.loadingState].src;
      },
      inProgress() {
        return this.$store.state.loadingState !== "idle";
      }
    }
  }
</script>