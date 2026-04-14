import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import uz from "@/locales/uz/common.json";
import ru from "@/locales/ru/common.json";

export const supportedLangs = ["uz", "ru"] as const;
export type Lang = (typeof supportedLangs)[number];

export function isValidLang(lang: string): lang is Lang {
  return supportedLangs.includes(lang as Lang);
}

i18n.use(initReactI18next).init({
  resources: {
    uz: { translation: uz },
    ru: { translation: ru },
  },
  lng: "uz",
  fallbackLng: "uz",
  supportedLngs: ["uz", "ru"],
  interpolation: { escapeValue: false },
});

export default i18n;
