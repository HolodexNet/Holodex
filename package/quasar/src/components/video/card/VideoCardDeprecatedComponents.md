Active Item Reordering behavior should be extracted

```html
<!-- <v-list-item-action v-if="!!$slots.action || activePlaylistItem" class="video-card-item-actions">
      <template v-if="activePlaylistItem">
        <button @click.stop.prevent="move(data.id, 'up')">
          <v-icon small> {{ icons.mdiChevronUp }} </v-icon>
        </button>
        <button
          @click.stop.prevent="playlistStore.removeVideoByID(data.id) "
        >
          <v-icon small> {{ icons.mdiDelete }} </v-icon>
        </button>
        <button @click.stop.prevent="move(data.id, 'down')">
          <v-icon small> {{ icons.mdiChevronDown }} </v-icon>
        </button>
      </template>
      <slot name="action" />
    </v-list-item-action>-->
```

Placeholder behavior should be extracted.

```html
<!-- <placeholder-card v-if="placeholderOpen" v-model="placeholderOpen" :video="data" /> -->
```
