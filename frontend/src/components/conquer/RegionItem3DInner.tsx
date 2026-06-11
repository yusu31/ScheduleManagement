'use client'

import { Suspense, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGLTF, OrbitControls, Environment } from '@react-three/drei'
import type { Group } from 'three'

type ModelProps = {
  url: string
}

function Model({ url }: ModelProps) {
  const { scene } = useGLTF(url)
  const ref = useRef<Group>(null)
  return <primitive ref={ref} object={scene} scale={1.4} position={[0, -0.5, 0]} />
}

type Props = {
  regionId: string
  autoRotate?: boolean
}

export default function RegionItem3DInner({ regionId, autoRotate = true }: Props) {
  const url = `/conquer/models/${regionId}.glb`

  return (
    <Canvas camera={{ position: [0, 0.5, 3], fov: 45 }} style={{ width: '100%', height: '100%' }}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <directionalLight position={[-3, 3, -3]} intensity={0.4} />
      <Suspense fallback={null}>
        <Model url={url} />
        <Environment preset="city" />
      </Suspense>
      <OrbitControls
        autoRotate={autoRotate}
        autoRotateSpeed={3}
        enableZoom={false}
        enablePan={false}
      />
    </Canvas>
  )
}
