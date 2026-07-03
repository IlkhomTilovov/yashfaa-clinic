// Google Ads conversion tracking helper
export const reportConversion = (url?: string): boolean => {
  const fn = (typeof window !== "undefined" ? (window as any).gtag_report_conversion : null) as
    | ((u?: string) => boolean)
    | null;
  if (typeof fn === "function") {
    try {
      return fn(url);
    } catch {
      // ignore
    }
  }
  return true;
};
