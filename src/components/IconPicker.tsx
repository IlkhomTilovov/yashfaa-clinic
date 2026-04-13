import { useState, useMemo } from "react";
import { DynamicIcon, POPULAR_ICONS, getAllIconNames } from "./DynamicIcon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function IconPicker({ value, onChange, label = "Icon" }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  const allIcons = useMemo(() => getAllIconNames(), []);

  const displayedIcons = useMemo(() => {
    const source = showAll
      ? allIcons.map((name) => ({ name, label: name }))
      : POPULAR_ICONS;

    if (!search.trim()) return source;
    const q = search.toLowerCase();
    return source.filter(
      (ic) => ic.name.includes(q) || ic.label.toLowerCase().includes(q)
    );
  }, [search, showAll, allIcons]);

  const selectedLabel = POPULAR_ICONS.find((i) => i.name === value)?.label ?? value;

  return (
    <div className="space-y-1.5">
      {label && <Label className="text-sm">{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-start gap-2 font-normal"
          >
            <DynamicIcon name={value} className="h-4 w-4 shrink-0" />
            <span className="truncate">{value ? selectedLabel : "Icon tanlang"}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <div className="border-b p-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Icon qidirish..."
                className="pl-8"
              />
            </div>
            <div className="mt-2 flex gap-1">
              <Button
                variant={showAll ? "ghost" : "secondary"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setShowAll(false)}
              >
                Ommabop
              </Button>
              <Button
                variant={showAll ? "secondary" : "ghost"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setShowAll(true)}
              >
                Barchasi ({allIcons.length})
              </Button>
            </div>
          </div>
          <ScrollArea className="h-64">
            <div className="grid grid-cols-6 gap-1 p-2">
              {displayedIcons.length === 0 ? (
                <p className="col-span-6 py-4 text-center text-sm text-muted-foreground">
                  Topilmadi
                </p>
              ) : (
                displayedIcons.map((ic) => (
                  <button
                    key={ic.name}
                    type="button"
                    title={ic.label}
                    onClick={() => {
                      onChange(ic.name);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={cn(
                      "flex h-10 w-full items-center justify-center rounded-md transition-colors hover:bg-accent",
                      value === ic.name && "bg-primary/10 text-primary ring-1 ring-primary/30"
                    )}
                  >
                    <DynamicIcon name={ic.name} className="h-5 w-5" />
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
}
