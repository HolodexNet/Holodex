<template>
  <div
    class="flex items-center justify-center"
    style="height: calc(100vh - 80px)"
  >
    <div class="card flex max-w-xs flex-col items-stretch gap-4 p-2">
      <h-icon class="i-mdi:data-matrix-scan h-20 w-20 shrink-0 opacity-50" />
      <p>
        We will collect debug information about your browser.
        <br />
        Please submit the results in the Holodex Discord Mail-A-Admin ticket or
        Twitter DM to the Holodex twitter.
      </p>
      <h-btn class="btn-success btn-lg" no-color to="/debug/run">OK</h-btn>
    </div>
  </div>
</template>
