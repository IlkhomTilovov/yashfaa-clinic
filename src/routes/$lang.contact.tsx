import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { CLINIC_PHONE_DISPLAY, CLINIC_PHONE_DISPLAY_2, CLINIC_EMAIL, CLINIC_ADDRESS, CLINIC_BRANCHES } from "@/lib/contact";
import { BranchesMap } from "@/components/BranchesMap";

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

        <div className="mt-12">
          {mounted ? (
            <BranchesMap />
          ) : (
            <div className="h-[450px] rounded-xl border bg-muted" />
          )}
        </div>
      </div>
    </section>
  );
}
