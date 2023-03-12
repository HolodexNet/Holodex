<template>
  <div>
    <template />
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{ ids: VideoRef[] }>();
const mentions = [];
//   backendApi
//     .getMentions(this.video.id)
//     .then(({ data }) => {
//       // this.isLoading = false;
//       this.mentions = data;
//     })
//     .catch((e) => {
//       console.error(e);
//       // this.hasError = true;
//     });
// deleteMention(channelId) {
//   backendApi
//     .deleteMentions(
//       this.video.id,
//       [channelId],
//       this.$store.state.userdata.jwt
//     )
//     .then(({ data }) => {
//       if (!data) return;
//       this.showSuccess("Successfully deleted mention");
//       this.updateMentions();
//     })
//     .catch((e) => {
//       this.showError(
//         (e.response && e.response.data.message) ||
//           e.message ||
//           "Error occured"
//       );
//     });
// },
// addMention(channelId) {
//   backendApi
//     .addMention(this.video.id, channelId, this.$store.state.userdata.jwt)
//     .then(({ data }) => {
//       if (!data) return;
//       this.updateMentions();
//     })
//     .catch((e) => {
//     });
// },
</script>

<style></style>
