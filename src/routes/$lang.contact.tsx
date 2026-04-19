import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { CLINIC_PHONE_DISPLAY, CLINIC_PHONE_DISPLAY_2, CLINIC_EMAIL, CLINIC_ADDRESS, CLINIC_BRANCHES } from "@/lib/contact";
import { BranchesMap } from "@/components/BranchesMap";
import { EditableText } from "@/components/EditableText";
import { useSiteContent } from "@/hooks/useSiteContent";
import { buildMeta } from "@/lib/seo";

export const Route = createFileRoute("/$lang/contact")({
  head: ({ params }) => {
    const isRu = params.lang === "ru";
    const lang = (params.lang === "ru" ? "ru" : "uz") as "uz" | "ru";
    const title = isRu
      ? "Контакты Yashfaa Clinic — адрес и телефон в Ташкенте"
      : "Yashfaa Clinic aloqa — Toshkentdagi manzil va telefon";
    const description = isRu
      ? "Свяжитесь с Yashfaa Clinic в Ташкенте: адреса филиалов, телефоны, время работы и онлайн запись на приём."
      : "Yashfaa Clinic bilan Toshkentda bog'laning: filial manzillari, telefonlar, ish vaqti va onlayn qabulga yozilish.";
    return { meta: buildMeta({ title, description, pathWithoutLang: "/contact", lang }) };
  },
  component: ContactPage,
});

function ContactPage() {
  const { t, i18n } = useTranslation();
  useLang();
  const { get } = useSiteContent();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isRu = i18n.language === "ru";
  const branch1Name = isRu ? CLINIC_BRANCHES[0].name_ru : CLINIC_BRANCHES[0].name;
  const branch2Name = isRu ? CLINIC_BRANCHES[1].name_ru : CLINIC_BRANCHES[1].name;

  const scheduleItems = isRu
    ? [
        { key: "contact.hours.branch1.title", text: `${branch1Name}:` },
        { key: "contact.hours.branch1.weekdays", text: "Пн–Сб: 8:00–22:00" },
        { key: "contact.hours.branch1.sunday", text: "Вс: выходной" },
        { key: "__spacer1", text: "" },
        { key: "contact.hours.branch2.title", text: `${branch2Name}:` },
        { key: "contact.hours.branch2.weekdays", text: "Пн–Пт: 8:00–22:00" },
        { key: "contact.hours.branch2.saturday", text: "Сб: выходной" },
        { key: "contact.hours.branch2.sunday", text: "Вс: 8:00–14:00" },
      ]
    : [
        { key: "contact.hours.branch1.title", text: `${branch1Name}:` },
        { key: "contact.hours.branch1.weekdays", text: "Dush–Shan: 8:00–22:00" },
        { key: "contact.hours.branch1.sunday", text: "Yakshanba: dam olish" },
        { key: "__spacer1", text: "" },
        { key: "contact.hours.branch2.title", text: `${branch2Name}:` },
        { key: "contact.hours.branch2.weekdays", text: "Dush–Juma: 8:00–22:00" },
        { key: "contact.hours.branch2.saturday", text: "Shanba: dam olish" },
        { key: "contact.hours.branch2.sunday", text: "Yakshanba: 8:00–14:00" },
      ];

  const contactInfo = [
    { icon: Phone, title: t("pages.phone"), lines: [{ key: "__phone1", text: CLINIC_PHONE_DISPLAY }, { key: "__phone2", text: CLINIC_PHONE_DISPLAY_2 }] },
    { icon: Mail, title: t("pages.email"), lines: [{ key: "__email", text: CLINIC_EMAIL }] },
    { icon: MapPin, title: t("pages.address"), lines: [{ key: "__address", text: CLINIC_ADDRESS }] },
    { icon: Clock, title: t("pages.schedule"), lines: scheduleItems },
  ];

  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold md:text-4xl">
            <EditableText contentKey="contact.title" fallback={get("contact.title", t("pages.contact_title"))}>
              {get("contact.title", t("pages.contact_title"))}
            </EditableText>
          </h1>
          <p className="mt-3 text-muted-foreground">
            <EditableText contentKey="contact.subtitle" fallback={get("contact.subtitle", t("pages.contact_subtitle"))} multiline>
              {get("contact.subtitle", t("pages.contact_subtitle"))}
            </EditableText>
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {contactInfo.map((item) => (
            <Card key={item.title}>
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary"><item.icon className="h-6 w-6" /></div>
                <h3 className="font-semibold">{item.title}</h3>
                {item.lines.map((line, i) => {
                  if (line.text === "") return <div key={i} className="h-2" />;
                  const isHeader = line.text.endsWith(":");
                  const isEditable = !line.key.startsWith("__");
                  const className = isHeader
                    ? "mt-2 text-sm font-semibold text-foreground"
                    : "mt-0.5 text-sm text-muted-foreground";
                  return (
                    <p key={i} className={className}>
                      {isEditable ? (
                        <EditableText contentKey={line.key} fallback={get(line.key, line.text)}>
                          {get(line.key, line.text)}
                        </EditableText>
                      ) : (
                        line.text
                      )}
                    </p>
                  );
                })}
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
