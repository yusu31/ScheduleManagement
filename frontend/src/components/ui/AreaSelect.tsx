'use client'

import Select from 'react-select'
import { AREA_SELECT_OPTIONS } from '@/constants/municipalities'

type Props = {
  value: string
  onChange: (value: string) => void
}

export default function AreaSelect({ value, onChange }: Props) {
  const selectedOption =
    AREA_SELECT_OPTIONS.flatMap(g => g.options).find(o => o.value === value) ?? null

  return (
    <Select
      options={AREA_SELECT_OPTIONS}
      value={selectedOption}
      onChange={opt => onChange(opt?.value ?? '')}
      placeholder="エリアを検索..."
      noOptionsMessage={() => '該当なし'}
      styles={{
        control: (base, state) => ({
          ...base,
          borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
          borderRadius: '0.5rem',
          boxShadow: state.isFocused ? '0 0 0 2px rgba(59,130,246,0.3)' : 'none',
          fontSize: '0.875rem',
          minHeight: '38px',
          '&:hover': { borderColor: '#3b82f6' },
        }),
        menu: base => ({ ...base, fontSize: '0.875rem', zIndex: 50 }),
        groupHeading: base => ({
          ...base,
          fontSize: '0.7rem',
          fontWeight: '700',
          color: '#6b7280',
          textTransform: 'none',
          paddingTop: '6px',
        }),
        option: (base, state) => ({
          ...base,
          backgroundColor: state.isSelected
            ? '#3b82f6'
            : state.isFocused
              ? '#eff6ff'
              : 'white',
          color: state.isSelected ? 'white' : '#111827',
          cursor: 'pointer',
        }),
      }}
    />
  )
}
