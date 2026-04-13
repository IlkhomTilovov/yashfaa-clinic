import { Link } from "@tanstack/react-router";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* About */}
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                Y
              </div>
              <span className="text-lg font-bold">Yashfaa Clinic</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Zamonaviy tibbiy xizmatlar. Tajribali shifokorlar jamoasi siz va
              oilangiz salomatligi uchun xizmat qiladi.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="mb-3 font-semibold">Tezkor havolalar</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/services" className="hover:text-primary">Xizmatlar</Link></li>
              <li><Link to="/doctors" className="hover:text-primary">Shifokorlar</Link></li>
              <li><Link to="/tests" className="hover:text-primary">Tahlillar</Link></li>
              <li><Link to="/appointment" className="hover:text-primary">Qabulga yozilish</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-3 font-semibold">Aloqa</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                +998 71 123 45 67
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                info@yashfaa.uz
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                Toshkent sh., Amir Temur ko'chasi, 10-uy
              </li>
            </ul>
          </div>

          {/* Working hours */}
          <div>
            <h3 className="mb-3 font-semibold">Ish vaqti</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Dush–Juma: 8:00–20:00
              </li>
              <li className="pl-6">Shanba: 9:00–16:00</li>
              <li className="pl-6">Yakshanba: Dam olish</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Yashfaa Clinic. Barcha huquqlar himoyalangan.
        </div>
      </div>
    </footer>
  );
}
