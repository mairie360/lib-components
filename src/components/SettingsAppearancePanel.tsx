import React from 'react';
import { Laptop, Moon, Sun } from 'lucide-react';

import { SettingsSection, SettingsSelect } from './settings/controls';
import { settingsDensityOptions, settingsFontOptions } from './settings/defaultData';
import type { SettingsAppearanceState, SettingsOption, SettingsTheme } from './settings/types';

export interface SettingsAppearancePanelProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  appearance: SettingsAppearanceState;
  fontOptions?: SettingsOption[];
  densityOptions?: SettingsOption[];
  onChange?: (appearance: SettingsAppearanceState) => void;
}

const themes = [
  { value: 'light', label: 'Clair', icon: Sun },
  { value: 'dark', label: 'Sombre', icon: Moon },
  { value: 'system', label: 'Système', icon: Laptop },
] satisfies Array<{ value: SettingsTheme; label: string; icon: typeof Sun }>;

export const SettingsAppearancePanel = ({
  appearance,
  fontOptions = settingsFontOptions,
  densityOptions = settingsDensityOptions,
  onChange,
  className = '',
  ...props
}: SettingsAppearancePanelProps) => {
  const update = <K extends keyof SettingsAppearanceState>(field: K, value: SettingsAppearanceState[K]) =>
    onChange?.({ ...appearance, [field]: value });

  return (
    <div className={`space-y-6 ${className}`} {...props}>
      <SettingsSection title="Thème">
        <div className="grid gap-4 sm:grid-cols-3">
          {themes.map((theme) => {
            const Icon = theme.icon;
            const selected = appearance.theme === theme.value;
            return (
              <button
                key={theme.value}
                type="button"
                role="radio"
                aria-checked={selected}
                className={`flex h-12 items-center gap-3 rounded-md border px-4 text-sm font-semibold ${selected ? 'border-[#1256a6] bg-[#edf5ff]' : 'border-[#d8d2ca] bg-white'}`}
                onClick={() => update('theme', theme.value)}
              >
                <span className={`size-4 rounded-full border p-[3px] ${selected ? 'border-[#1256a6] bg-[#1256a6] bg-clip-content' : 'border-[#c7c1ba]'}`} />
                <Icon className="size-4" />
                {theme.label}
              </button>
            );
          })}
        </div>
      </SettingsSection>

      <SettingsSection title="Personnalisation">
        <div className="space-y-5">
          <SettingsSelect id="settings-font" label="Police de caractères" value={appearance.fontFamily} options={fontOptions} onChange={(value) => update('fontFamily', value)} />
          <label htmlFor="settings-font-size" className="block text-sm font-semibold text-[#172033]">
            Taille de police
            <input
              id="settings-font-size"
              type="range"
              min={0}
              max={100}
              step={1}
              value={appearance.fontSize}
              className="mt-2 block w-full accent-[#1256a6]"
              onChange={(event) => update('fontSize', Number(event.target.value))}
            />
            <span className="mt-1 flex justify-between text-xs font-normal text-[#667085]"><span>Petit</span><span>Normal</span><span>Grand</span></span>
          </label>
          <SettingsSelect id="settings-density" label="Compacité de l'interface" value={appearance.density} options={densityOptions} onChange={(value) => update('density', value)} />
        </div>
      </SettingsSection>
    </div>
  );
};
