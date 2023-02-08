<template>
  <v-dialog v-model="showReportDialog" width="500">
    <div v-if="video" class="card max-w-full bg-bgColor-500 p-2 md:p-4">
      <div class="card-title my-2">
        {{ $t("component.reportDialog.title") }}
      </div>
      <div :v-if="!isLoading">
        <span class="block rounded bg-bgColor-200">
          <span class="text-warning">{{ video.title }}</span>
          <br />
          {{ video.channel.name }}
        </span>
        <div class="divider mb-0" />
        <template v-for="reason in reasons" :key="reason.value">
          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">{{ reason.text }}</span>
              <input
                v-model="selectedReason"
                type="radio"
                name="report-radio"
                class="radio checked:bg-red-500"
                :value="reason.value"
              />
            </label>
          </div>
        </template>
        <div
          v-if="selectedReason == 'Wrong Category'"
          class="alert alert-warning shadow-lg"
        >
          <div>
            <svg class="i-wpf:faq m-1 flex-shrink-0 text-2xl" style="" />
            <span class="text-sm">
              {{
                $t("component.reportDialog.collabing", {
                  org: site.currentOrg.name,
                })
              }}
            </span>
          </div>
        </div>

        <h-input
          v-model="comments"
          as="textarea"
          :title="$t('channelRequest.Comments')"
          :explanation="
            $t('component.reportDialog.comments') +
            ' (* English / 日本語 / 繁體中文 OK)'
          "
          placeholder=""
          class="h-40"
        />
      </div>

      <div class="flex flex-row-reverse gap-2">
        <div
          class="btn-neutral btn-outline btn"
          @click="showReportDialog = false"
        >
          {{ $t("views.app.close_btn") }}
        </div>
        <button
          class="btn-primary btn"
          :disabled="comments.length === 0"
          @click="sendReport"
        >
          {{ $t("views.multiview.confirmOverwriteYes") }}
        </button>
      </div>
    </div>
  </v-dialog>
</template>

<script lang="ts">
import { useGlobalReportState } from "@/stores/report";
import { useSiteStore } from "@/stores/site";
import backendApi from "@/utils/backend-api";
import { useToast } from "vue-toast-notification";

export default defineComponent({
  name: "ReportVideo",
  setup() {
    const store = useGlobalReportState();
    const site = useSiteStore();
    const { open: toast } = useToast();

    return { store, site, toast };
  },
  data() {
    return {
      selectedReason: "Video tagged incorrectly",
      comments: "",
      isLoading: false,
      error: false,
      readMore: false,
    };
  },
  computed: {
    reasons() {
      return [
        {
          text: this.$t("component.reportDialog.reasons[4]"),
          value: "Wrong Category",
        },
        {
          text: this.$t("component.reportDialog.reasons[0]"),
          value: "Video tagged incorrectly",
        },
        {
          text: this.$t("component.reportDialog.reasons[1]"),
          value: "Low Quality/Misleading Content",
        },
        {
          text: this.$t("component.reportDialog.reasons[2]"),
          value:
            "Violates the org's derivative work guidelines or inappropriate",
        },
        {
          text: this.$t("component.reportDialog.reasons[3]"),
          value: "Other",
        },
      ];
    },
    video() {
      return this.store.reportedVideo.value;
    },
    user() {
      return this.site.user;
    },
    showReportDialog: {
      get() {
        return !!this.store.reportedVideo.value;
      },
      set(val: boolean) {
        if (!val) this.store.reportedVideo.value = undefined;
      },
    },
  },
  methods: {
    sendReport() {
      if (!this.comments.length && this.comments.length < 8) {
        this.toast({
          //   TODO: i18n
          message: "Please provide some more details.",
          type: "error",
          duration: 2500,
          position: "bottom",
        });

        return;
      }
      this.isLoading = true;
      backendApi
        .reportVideo(
          this.video?.id || "no-id",
          [
            {
              name: "Reason",
              value: this.selectedReason,
            },
            {
              name: "Comments",
              value: this.comments ? this.comments : "No comment",
            },
          ],
          this.site.jwtToken || ""
        )
        .then(() => {
          this.showReportDialog = false;

          this.toast({
            message: this.$t("component.reportDialog.success"),
            type: "success",
            duration: 3000,
            position: "bottom",
          });
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
  },
});
</script>

<style scoped>
.radio {
  border-style: solid;
}
</style>
