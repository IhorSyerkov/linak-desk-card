import * as en from './languages/en.json';
import * as uk from './languages/uk.json';
import * as de from './languages/de.json';
import * as fr from './languages/fr.json';
import * as pl from './languages/pl.json';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const languages: any = {
  en,
  uk,
  de,
  fr,
  pl,
  nl,
};

export function localize(string: string, search = '', replace = ''): string {
  const lang = (localStorage.getItem('selectedLanguage') || 'en').replace(/['"]+/g, '').replace('-', '_');

  let translated: string;

  try {
    translated = string.split('.').reduce((o, i) => o[i], languages[lang]);
  } catch (e) {
    translated = string.split('.').reduce((o, i) => o[i], languages['en']);
  }

  if (translated === undefined) {
    translated = string.split('.').reduce((o, i) => o[i], languages['en']);
  }

  if (search !== '' && replace !== '') {
    translated = translated.replace(search, replace);
  }
  return translated;
}
