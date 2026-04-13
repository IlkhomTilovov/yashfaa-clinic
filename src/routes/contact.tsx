import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Aloqa — MedClinic" },
      { name: "description", content: "MedClinic bilan bog'laning. Manzil, telefon raqami va ish vaqti." },
      { property: "og:title", content: "Aloqa — MedClinic" },
      { property: "og:description", content: "MedClinic manzili, telefon raqami va ish vaqti." },
    ],
  }),
  component: ContactPage,
});

const contactInfo = [
  { icon: Phone, title: "Telefon", lines: ["+998 71 123 45 67", "+998 90 987 65 43"] },
  { icon: Mail, title: "Email", lines: ["info@medclinic.uz", "support@medclinic.uz"] },
  { icon: MapPin, title: "Manzil", lines: ["Toshkent sh., Amir Temur ko'chasi, 10-uy", "Mo'ljal: Amir Temur haykali yonida"] },
  { icon: Clock, title: "Ish vaqti", lines: ["Dush–Juma: 8:00–20:00", "Shanba: 9:00–16:00", "Yakshanba: Dam olish"] },
];

function ContactPage() {
  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold md:text-4xl">Biz bilan bog'laning</h1>
          <p className="mt-3 text-muted-foreground">
            Savollaringiz bo'lsa, biz bilan bog'laning yoki klinikamizga tashrif buyuring
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {contactInfo.map((item) => (
            <Card key={item.title}>
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold">{item.title}</h3>
                {item.lines.map((line, i) => (
                  <p key={i} className="mt-1 text-sm text-muted-foreground">{line}</p>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Google Maps */}
        <Card className="mt-12 overflow-hidden">
          <div className="aspect-[16/7]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2996.8!2d69.2787!3d41.3111!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDE4JzQwLjAiTiA2OcKwMTYnNDMuMyJF!5e0!3m2!1sen!2s!4v1"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="MedClinic joylashuvi"
            />
          </div>
        </Card>
      </div>
    </section>
  );
}
