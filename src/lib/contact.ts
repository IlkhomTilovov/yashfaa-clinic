// Centralized clinic contact info - update here to change everywhere
export const CLINIC_PHONE_DISPLAY = "+998 95 144 05 50";
export const CLINIC_PHONE_TEL = "+998951440550";
export const CLINIC_PHONE_DISPLAY_2 = "+998 95 194 05 50";
export const CLINIC_PHONE_TEL_2 = "+998951940550";
export const CLINIC_EMAIL = "yashfaaclinicuz@gmail.com";
export const CLINIC_ADDRESS = "Toshkent viloyati, Qibray tumani, Universitet ko'chasi, 17-uy";
export const CLINIC_TELEGRAM = "https://t.me/yashfaa_clinic";
export const CLINIC_INSTAGRAM = "https://instagram.com/yashfaa_clinic";
export const CLINIC_FACEBOOK = "https://facebook.com/yashfaa_clinic";

// Branches with map coordinates
export type Branch = {
  name: string;
  name_ru: string;
  address: string;
  address_ru: string;
  phone: string;
  phoneTel: string;
  lat: number;
  lng: number;
};

export const CLINIC_BRANCHES: Branch[] = [
  {
    name: "Asosiy filial",
    name_ru: "Главный филиал",
    address: "Toshkent viloyati, Qibray tumani, Universitet ko'chasi, 17-uy",
    address_ru: "Ташкентская обл., Кибрайский р-н, ул. Университет, 17",
    phone: CLINIC_PHONE_DISPLAY,
    phoneTel: CLINIC_PHONE_TEL,
    lat: 41.3775,
    lng: 69.3886,
  },
  {
    name: "2-filial",
    name_ru: "Филиал №2",
    address: "Toshkent sh., Feruza ko'chasi",
    address_ru: "г. Ташкент, ул. Феруза",
    phone: CLINIC_PHONE_DISPLAY_2,
    phoneTel: CLINIC_PHONE_TEL_2,
    lat: 41.354025,
    lng: 69.356171,
  },
];


