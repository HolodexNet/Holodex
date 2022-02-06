module.exports = {
  moduleFileExtensions: [
    'js',
    'ts',
    'json',
    'vue'
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  transform: {
    '^.+\\.[tj]s$': 'esbuild-jest',
    '^.+\\.vue$': '@vue/vue2-jest'
  }
}
