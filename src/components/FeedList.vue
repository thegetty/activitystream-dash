<template>
  <feed-display></feed-display>
</template>

<script>
  import FeedDisplay from '@/components/FeedDisplay.vue';

  export default {
    props: ['feedlist'],
    components: {
      feedDisplay: FeedDisplay
    }
  }
</script>