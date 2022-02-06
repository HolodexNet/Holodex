import { expect } from "chai";
import { shallowMount } from "@vue/test-utils";
import music from "@/store/music.module";
import watch from "@/store/watch.module";
import Stats from "@/components/common/Stats.vue";
import SearchBar from "@/components/common/SearchBar.vue";

describe("example", () => {
  it("should test stuff", () => {
    const wrapper = shallowMount(SearchBar, {
      mocks: {
        $store: {
          state: {
            blargh: "honk",
          },
        },
        $route: {},
        $t: () => {},
      },
    });

    expect(SearchBar.data().isLoading).to.equal(false);
    expect(music.mutations.openBar).to.be.a("function");
  });
});
