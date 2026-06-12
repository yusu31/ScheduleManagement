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

// 個別調整設定（スケールはバウンディングボックスで自動計算）
const GLB_CONFIGS: Record<string, {
  modelFile?: string
  rotation?: [number, number, number]
  yOffset?: number
  targetSize?: number
  cameraTarget?: [number, number, number]
  materialColor?: string
  materialColors?: string[]  // メッシュパーツごとに色を割り当て（循環適用）
}> = {
  kenpo: { rotation: [0, 0, 0] },
  soma:  { modelFile: 'armored_horse', targetSize: 2.5 },
  iwaki: {
    modelFile: 'prancha_de_surf_surfboard',
    rotation: [Math.PI / 2, 0, 0.3],
    targetSize: 2.5,
    materialColors: ['#FF6B6B', '#FF8E53', '#FFD93D', '#6BCB77', '#4D96FF', '#845EC2', '#FF6B9D'],
  },
}

// バウンディングボックスを基準にスケーリング・中央寄せを行う共通関数
function autoFitClone(clone: THREE.Object3D, targetSize = 1.4, yOffset = 0): void {
  // GLBはmatrixAutoUpdate=falseでロードされることがあるため全ノードで有効化する
  // これをしないとposition変更後にmatrixが再ビルドされずレンダリングに反映されない
  clone.traverse((obj) => {
    obj.matrixAutoUpdate = true
  })
  clone.updateMatrixWorld(true)
  const box = new THREE.Box3().setFromObject(clone)
  const size = box.getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z)
  if (maxDim > 0 && isFinite(maxDim)) {
    const s = targetSize / maxDim
    clone.scale.setScalar(s)
    clone.updateMatrixWorld(true)
    const newBox = new THREE.Box3().setFromObject(clone)
    const center = newBox.getCenter(new THREE.Vector3())
    clone.position.set(-center.x, -center.y + yOffset, -center.z)
    // position.set後にmatrixを強制再ビルド（これがないと位置変更が描画に反映されない）
    clone.updateMatrixWorld(true)
  }
}

function GlbModel({ regionId }: { regionId: string }) {
  const cfg = GLB_CONFIGS[regionId]
  const modelFile = cfg?.modelFile ?? regionId
  const { scene } = useGLTF(`/conquer/models/${modelFile}.glb`)
  const rotKey = cfg?.rotation ? cfg.rotation.join(',') : ''
  const tSize = cfg?.targetSize ?? 2.5
  const yOff = cfg?.yOffset ?? 0

  // スケール・位置をclone自身ではなく親Groupに適用する方式
  // clone.position/scaleを直接変えると SkinnedMesh でmatrix更新が不安定なため
  const matColor = cfg?.materialColor
  const matColors = cfg?.materialColors

  const { cloned, groupScale, groupPos } = useMemo(() => {
    const clone = scene.clone()
    clone.traverse((obj) => { obj.matrixAutoUpdate = true })

    // 単色上書き
    if (matColor) {
      clone.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          (obj as THREE.Mesh).material = new THREE.MeshStandardMaterial({
            color: matColor, roughness: 0.55, metalness: 0.05,
          })
        }
      })
    }

    // パーツごとに異なる色を割り当て
    if (matColors) {
      const meshes: THREE.Mesh[] = []
      clone.traverse((obj) => { if ((obj as THREE.Mesh).isMesh) meshes.push(obj as THREE.Mesh) })
      meshes.forEach((mesh, i) => {
        mesh.material = new THREE.MeshStandardMaterial({
          color: matColors[i % matColors.length],
          roughness: 0.25,
          metalness: 0.08,
        })
      })
    }

    if (cfg?.rotation) clone.rotation.set(...cfg.rotation)
    clone.updateMatrixWorld(true)

    const box = new THREE.Box3().setFromObject(clone)
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    const s = maxDim > 0 && isFinite(maxDim) ? tSize / maxDim : 1
    const center = box.getCenter(new THREE.Vector3())

    return {
      cloned: clone,
      groupScale: s,
      groupPos: [-center.x * s, -center.y * s + yOff, -center.z * s] as [number, number, number],
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, regionId, rotKey, tSize, yOff, matColor, matColors])

  return (
    <group position={groupPos} scale={groupScale}>
      <primitive object={cloned} />
    </group>
  )
}

// ── 奥会津SL：黒色に変換 + 自動スケーリング ──────────────────
function OkuaizuSL() {
  const { scene } = useGLTF('/conquer/models/okuaizu.glb')
  const cloned = useMemo(() => {
    const clone = scene.clone()
    // 黒色変換
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).material = new THREE.MeshStandardMaterial({
          color: '#2a2a2a',
          roughness: 0.15,
          metalness: 0.92,
        })
      }
    })
    // 横向きに回転してからBBで自動スケーリング
    clone.rotation.set(0, Math.PI / 2, 0)
    autoFitClone(clone, 2.5, -0.1)
    return clone
  }, [scene])
  return <primitive object={cloned} />
}

// ── 双葉スタジアム（Jヴィレッジ）+ ボール転がしアニメーション ──
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function FutabaStadium() {
  const { scene } = useGLTF('/conquer/models/futaba.glb')
  const { scene: ballScene } = useGLTF('/conquer/models/futaba_ball.glb')
  const ballRef = useRef<THREE.Group>(null)

  const stadiumClone = useMemo(() => {
    const clone = scene.clone()
    // スタジアムを斜め前から見えるよう前傾させてからBBで自動スケーリング
    clone.rotation.set(-Math.PI / 2.5, 0, 0)
    clone.updateMatrixWorld(true)
    autoFitClone(clone, 2.5, -0.1)
    return clone
  }, [scene])

  const ballClone = useMemo(() => {
    const bc = ballScene.clone()
    autoFitClone(bc, 0.22)
    return bc
  }, [ballScene])

  useFrame((state) => {
    if (ballRef.current) {
      const t = state.clock.getElapsedTime()
      ballRef.current.position.x = Math.sin(t * 0.9) * 0.28
      ballRef.current.position.z = Math.cos(t * 0.6) * 0.2
      ballRef.current.rotation.x += 0.05
      ballRef.current.rotation.z += 0.03
    }
  })

  return (
    <group>
      <primitive object={stadiumClone} />
      <group ref={ballRef} position={[0, 0.1, 0]}>
        <primitive object={ballClone} />
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

// ── サーフボード ────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Surfboard() {
  // 鼻から尻尾にかけて7色のストライプ（上=ノーズ、下=テール）
  const stripes: { r0: number; r1: number; h: number; color: string }[] = [
    { r0: 0.06, r1: 0.22, h: 0.20, color: '#FF6B6B' },
    { r0: 0.22, r1: 0.36, h: 0.20, color: '#FF8E53' },
    { r0: 0.36, r1: 0.44, h: 0.18, color: '#FFD93D' },
    { r0: 0.44, r1: 0.44, h: 0.16, color: '#6BCB77' },
    { r0: 0.44, r1: 0.38, h: 0.18, color: '#4D96FF' },
    { r0: 0.38, r1: 0.26, h: 0.20, color: '#845EC2' },
    { r0: 0.26, r1: 0.08, h: 0.20, color: '#FF6B9D' },
  ]
  const totalH = stripes.reduce((s, seg) => s + seg.h, 0)
  const positions: number[] = []
  let acc = totalH / 2
  for (const seg of stripes) {
    acc -= seg.h / 2
    positions.push(acc)
    acc -= seg.h / 2
  }

  return (
    <group rotation={[0.15, 0, 0.1]}>
      {/* ボード本体：Z方向に薄く潰してサーフボードらしい形に */}
      <group scale={[1, 1, 0.15]}>
        {stripes.map((seg, i) => (
          <mesh key={i} position={[0, positions[i], 0]}>
            <cylinderGeometry args={[seg.r0, seg.r1, seg.h, 20]} />
            <meshStandardMaterial color={seg.color} roughness={0.22} metalness={0.08} />
          </mesh>
        ))}
      </group>
      {/* フィン（テール下部） */}
      <mesh position={[0, -(totalH / 2 + 0.14), 0.01]}>
        <coneGeometry args={[0.08, 0.30, 6]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.55} />
      </mesh>
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
  if (regionId === 'futaba') return <GlbModel regionId="futaba_ball" />
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
  const glbCfg = GLB_CONFIGS[regionId]
  const camTarget = (glbCfg?.cameraTarget ?? [0, 0, 0]) as [number, number, number]

  return (
    <Canvas camera={{ position: [0, 0.6, 2.5], fov: 65 }} style={{ width: '100%', height: '100%' }}>
      <ambientLight intensity={0.9} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} />
      <directionalLight position={[-3, 2, -3]} intensity={0.5} />
      <pointLight position={[0, 3, 2]} intensity={0.7} color="#fff8e8" />
      <Suspense fallback={null}>
        <ItemShape regionId={regionId} />
        <Environment preset="apartment" />
      </Suspense>
      <OrbitControls
        autoRotate={autoRotate}
        autoRotateSpeed={3}
        enableZoom={false}
        enablePan={false}
        target={camTarget}
      />
    </Canvas>
  )
}
