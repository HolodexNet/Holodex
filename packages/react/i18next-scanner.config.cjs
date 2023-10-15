const fs = require("fs");

module.exports = {
  input: ["dist/tmp/**/*.{js,jsx}"],
  options: {
    debug: true,
    removeUnusedKeys: true,
    func: {
      list: ["t", "i18n.t"],
      extensions: [".js", ".jsx"],
    },
    trans: {
      component: "Trans",
      i18nKey: "i18nKey",
      extensions: [".js", ".jsx"],
      acorn: {
        ecmaVersion: 2020,
        sourceType: "module", // defaults to 'module'
        // Check out https://github.com/acornjs/acorn/tree/master/acorn#interface for additional options
      },
    },
    lngs: [
      "en",
      // "ja",
      // "zh",
      // "ko",
      // "es",
      // "ms",
      // "id",
      // "ru",
      // "it",
      // "hu",
      // "tr",
      // "vi",
      // "de",
    ],
    ns: ["translation"],
    defaultLng: "en",
    defaultNs: "translation",
    resource: {
      loadPath: "./public/locales/{{lng}}/{{ns}}.json",
      savePath: "./public/locales/{{lng}}/{{ns}}.json",
      jsonIndent: 2,
      // lineEnding: "\n",
    },
    nsSeparator: false, // namespace separator
    keySeparator: false, // key separator
    interpolation: {
      prefix: "{{",
      suffix: "}}",
    },
  },
  transform: function customTransform(file, enc, done) {
    const parser = this.parser;
    const content = fs.readFileSync(file.path, enc);
    const dateDefaults = {
      "NO_TL.absoluteDate": "{{date, absolute}}",
      "NO_TL.longDate": "{{date, long}}",
      "NO_TL.relativeDate": "{{date, ago}}",
      "NO_TL.shortDate": "{{date, short}}",
      "NO_TL.shortDateTime": "{{date, datetime}}",
    };
    parser.parseFuncFromString(content, function (key, options) {
      if (dateDefaults[key]) {
        options.defaultValue = dateDefaults[key];
      } else {
        options.defaultValue = key; // use key as the value
      }
      parser.set(key, options);
    });
    done();
  },
};
