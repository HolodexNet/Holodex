import type { IMigration } from "vuex-persistedstate-migrate";
import v2 from "./v2-20210521-default-open";
import v4 from "./v4-20210525-delete-org";
import v5 from "./v5-20210621-library-to-playlist";
import v6 from "./v6-20210711-serverside-org";
import v7 from "./v7-20210713-try-resetting-org";
import v8 from "./v8-20210714-multiview-content-reset";
import v9 from "./v9-2021097-mv-defaults";

export const migrations: IMigration[] = [v2, v4, v5, v6, v7, v8, v9];

export const VUEX_STATE_VERSION = 9;
