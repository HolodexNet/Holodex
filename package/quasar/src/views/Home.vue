<template>
  <p v-for="n in 15" :key="n">
    Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugit nihil
    praesentium molestias a adipisci, dolore vitae odit, quidem consequatur
    optio voluptates asperiores pariatur eos numquam rerum delectus commodi
    perferendis voluptate?
  </p>


  <v-card width="400">
    <v-card-header>
      <v-card-header-text>
        <v-card-title>This is a title</v-card-title>
        <v-card-subtitle>This is a subtitle</v-card-subtitle>
      </v-card-header-text>
    </v-card-header>

    <v-card-text>
      This is content
      <v-chip class="ma-2">
        Default
      </v-chip>

      <v-chip class="ma-2" color="primary">
        Primary
      </v-chip>

      <v-chip class="ma-2" color="secondary">
        Secondary
      </v-chip>

      <v-chip class="ma-2" color="pink" label text-color="white">
        <v-icon start icon="mdi-label"></v-icon>
        Tags
      </v-chip>

      <v-chip class="ma-2" color="green" text-color="white">
        Green Chip
      </v-chip>
      <hr />
      <div class="avatar online">
        <div class="w-24 rounded-full">
          <img src="https://api.lorem.space/image/face?hash=28212" />
        </div>
      </div>
      <div class="avatar rounded-full ring ring-error ring-offset-base-100 ring-offset-2 ml-4">
        <div class="w-24 rounded-full">
          <img src="https://api.lorem.space/image/face?hash=40361" />
        </div>
      </div>
    </v-card-text>
    <v-card-actions>
      <div class="btn-group">
        <button class="btn btn-active">Button</button>
        <button class="btn">Button</button>
        <button class="btn">Button</button>
      </div>
    </v-card-actions>
  </v-card>
</template>
