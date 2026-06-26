interface Props {
  size?: number
  className?: string
}

export default function RoamiMascot({ size = 80, className = '' }: Props) {
  return (
    <svg
      width={size}
      height={Math.round(size * 1.1)}
      viewBox="0 0 100 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 頭の上のスプラウト（アプリロゴと連動） */}
      <line x1="50" y1="18" x2="50" y2="27" stroke="#5f8b8b" strokeWidth="2.8" strokeLinecap="round"/>
      <path d="M50,23 C41,21 33,12 38,5 C42,-1 50,9 50,23Z" fill="#5f8b8b"/>
      <path d="M50,23 C59,21 67,12 62,5 C58,-1 50,9 50,23Z" fill="#4a7070"/>

      {/* 本体（ミントグリーンの丸い体） */}
      <circle cx="50" cy="66" r="42" fill="#d8eee9"/>

      {/* 左耳 */}
      <circle cx="13" cy="52" r="12" fill="#c8e6e0"/>
      <circle cx="13" cy="52" r="7" fill="#b2d9d2"/>

      {/* 右耳 */}
      <circle cx="87" cy="52" r="12" fill="#c8e6e0"/>
      <circle cx="87" cy="52" r="7" fill="#b2d9d2"/>

      {/* 顔エリア（少し明るい） */}
      <circle cx="50" cy="64" r="37" fill="#f0fbf8"/>

      {/* 左目 外側の白 */}
      <circle cx="37" cy="60" r="11.5" fill="white"/>
      {/* 左目 虹彩（ダークティール） */}
      <circle cx="37" cy="62" r="7.8" fill="#1e4545"/>
      {/* 左目 瞳孔 */}
      <circle cx="37.8" cy="62.5" r="4.8" fill="#081818"/>
      {/* 左目 メインシャイン */}
      <circle cx="41" cy="57.5" r="3" fill="white"/>
      {/* 左目 サブシャイン */}
      <circle cx="34.5" cy="65" r="1.3" fill="rgba(255,255,255,0.65)"/>

      {/* 右目 外側の白 */}
      <circle cx="63" cy="60" r="11.5" fill="white"/>
      {/* 右目 虹彩 */}
      <circle cx="63" cy="62" r="7.8" fill="#1e4545"/>
      {/* 右目 瞳孔 */}
      <circle cx="63.8" cy="62.5" r="4.8" fill="#081818"/>
      {/* 右目 メインシャイン */}
      <circle cx="67" cy="57.5" r="3" fill="white"/>
      {/* 右目 サブシャイン */}
      <circle cx="60.5" cy="65" r="1.3" fill="rgba(255,255,255,0.65)"/>

      {/* 鼻 */}
      <ellipse cx="50" cy="72" rx="4" ry="2.5" fill="#8bbdba"/>

      {/* 口（ほほえみ） */}
      <path d="M41,78 Q50,87 59,78" stroke="#4a7070" strokeWidth="2.5" fill="none" strokeLinecap="round"/>

      {/* 左頬のほほ染め */}
      <circle cx="25" cy="74" r="9.5" fill="#f4a8a8" fillOpacity="0.38"/>

      {/* 右頬のほほ染め */}
      <circle cx="75" cy="74" r="9.5" fill="#f4a8a8" fillOpacity="0.38"/>
    </svg>
  )
}
