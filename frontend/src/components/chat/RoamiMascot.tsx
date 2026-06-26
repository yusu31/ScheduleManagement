interface Props {
  size?: number
  className?: string
}

export default function RoamiMascot({ size = 80, className = '' }: Props) {
  const id = `bodyGrad_${size}`
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* 体：下からラベンダーが滲む */}
        <radialGradient id={id} cx="50%" cy="75%" r="65%">
          <stop offset="0%" stopColor="#d8d0ee"/>
          <stop offset="55%" stopColor="#edeaf8"/>
          <stop offset="100%" stopColor="#f9f8ff"/>
        </radialGradient>
      </defs>

      {/* スプラウト（アプリロゴと連動） */}
      <line x1="50" y1="10" x2="50" y2="22" stroke="#6aaa6a" strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M50,18 C42,15 36,7 40,2 C44,-2 50,10 50,18Z" fill="#7ec47e"/>
      <path d="M50,18 C58,15 64,7 60,2 C56,-2 50,10 50,18Z" fill="#5f9a5f"/>

      {/* 体（たまご型・ラベンダーグラデ） */}
      <ellipse cx="50" cy="57" rx="36" ry="40" fill={`url(#${id})`}/>

      {/* 体の光沢ハイライト */}
      <ellipse cx="37" cy="37" rx="11" ry="7" fill="white" fillOpacity="0.55" transform="rotate(-20 37 37)"/>

      {/* 左目 */}
      <circle cx="38" cy="53" r="7.5" fill="#2a2050"/>
      <circle cx="41" cy="49" r="2.5" fill="white"/>

      {/* 右目 */}
      <circle cx="62" cy="53" r="7.5" fill="#2a2050"/>
      <circle cx="65" cy="49" r="2.5" fill="white"/>

      {/* 笑顔（紫みがかった線） */}
      <path d="M43,64 Q50,72 57,64" stroke="#9986c0" strokeWidth="2.2" fill="none" strokeLinecap="round"/>

      {/* 左ほほ */}
      <circle cx="27" cy="62" r="7.5" fill="#f4b0cc" fillOpacity="0.38"/>
      {/* 右ほほ */}
      <circle cx="73" cy="62" r="7.5" fill="#f4b0cc" fillOpacity="0.38"/>
    </svg>
  )
}
