import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { CLINIC_PHONE_DISPLAY, CLINIC_PHONE_DISPLAY_2, CLINIC_EMAIL, CLINIC_ADDRESS } from "@/lib/contact";

export const Route = createFileRoute("/$lang/contact")({
  head: ({ params }) => {
    const isRu = params.lang === "ru";
    return {
      meta: [
        { title: isRu ? "Контакты — Yashfaa Clinic" : "Aloqa — Yashfaa Clinic" },
        { name: "description", content: isRu ? "Свяжитесь с Yashfaa Clinic. Адрес, телефон и время работы." : "Yashfaa Clinic bilan bog'laning. Manzil, telefon raqami va ish vaqti." },
        { rel: "alternate", hrefLang: "uz", href: "/uz/contact" },
        { rel: "alternate", hrefLang: "ru", href: "/ru/contact" },
      ],
    };
  },
  component: ContactPage,
});

function ContactPage() {
  const { t } = useTranslation();
  useLang();

  const contactInfo = [
    { icon: Phone, title: t("pages.phone"), lines: [CLINIC_PHONE_DISPLAY, CLINIC_PHONE_DISPLAY_2] },
    { icon: Mail, title: t("pages.email"), lines: [CLINIC_EMAIL] },
    { icon: MapPin, title: t("pages.address"), lines: [CLINIC_ADDRESS] },
    { icon: Clock, title: t("pages.schedule"), lines: ["Dush–Juma: 8:00–20:00", "Shanba: 9:00–16:00"] },
  ];

  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold md:text-4xl">{t("pages.contact_title")}</h1>
          <p className="mt-3 text-muted-foreground">{t("pages.contact_subtitle")}</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {contactInfo.map((item) => (
            <Card key={item.title}>
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary"><item.icon className="h-6 w-6" /></div>
                <h3 className="font-semibold">{item.title}</h3>
                {item.lines.map((line, i) => (<p key={i} className="mt-1 text-sm text-muted-foreground">{line}</p>))}
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="mt-12 overflow-hidden">
          <div className="aspect-[16/7]">
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2996.8!2d69.2787!3d41.3111!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDE4JzQwLjAiTiA2OcKwMTYnNDMuMyJF!5e0!3m2!1sen!2s!4v1" width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Yashfaa Clinic" />
          </div>
        </Card>
      </div>
    </section>
  );
}
