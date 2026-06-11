'use client'

import dynamic from 'next/dynamic'

const RegionItem3DInner = dynamic(
  () => import('./RegionItem3DInner'),
  { ssr: false, loading: () => <div className="w-full h-full" /> }
)

type Props = {
  regionId: string
  autoRotate?: boolean
}

export default function RegionItem3D({ regionId, autoRotate = true }: Props) {
  return <RegionItem3DInner regionId={regionId} autoRotate={autoRotate} />
}
