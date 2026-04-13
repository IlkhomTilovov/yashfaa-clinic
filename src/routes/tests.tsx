import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getTests, getCategories } from "@/lib/server-functions";

export const Route = createFileRoute("/tests")({
  head: () => ({
    meta: [
      { title: "Tahlillar va narxlar — MedClinic" },
      { name: "description", content: "MedClinic laboratoriya tahlillari, diagnostika va kosmetologiya xizmatlari narxlari." },
      { property: "og:title", content: "Tahlillar va narxlar — MedClinic" },
      { property: "og:description", content: "Laboratoriya tahlillari, diagnostika va kosmetologiya narxlari." },
    ],
  }),
  loader: async () => {
    const [tests, categories] = await Promise.all([getTests(), getCategories()]);
    return { tests, categories };
  },
  component: TestsPage,
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="px-4 py-16 text-center">
        <h2 className="text-2xl font-bold">Xatolik yuz berdi</h2>
        <p className="mt-2 text-muted-foreground">{error.message}</p>
        <Button className="mt-4" onClick={() => { router.invalidate(); reset(); }}>Qayta urinish</Button>
      </div>
    );
  },
  pendingComponent: () => (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-5xl space-y-4">
        <Skeleton className="mx-auto h-10 w-64" />
        <Skeleton className="h-10 w-full" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </section>
  ),
});

function formatPrice(price: number) {
  return new Intl.NumberFormat("uz-UZ").format(price) + " so'm";
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function TestsPage() {
  const { tests, categories } = Route.useLoaderData();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const filtered = useMemo(() => tests.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesCategory = !activeCategory || t.category_id === activeCategory;
    return matchesSearch && matchesCategory;
  }), [tests, debouncedSearch, activeCategory]);

  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold md:text-4xl">Tahlillar va narxlar</h1>
          <p className="mt-3 text-muted-foreground">
            Barcha tahlil va diagnostika xizmatlari narxlari
          </p>
        </div>

        {/* Search & Filters */}
        <div className="mt-10 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tahlil nomini qidirish..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(null)}
            >
              Barchasi
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Tests list */}
        <div className="mt-8 space-y-3">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              Hech narsa topilmadi
            </p>
          ) : (
            filtered.map((test) => (
              <Card key={test.id}>
                <CardContent className="flex items-center justify-between px-5 py-4">
                  <div>
                    <h3 className="font-medium">{test.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {(test as any).categories?.name}
                    </p>
                  </div>
                  <span className="whitespace-nowrap font-semibold text-primary">
                    {formatPrice(test.price)}
                  </span>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
