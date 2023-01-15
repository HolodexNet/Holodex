<template>
  <input ref="input" type="text" name="mcu" />
</template>
<script setup lang="ts">
import Tagify from "@yaireo/tagify";
import tag from "./templates/tag";
import { Ref } from "vue";
// import "@yaireo/tagify/dist/tagify.css";

const input = ref<HTMLInputElement | HTMLTextAreaElement | null>(null);
const tagify: Ref<Tagify | undefined> = ref(undefined);

onMounted(() => {
  if (input.value) {
    tagify.value = new Tagify(input.value, {
      //   whitelist: this.mcuHeros,
      whitelist: ["channel:", "org:"],
      enforceWhitelist: false,
      dropdown: {
        enabled: 0, // always show dropdown on focus.
      },
      autoComplete: {
        enabled: true,
      },
      editTags: {
        clicks: 1,
      },
      mode: "select",
      templates: {
        dropdownItemNoMatch() {
          return `<div class='empty'>Nothing Found</div>`;
        },
        tag,
        dropdownFooter(suggestions) {
          const hasMore = suggestions.length - this.settings.dropdown.maxItems;

          return hasMore > 0
            ? `<footer data-selector='tagify-suggestions-footer' class="${this.settings.classNames.dropdownFooter}">
            ${hasMore} more items. Refine your search.
          </footer>`
            : "";
        },
      },
    });
    tagify.value
      .on("add", function (e) {
        console.log(e.detail.data);
      })
      .on("keydown", function () {
        // todo
      })
      .on("edit:start", function () {
        // todo
      })
      .on("edit:input", function () {
        // todo
      });
  } else {
    console.error("Tagify input is not mounted properly?");
  }
});
</script>
<style lang="scss">
$tags-border-color: hsla(var(--n), 0);
$tags-hover-border-color: hsla(var(--nf), 0.5);
$tags-focus-border-color: hsla(var(--nf), 0);

$placeholder-color: hsla(var(--nc) 0.4);
$placeholder-color-focus: hsla(var(--nc), 0.25);

$input-color: hsl(var(--ac));

$tag-bg: hsl(var(--b1-200));
$tag-hover: hsl(var(--b1-100));
$tag-remove: #fa8888;
// $tag-remove-btn-bg--hover: hsla(var(--wac), 0.3);
// $tag-invalid-bg: hsla(var(--wac), 0.5);

$tag-text-color: hsl(var(--ac));
$tag-text-color--edit: hsl(var(--ac));

@import "@yaireo/tagify/src/tagify.scss";

:root {
  --tagify-dd-color-primary: rgb(
    53,
    149,
    246
  ); // should be same as "$tags-focus-border-color"
  --tagify-dd-bg-color: hsl(var(--b1));
}

.tagify {
  // $tag-remove-bg: hsla(var(--wac), 0.3);

  /* width: 250px; */
  flex-grow: 1;
  max-width: 100%;
  /* Add These: */
  overflow: auto;
  flex-wrap: unset;
}
</style>
