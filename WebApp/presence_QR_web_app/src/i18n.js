import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    fallbackLng: "en", // use en if detected lng is not available
    keySeparator: false, // we do not use keys in form messages.welcome
    saveMissing: false, // send not translated keys to endpoint
    load: "languageOnly",
    interpolation: {
      escapeValue: false // react already safes from xss
    },
    ns: ["default", "loginPage", "mainPage", "manageUsersMenu", "addUser", "displayListOfUsers", "editUser", "importUsers", "exportUsers", "settings", "passwordRecovery"],
    defaultNS: "default",
    // react-i18next options
    react: {
      useSuspense: false,
      wait: true
    },
    loadPath: "./../public/locales/{{lng}}/{{ns}}.json"
  });
export default i18n;
