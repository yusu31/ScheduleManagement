interface Props {
  size?: number
  className?: string
}

export default function RoamiMascot({ size = 80, className = '' }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 本体（ミント色の丸い体） */}
      <circle cx="50" cy="54" r="42" fill="#d5ece7"/>

      {/* 左耳 */}
      <circle cx="13" cy="44" r="13" fill="#c2e0da"/>
      {/* 右耳 */}
      <circle cx="87" cy="44" r="13" fill="#c2e0da"/>

      {/* 頭の上のスプラウト（アプリと同じ芽マーク） */}
      <line x1="50" y1="12" x2="50" y2="20" stroke="#5f8b8b" strokeWidth="3" strokeLinecap="round"/>
      {/* 左の葉 */}
      <path d="M50,18 C43,16 37,9 41,4 C45,0 50,8 50,18Z" fill="#5f8b8b"/>
      {/* 右の葉 */}
      <path d="M50,18 C57,16 63,9 59,4 C55,0 50,8 50,18Z" fill="#4a7070"/>

      {/* 左目（黒丸＋白ハイライト：LINEキャラ方式） */}
      <circle cx="36" cy="50" r="10" fill="#1a2e2e"/>
      <circle cx="39.5" cy="46.5" r="3" fill="white"/>

      {/* 右目 */}
      <circle cx="64" cy="50" r="10" fill="#1a2e2e"/>
      <circle cx="67.5" cy="46.5" r="3" fill="white"/>

      {/* 笑顔 */}
      <path d="M41,64 Q50,73 59,64" stroke="#4a7070" strokeWidth="2.5" fill="none" strokeLinecap="round"/>

      {/* 左ほほ */}
      <circle cx="24" cy="62" r="9" fill="#f4aaaa" fillOpacity="0.45"/>
      {/* 右ほほ */}
      <circle cx="76" cy="62" r="9" fill="#f4aaaa" fillOpacity="0.45"/>
    </svg>
  )
}
