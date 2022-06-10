import { langs, SupportedLangCodes } from '../i18nConsts';
import { LanguageUtil } from './langUtil'
import navigator from './detectors/navigator'
import querystring from './detectors/querystring'

export function guessUserLanguage(checkOnlyQueryString: boolean, defaultLang?: SupportedLangCodes): SupportedLangCodes {
    const qsCode = querystring.lookup({ lookupQuerystring: 'lang' });
    const browserCode = checkOnlyQueryString ? undefined : navigator.lookup();

    const code = qsCode || browserCode || defaultLang || 'en'

    const supportedLngs = langs.map(x => x.val);

    const bestCode = new LanguageUtil({ supportedLngs, nonExplicitSupportedLngs: false, fallbackLng: ['en'] }).getBestMatchFromCodes([code])

    if (supportedLngs.includes(bestCode as any))
        return bestCode as any;
    else return defaultLang || 'en'
}

