import en from "../locales/en.json";
// later:
// import hi from "./locales/hi.json";
// import mr from "./locales/mr.json";

const languages = {
  en,
  // hi,
  // mr,
};

export function t(lang, key) {
  return languages[lang]?.[key] || key;
}
