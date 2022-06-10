import { loadLocaleMessages, setI18nLanguage } from "@/setup/setupI18N";
import { useLangStore } from "@/stores/lang";
import { useI18n } from "vue-i18n";

export function useI18nInitialization() {
    const store = useLangStore();
    const { lang } = storeToRefs(store);
    const i18n = useI18n({ useScope: 'global' });

    // initialize language at manager loading
    loadLocaleMessages(i18n, lang.value).then(() => {
        setI18nLanguage(i18n, lang.value);
    })

    watch(lang, async (v, old) => {
        // language changed.
        await loadLocaleMessages(i18n, lang.value);
        setI18nLanguage(i18n, lang.value);
    })


    return { store }
}