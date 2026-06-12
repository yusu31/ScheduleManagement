'use client'

import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

const GLB_REGIONS = new Set<string>([
  'kenpo',
  'koriyama',
  'sukagawa',
  'kennan',
  'aizu',
  'okuaizu',
  'minamiaizu',
  'soma',
  'futaba',
  'iwaki',
  'all',
])

function GlbModel({ regionId }: { regionId: string }) {
  const { scene } = useGLTF(`/conquer/models/${regionId}.glb`)
  const cloned = useMemo(() => scene.clone(), [scene])
  return <primitive object={cloned} />
}

// ── 奥会津SL：黒色に変換 ───────────────────────────────────
function OkuaizuSL() {
  const { scene } = useGLTF('/conquer/models/okuaizu.glb')
  const cloned = useMemo(() => {
    const clone = scene.clone()
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).material = new THREE.MeshStandardMaterial({
          color: '#1c1c1c',
          roughness: 0.4,
          metalness: 0.7,
        })
      }
    })
    return clone
  }, [scene])
  return <primitive object={cloned} />
}

// ── 双葉スタジアム（Jヴィレッジ）+ ボール転がしアニメーション ──
function FutabaStadium() {
  const { scene } = useGLTF('/conquer/models/futaba.glb')
  const { scene: ballScene } = useGLTF('/conquer/models/futaba_ball.glb')
  const stadiumClone = useMemo(() => scene.clone(), [scene])
  const ballClone = useMemo(() => ballScene.clone(), [ballScene])
  const ballRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (ballRef.current) {
      const t = state.clock.getElapsedTime()
      ballRef.current.position.x = Math.sin(t * 0.9) * 0.3
      ballRef.current.position.z = Math.cos(t * 0.6) * 0.2
      ballRef.current.rotation.x += 0.05
      ballRef.current.rotation.z += 0.03
    }
  })

  return (
    <group>
      <primitive object={stadiumClone} />
      <group ref={ballRef} position={[0, 0.1, 0]}>
        <primitive object={ballClone} scale={0.06} />
      </group>
    </group>
  )
}

// ── CanvasTexture ───────────────────────────────────────────

function useKokeshiBodyTexture() {
  return useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256; canvas.height = 512
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#c17f4a'
    ctx.fillRect(0, 0, 256, 512)
    ctx.strokeStyle = 'rgba(90,40,0,0.18)'
    ctx.lineWidth = 2
    for (let x = 10; x < 256; x += 20) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 4, 512); ctx.stroke()
    }
    ctx.fillStyle = '#aa1500'
    ctx.fillRect(0, 195, 256, 22)
    ctx.fillRect(0, 315, 256, 22)
    const drawFlower = (cx: number, cy: number, r: number) => {
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2
        ctx.fillStyle = '#ff6b9d'
        ctx.beginPath()
        ctx.ellipse(cx + Math.cos(a) * r * 0.65, cy + Math.sin(a) * r * 0.65, r * 0.45, r * 0.7, a, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.fillStyle = '#ffe566'
      ctx.beginPath(); ctx.arc(cx, cy, r * 0.3, 0, Math.PI * 2); ctx.fill()
    }
    drawFlower(64, 105, 26); drawFlower(192, 105, 26)
    drawFlower(128, 255, 30); drawFlower(64, 390, 22); drawFlower(192, 390, 22)
    return new THREE.CanvasTexture(canvas)
  }, [])
}

function useSoccerTexture() {
  return useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512; canvas.height = 512
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = 'white'; ctx.fillRect(0, 0, 512, 512)
    ctx.fillStyle = '#111'
    const drawPentagon = (cx: number, cy: number, r: number) => {
      ctx.beginPath()
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2
        if (i === 0) ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r)
        else ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r)
      }
      ctx.closePath(); ctx.fill()
    }
    drawPentagon(256, 256, 80)
    drawPentagon(256, 58, 52); drawPentagon(256, 454, 52)
    drawPentagon(78, 162, 52); drawPentagon(434, 162, 52)
    drawPentagon(78, 350, 52); drawPentagon(434, 350, 52)
    return new THREE.CanvasTexture(canvas)
  }, [])
}

// ── こけし ──────────────────────────────────────────────────
function Kokeshi() {
  const bodyTex = useKokeshiBodyTexture()
  return (
    <group>
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.27, 0.34, 1.0, 32]} />
        <meshStandardMaterial map={bodyTex} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.13, 0.18, 0.13, 24]} />
        <meshStandardMaterial color="#e8b090" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.61, 0]}>
        <sphereGeometry args={[0.31, 32, 32]} />
        <meshStandardMaterial color="#f5dfc0" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.88, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 0.1, 32]} />
        <meshStandardMaterial color="#1a0800" roughness={0.8} />
      </mesh>
      {([-0.11, 0.11] as const).map((x, i) => (
        <mesh key={i} position={[x, 0.65, 0.28]}>
          <sphereGeometry args={[0.033, 16, 16]} />
          <meshStandardMaterial color="#1a0800" />
        </mesh>
      ))}
      <mesh position={[0, 0.525, 0.29]}>
        <sphereGeometry args={[0.024, 16, 16]} />
        <meshStandardMaterial color="#cc4466" />
      </mesh>
    </group>
  )
}

// ── 馬（三春駒・相馬野馬追） ────────────────────────────────
function Horse({ color }: { color: string }) {
  const legPositions: [number, number, number][] = [
    [-0.3, -0.52, 0.14], [-0.3, -0.52, -0.14],
    [0.28, -0.52, 0.14], [0.28, -0.52, -0.14],
  ]
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.9, 0.52, 0.42]} />
        <meshStandardMaterial color={color} roughness={0.45} />
      </mesh>
      <mesh position={[0.52, 0.38, 0]} rotation={[0, 0, -0.45]}>
        <boxGeometry args={[0.48, 0.34, 0.34]} />
        <meshStandardMaterial color={color} roughness={0.45} />
      </mesh>
      <mesh position={[0.3, 0.52, 0]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.28, 0.13, 0.05]} />
        <meshStandardMaterial color="#1a0800" roughness={0.9} />
      </mesh>
      {([-0.07, 0.07] as const).map((z, i) => (
        <mesh key={i} position={[0.66, 0.62, z]}>
          <coneGeometry args={[0.046, 0.11, 8]} />
          <meshStandardMaterial color={color} roughness={0.45} />
        </mesh>
      ))}
      {legPositions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <cylinderGeometry args={[0.06, 0.05, 0.46, 12]} />
          <meshStandardMaterial color={color} roughness={0.45} />
        </mesh>
      ))}
      <mesh position={[-0.5, -0.05, 0]} rotation={[0, 0, 0.8]}>
        <cylinderGeometry args={[0.035, 0.018, 0.34, 8]} />
        <meshStandardMaterial color="#1a0800" roughness={0.9} />
      </mesh>
    </group>
  )
}

// ── 牡丹（ぼたん）sukagawa ──────────────────────────────────
function Botan() {
  const petalShape = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(0, 0)
    shape.bezierCurveTo(0.13, 0.06, 0.2, 0.26, 0, 0.5)
    shape.bezierCurveTo(-0.2, 0.26, -0.13, 0.06, 0, 0)
    return shape
  }, [])

  const layers = [
    { count: 9, r: 0.58, color: '#ff6b9d', tilt: 0.55, scale: 1.0 },
    { count: 8, r: 0.44, color: '#ff4488', tilt: 0.45, scale: 0.88 },
    { count: 7, r: 0.30, color: '#ff3377', tilt: 0.35, scale: 0.74 },
    { count: 5, r: 0.18, color: '#cc1155', tilt: 0.22, scale: 0.60 },
  ]

  return (
    <group position={[0, -0.08, 0]}>
      <mesh position={[0, -0.65, 0]}>
        <cylinderGeometry args={[0.04, 0.06, 0.7, 8]} />
        <meshStandardMaterial color="#3a6e2a" roughness={0.8} />
      </mesh>
      {([-1, 1] as const).map((side, i) => (
        <mesh key={i} position={[side * 0.28, -0.35, 0]} rotation={[0.3, 0, side * 0.55]} scale={[1, 0.55, 1]}>
          <circleGeometry args={[0.2, 10]} />
          <meshStandardMaterial color="#3a7a2a" side={THREE.DoubleSide} roughness={0.7} />
        </mesh>
      ))}
      {layers.map((layer, li) =>
        Array.from({ length: layer.count }).map((_, pi) => {
          const angle = (pi / layer.count) * Math.PI * 2
          return (
            <mesh
              key={`${li}-${pi}`}
              position={[Math.cos(angle) * layer.r, 0, Math.sin(angle) * layer.r]}
              rotation={[layer.tilt, angle, 0]}
              scale={layer.scale}
            >
              <shapeGeometry args={[petalShape]} />
              <meshStandardMaterial color={layer.color} side={THREE.DoubleSide} roughness={0.38} />
            </mesh>
          )
        })
      )}
      <mesh position={[0, 0.1, 0]}>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshStandardMaterial color="#ffd700" emissive="#ffaa00" emissiveIntensity={0.4} roughness={0.3} />
      </mesh>
    </group>
  )
}

// ── 白河だるま ─────────────────────────────────────────────
function Daruma() {
  return (
    <group>
      <mesh scale={[0.9, 1.15, 0.9]}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial color="#cc2200" roughness={0.28} metalness={0.06} />
      </mesh>
      <mesh position={[0, 0.05, 0.48]} scale={[0.55, 0.65, 0.18]}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial color="#f5f0e0" roughness={0.5} />
      </mesh>
      {([-0.19, 0.19] as const).map((x, i) => (
        <mesh key={i} position={[x, 0.17, 0.56]} rotation={[0, 0, i === 0 ? -0.32 : 0.32]}>
          <capsuleGeometry args={[0.022, 0.14, 4, 8]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
        </mesh>
      ))}
      {([-0.14, 0.14] as const).map((x, i) => (
        <mesh key={i} position={[x, 0.01, 0.56]}>
          <sphereGeometry args={[0.044, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, -0.1, 0.56]}>
        <sphereGeometry args={[0.028, 12, 12]} />
        <meshStandardMaterial color="#cc8866" roughness={0.6} />
      </mesh>
      <mesh position={[0, -0.5, 0]} scale={[0.8, 0.25, 0.8]}>
        <sphereGeometry args={[0.55, 24, 24]} />
        <meshStandardMaterial color="#aa1800" roughness={0.4} />
      </mesh>
    </group>
  )
}

// ── 赤べこ ─────────────────────────────────────────────────
function Akabeko() {
  const spots: [number, number, number, number][] = [
    [0.2, 0.15, 0.42, 0.058], [-0.18, 0.18, 0.42, 0.048],
    [0.08, -0.12, 0.44, 0.052], [-0.1, -0.2, 0.38, 0.04],
    [0.3, -0.08, 0.37, 0.045],
  ]
  return (
    <group>
      <mesh scale={[1.15, 0.85, 0.7]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#cc2200" roughness={0.4} />
      </mesh>
      <mesh position={[0.62, 0.18, 0]} scale={[0.68, 0.68, 0.68]}>
        <sphereGeometry args={[0.36, 32, 32]} />
        <meshStandardMaterial color="#cc2200" roughness={0.4} />
      </mesh>
      <mesh position={[0.46, 0.07, 0]} rotation={[0, 0, 1.1]}>
        <torusGeometry args={[0.22, 0.038, 8, 24]} />
        <meshStandardMaterial color="#111" roughness={0.6} />
      </mesh>
      {spots.map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[r, 10, 10]} />
          <meshStandardMaterial color="#111" roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[0.9, 0.26, 0.18]}>
        <sphereGeometry args={[0.03, 12, 12]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {([-0.06, 0.06] as const).map((z, i) => (
        <mesh key={i} position={[0.72, 0.42, z]} rotation={[i === 0 ? 0.3 : -0.3, 0.2, 0.4]}>
          <coneGeometry args={[0.04, 0.1, 6]} />
          <meshStandardMaterial color="#cc2200" roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

// ── クマ ───────────────────────────────────────────────────
function Bear({ color }: { color: string }) {
  const earPositions: [number, number, number][] = [[-0.28, 0.84, 0.1], [0.28, 0.84, 0.1]]
  return (
    <group>
      <mesh position={[0, -0.15, 0]}>
        <sphereGeometry args={[0.52, 32, 32]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.52, 0]}>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {earPositions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
      ))}
      {earPositions.map((pos, i) => (
        <mesh key={i} position={[pos[0] * 0.75, pos[1] - 0.02, pos[2] + 0.08]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial color="#c87050" roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, 0.42, 0.32]} scale={[0.65, 0.4, 0.2]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#c8a070" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.38, 0.52]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#1a0a00" roughness={0.5} />
      </mesh>
      {([-0.12, 0.12] as const).map((x, i) => (
        <mesh key={i} position={[x, 0.54, 0.36]}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshStandardMaterial color="#1a0a00" roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

// ── 手まり ─────────────────────────────────────────────────
function Temari() {
  const rings = [
    { rotation: [0, 0, 0] as [number, number, number], color: '#e84444' },
    { rotation: [Math.PI / 3, 0, 0] as [number, number, number], color: '#4488ee' },
    { rotation: [Math.PI * 2 / 3, 0, 0] as [number, number, number], color: '#44cc88' },
    { rotation: [0, Math.PI / 4, 0] as [number, number, number], color: '#ee8844' },
    { rotation: [0, Math.PI * 3 / 4, 0] as [number, number, number], color: '#cc44cc' },
    { rotation: [Math.PI / 4, Math.PI / 4, 0] as [number, number, number], color: '#44cccc' },
  ]
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.62, 32, 32]} />
        <meshStandardMaterial color="#f8e8d0" roughness={0.35} />
      </mesh>
      {rings.map((ring, i) => (
        <mesh key={i} rotation={ring.rotation}>
          <torusGeometry args={[0.62, 0.044, 16, 64]} />
          <meshStandardMaterial color={ring.color} roughness={0.28} />
        </mesh>
      ))}
    </group>
  )
}

// ── サッカーボール ─────────────────────────────────────────
function SoccerBall() {
  const soccerTex = useSoccerTexture()
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.62, 48, 48]} />
        <meshStandardMaterial map={soccerTex} roughness={0.42} />
      </mesh>
    </group>
  )
}

// ── フラダンサー ───────────────────────────────────────────
function HulaDancer() {
  const skirtColors = ['#f97316', '#fb923c', '#fbbf24', '#f59e0b', '#ea580c']
  return (
    <group>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.2, 0.24, 0.75, 32]} />
        <meshStandardMaterial color="#f97316" roughness={0.4} />
      </mesh>
      {skirtColors.map((color, i) => {
        const angle = (i / skirtColors.length) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(angle) * 0.38, -0.32, Math.sin(angle) * 0.38]} rotation={[0.45, angle, 0]}>
            <coneGeometry args={[0.12, 0.5, 8]} />
            <meshStandardMaterial color={color} roughness={0.5} side={THREE.DoubleSide} />
          </mesh>
        )
      })}
      <mesh position={[0, 0.66, 0]}>
        <sphereGeometry args={[0.27, 32, 32]} />
        <meshStandardMaterial color="#d4956a" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.84, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.2, 32]} />
        <meshStandardMaterial color="#111" roughness={0.8} />
      </mesh>
      <mesh position={[0.18, 0.96, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#ff69b4" roughness={0.5} />
      </mesh>
      {([-0.42, 0.42] as const).map((x, i) => (
        <mesh key={i} position={[x, 0.18, 0]} rotation={[0, 0, i === 0 ? 0.5 : -0.5]}>
          <capsuleGeometry args={[0.055, 0.52, 8, 12]} />
          <meshStandardMaterial color="#d4956a" roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

// ── 黄金トロフィー ─────────────────────────────────────────
function Trophy() {
  const gold = { color: '#d4af37', metalness: 0.92, roughness: 0.1 }
  return (
    <group>
      <mesh position={[0, -0.85, 0]}>
        <cylinderGeometry args={[0.48, 0.52, 0.16, 32]} />
        <meshStandardMaterial {...gold} />
      </mesh>
      <mesh position={[0, -0.7, 0]}>
        <cylinderGeometry args={[0.32, 0.48, 0.12, 32]} />
        <meshStandardMaterial {...gold} />
      </mesh>
      <mesh position={[0, -0.46, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.46, 24]} />
        <meshStandardMaterial {...gold} />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.54, 0.26, 1.0, 32]} />
        <meshStandardMaterial {...gold} />
      </mesh>
      {([-1, 1] as const).map((side, i) => (
        <mesh key={i} position={[side * 0.68, 0.14, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.22, 0.05, 12, 32, Math.PI]} />
          <meshStandardMaterial {...gold} />
        </mesh>
      ))}
      <mesh position={[0, 0.72, 0]}>
        <sphereGeometry args={[0.15, 20, 20]} />
        <meshStandardMaterial color="#fff7a0" emissive="#ffd700" emissiveIntensity={0.6} metalness={0.9} roughness={0.08} />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.6, 6]} />
        <meshStandardMaterial color="#e8c84a" emissive="#c8a000" emissiveIntensity={0.15} metalness={0.85} roughness={0.15} />
      </mesh>
    </group>
  )
}

// ── regionId → Shape マッピング ────────────────────────────
const REGION_COLORS: Record<string, string> = {
  kenpo: '#5a9e7a', koriyama: '#4a72a0', sukagawa: '#ff6b9d',
  kennan: '#9e5a5a', aizu: '#9e7a3a', okuaizu: '#7a5e25',
  minamiaizu: '#7a5a9e', soma: '#2e8a7e', futaba: '#2a6e8a',
  iwaki: '#7a9e3a', all: '#d4af37',
}

function ItemShape({ regionId }: { regionId: string }) {
  if (regionId === 'okuaizu') return <OkuaizuSL />
  if (regionId === 'futaba') return <FutabaStadium />
  if (GLB_REGIONS.has(regionId)) {
    return <GlbModel regionId={regionId} />
  }
  const color = REGION_COLORS[regionId] ?? '#888'
  switch (regionId) {
    case 'kenpo':      return <Kokeshi />
    case 'koriyama':   return <Horse color={color} />
    case 'sukagawa':   return <Botan />
    case 'kennan':     return <Daruma />
    case 'aizu':       return <Akabeko />
    case 'okuaizu':    return <Bear color={color} />
    case 'minamiaizu': return <Temari />
    case 'soma':       return <Horse color={color} />
    case 'futaba':     return <SoccerBall />
    case 'iwaki':      return <HulaDancer />
    case 'all':        return <Trophy />
    default:           return <Kokeshi />
  }
}

// ── メインコンポーネント ────────────────────────────────────
type Props = {
  regionId: string
  autoRotate?: boolean
}

export default function RegionItem3DInner({ regionId, autoRotate = true }: Props) {
  return (
    <Canvas camera={{ position: [0, 0.3, 3], fov: 45 }} style={{ width: '100%', height: '100%' }}>
      <ambientLight intensity={0.9} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} />
      <directionalLight position={[-3, 2, -3]} intensity={0.5} />
      <pointLight position={[0, 3, 2]} intensity={0.7} color="#fff8e8" />
      <Suspense fallback={null}>
        <ItemShape regionId={regionId} />
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
