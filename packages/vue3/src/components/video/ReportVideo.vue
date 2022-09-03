<template>
  <v-dialog v-model="showReportDialog" width="500">
    <div v-if="video" class="max-w-full p-2 md:p-4 card bg-bgColor-500">
      <div class="my-2 card-title">
        {{ $t("component.reportDialog.title") }}
      </div>
      <div :v-if="!isLoading">
        <v-alert v-model="error" dense type="error" dismissible>
          Error Occurred
        </v-alert>
        <span class="block rounded bg-bgColor-200">
          <span class="text-warning">{{ video.title }}</span>
          <br />
          {{ video.channel.name }}
        </span>
        <div class="mb-0 divider" />
        <template v-for="reason in reasons" :key="reason.value">
          <div class="form-control">
            <label class="cursor-pointer label">
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
          class="shadow-lg alert alert-warning"
        >
          <div>
            <svg class="flex-shrink-0 m-1 text-2xl i-wpf:faq" style=""></svg>
            <span class="text-sm">
              {{
                $t("component.reportDialog.collabing", {
                  org: site.currentOrg.name,
                })
              }}</span
            >
          </div>
        </div>

        <v-textarea
          v-model="comments"
          filled
          :label="$t('component.reportDialog.comments')"
          persistent-hint
          hint="* English / 日本語 / 繁體中文 OK"
          :error="comments.length < 5"
        />
      </div>

      <div class="flex flex-row-reverse gap-2">
        <div
          class="btn btn-outline btn-neutral"
          @click="showReportDialog = false"
        >
          {{ $t("views.app.close_btn") }}
        </div>
        <button
          class="btn btn-primary"
          :disabled="comments.length === 0"
          @click="sendReport"
        >
          {{ $t("views.multiview.confirmOverwriteYes") }}
        </button>
      </div>
    </div>
  </v-dialog>
  <v-snackbar v-model="showSnackbar" :timeout="3000" color="success">
    {{ $t("component.reportDialog.success") }}
    <template #action>
      <v-btn text class="ml-auto" @click="showSnackbar = false">
        {{ $t("views.app.close_btn") }}
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script lang="ts">
import { useGlobalReportState } from "@/stores/report";
import { useSiteStore } from "@/stores/site";
import backendApi from "@/utils/backend-api";

export default defineComponent({
  name: "ReportVideo",
  setup() {
    const store = useGlobalReportState();
    const site = useSiteStore();
    return { store, site };
  },
  data() {
    return {
      selectedReason: "Video tagged incorrectly",
      comments: "",
      isLoading: false,
      showSnackbar: false,
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
      if (this.selectedReason === "Other" && !this.comments.length) {
        this.error = true;
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
          this.showSnackbar = true;
          this.error = false;
        })
        .catch((e) => {
          console.error(e);
          this.error = true;
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
