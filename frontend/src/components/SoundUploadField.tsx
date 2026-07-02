import type { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { Play, Trash2, Upload } from "lucide-react";
import { readFileAsDataUrl } from "@/lib/upload";
import { previewSoundUrl, type SoundType } from "@/lib/sounds";

type Props = {
  label: string;
  value: string;
  soundType: SoundType;
  onChange: (url: string) => void;
};

export const SoundUploadField = ({ label, value, onChange }: Props) => {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl border border-stone-200 p-3 dark:border-stone-700">
      <p className="mb-2 text-sm font-medium">{label}</p>
      <div className="flex flex-wrap items-center gap-2">
        <label className="btn-outline cursor-pointer gap-1 text-xs">
          <Upload size={14} />
          <input
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={async (e: ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0];
              if (file) onChange(await readFileAsDataUrl(file));
              e.target.value = "";
            }}
          />
          {t("uploadSound")}
        </label>
        {value && (
          <>
            <button
              type="button"
              className="btn-outline gap-1 text-xs"
              onClick={() => previewSoundUrl(value)}
            >
              <Play size={14} /> {t("testSound")}
            </button>
            <button
              type="button"
              className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
              onClick={() => onChange("")}
              title={t("delete")}
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
      </div>
      {value && <p className="mt-2 truncate text-xs text-stone-400">{t("customSoundSet")}</p>}
    </div>
  );
};
