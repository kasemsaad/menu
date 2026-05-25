import { useEffect, useState } from "react";
import api from "@/lib/api";
import type { Banner } from "@/types";
import { useTranslation } from "react-i18next";

export const HeroBanner = () => {
  const { i18n } = useTranslation();
  const [banner, setBanner] = useState<Banner | null>(null);

  useEffect(() => {
    let mounted = true;
    api
      .get<Banner[]> ("/banners")
      .then((res) => {
        if (!mounted) return;
        const items = res.data || [];
        setBanner(items[0] ?? null);
      })
      .catch(() => {
        /* ignore */
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (!banner) return null;

  const lang = i18n.language?.startsWith("ar") ? "ar" : "en";
  const title = banner.title?.[lang] || banner.title?.en || banner.title?.ar || "";
  const subtitle = banner.subtitle?.[lang] || "";
  const buttonText = banner.buttonText?.[lang] || "";

  return (
    <div className="card overflow-hidden">
      {banner.image && (
        <div className="aspect-[3/1] w-full overflow-hidden">
          <img src={banner.image} alt="" className="h-full w-full object-cover" />
        </div>
      )}
      <div className="p-6">
        <h2 className="text-2xl font-semibold">{title}</h2>
        {subtitle && <p className="mt-2 text-stone-600">{subtitle}</p>}
        {buttonText && banner.buttonLink && (
          <div className="mt-4">
            <a className="btn" href={banner.buttonLink}>
              {buttonText}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroBanner;
