'use client'

import { AREA_GROUPS } from '@/constants/municipalities'

type Props = {
  selected: string[]
  onToggle: (municipality: string) => void
}

export default function AreaChipFilter({ selected, onToggle }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {AREA_GROUPS.map(group => (
        <div key={group.label}>
          <p className="text-[11px] font-bold text-app-sub/60 mb-1.5 tracking-wide">{group.label}</p>
          <div className="flex flex-wrap gap-1.5">
            {group.areas.map(area => (
              <button
                key={area}
                type="button"
                onClick={() => onToggle(area)}
                className={`px-3 py-1 rounded-full text-[12px] font-medium transition-colors ${
                  selected.includes(area)
                    ? 'bg-primary text-white'
                    : 'bg-app-bg text-app-sub hover:bg-app-border'
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
