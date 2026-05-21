import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Float, Html, Sky, Stars } from '@react-three/drei'
import * as THREE from 'three'
import City from './City'
import CharacterModel from './CharacterModel'
import PlayerController from './PlayerController'

const hotspots = [
  { id: 'simona', name: 'Simona', type: 'npc', position: [2.8, 1.5, 4.5], color: '#7df3c6' },
]

const broadcasts = [
  'Ionian port lights synchronized with civic network.',
  'Campanella AI archive opened philosophical channel.',
  'Solar roads pulsing under public plaza.',
  'Citizen hub requests governance dialogue.',
]

function Experience({ activeNpc, onNpcSelect, onPlayerPosition, onTerminalActivate, onWorldEvent, stats }) {
  return (
    <Canvas
      camera={{ fov: 62, near: 0.1, far: 180 }}
      className="world-canvas"
      dpr={[1, 1.65]}
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 0.72,
      }}
      shadows
    >
      <SceneSettings />
      <color attach="background" args={['#030711']} />
      <fog attach="fog" args={['#06111e', 12, 78]} />

      <Sky
        azimuth={0.18}
        distance={450000}
        inclination={0.58}
        mieCoefficient={0.006}
        mieDirectionalG={0.82}
        rayleigh={0.28}
        turbidity={12}
      />
      <ambientLight color="#84c7ff" intensity={0.16} />
      <hemisphereLight args={['#7fc7ff', '#160e08', 0.45]} />
      <directionalLight
        castShadow
        color="#fff1bd"
        intensity={1.45}
        position={[10, 18, 8]}
        shadow-camera-bottom={-26}
        shadow-camera-left={-26}
        shadow-camera-right={26}
        shadow-camera-top={26}
        shadow-mapSize={2048}
      />
      <pointLight color="#62c6ff" distance={34} intensity={7} position={[-8, 5, -7]} />
      <pointLight color="#f7c968" distance={28} intensity={5.5} position={[7, 4, 5]} />
      <spotLight angle={0.34} color="#f7c968" distance={46} intensity={45} penumbra={0.82} position={[0, 18, -8]} />

      <WorldEventLoop onWorldEvent={onWorldEvent} />

      <PlayerController onPlayerPosition={onPlayerPosition} />
      <Suspense fallback={<LoadingMarker />}>
        <City />
      </Suspense>

      <SolarpunkAtmosphere stats={stats} />
      <Hotspots
        activeNpc={activeNpc}
        onNpcSelect={onNpcSelect}
        onTerminalActivate={onTerminalActivate}
      />

      <Stars radius={100} depth={45} count={2600} factor={3.8} saturation={0} fade speed={0.36} />
      <Environment preset="night" environmentIntensity={0.42} />
    </Canvas>
  )
}

function DebugHelpers() {
  return (
    <group>
      <axesHelper args={[4]} />
      <gridHelper args={[80, 80, '#f7c968', '#21405c']} position={[0, 0.012, 0]} />
    </group>
  )
}

function SceneSettings() {
  const { gl } = useThree()

  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping
    gl.toneMappingExposure = 0.72
    gl.outputColorSpace = THREE.SRGBColorSpace
    gl.shadowMap.enabled = true
    gl.shadowMap.type = THREE.PCFShadowMap
  }, [gl])

  return null
}

function LoadingMarker() {
  return (
    <Html center>
      <div className="world-label loading-label">Loading Calabria 2100...</div>
    </Html>
  )
}

function WorldEventLoop({ onWorldEvent }) {
  const last = useRef(0)

  useFrame(({ clock }) => {
    if (!onWorldEvent || clock.elapsedTime - last.current < 16) return

    last.current = clock.elapsedTime
    onWorldEvent(broadcasts[Math.floor(Math.random() * broadcasts.length)])
  })

  return null
}

function SolarpunkAtmosphere({ stats }) {
  return (
    <group>
      <EnergyRoads />
      <MediterraneanGlow stats={stats} />
    </group>
  )
}

function EnergyRoads() {
  return (
    <group>
      {[5.5, 9.5, 14].map((radius) => (
        <mesh key={radius} position={[0, 0.045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radius, 0.025, 8, 160]} />
          <meshStandardMaterial color="#62c6ff" emissive="#62c6ff" emissiveIntensity={0.75} transparent opacity={0.5} />
        </mesh>
      ))}
      {Array.from({ length: 8 }).map((_, index) => (
        <mesh key={index} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, (index / 8) * Math.PI]}>
          <planeGeometry args={[0.045, 34]} />
          <meshStandardMaterial color="#f7c968" emissive="#f7c968" emissiveIntensity={0.55} transparent opacity={0.35} />
        </mesh>
      ))}
    </group>
  )
}

function MediterraneanGlow({ stats }) {
  const core = useRef()

  useFrame(({ clock }) => {
    if (!core.current) return
    core.current.rotation.y = clock.elapsedTime * 0.28
    core.current.material.emissiveIntensity = 1.4 + stats.energy / 100
  })

  return (
    <group>
      <Float floatIntensity={0.32} rotationIntensity={0.12} speed={0.9}>
        <mesh ref={core} position={[0, 4.6, -2]}>
          <icosahedronGeometry args={[0.95, 3]} />
          <meshStandardMaterial color="#ffe4a0" emissive="#f7c968" emissiveIntensity={1.8} roughness={0.18} />
        </mesh>
      </Float>
      <mesh position={[0, 3.3, -2]}>
        <cylinderGeometry args={[0.055, 0.2, 6, 24, 1, true]} />
        <meshStandardMaterial color="#f7c968" emissive="#f7c968" emissiveIntensity={1.1} transparent opacity={0.18} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function Hotspots({ activeNpc, onNpcSelect, onTerminalActivate }) {
  return hotspots.map((hotspot) => (
    <Hotspot
      active={activeNpc === hotspot.name}
      hotspot={hotspot}
      key={hotspot.id}
      onActivate={() => {
        if (hotspot.type === 'terminal') {
          onTerminalActivate()
          return
        }
        onNpcSelect(hotspot.name)
      }}
    />
  ))
}

function Hotspot({ active, hotspot, onActivate }) {
  const ref = useRef()
  const nearRef = useRef(false)
  const [near, setNear] = useState(false)

  useEffect(() => {
    const handleInteract = (event) => {
      if (event.code === 'KeyE' && nearRef.current) onActivate()
    }

    window.addEventListener('keydown', handleInteract)
    return () => window.removeEventListener('keydown', handleInteract)
  }, [onActivate])

  useFrame(({ camera, clock }) => {
    if (!ref.current) return

    if (hotspot.name !== 'Simona') {
      ref.current.rotation.y = clock.elapsedTime * 0.55
      ref.current.position.y = hotspot.position[1] + Math.sin(clock.elapsedTime * 1.5) * 0.08
    }

    const isNear = camera.position.distanceTo(ref.current.position) < 5
    if (isNear !== nearRef.current) {
      nearRef.current = isNear
      setNear(isNear)
    }
  })

  return (
    <group position={hotspot.position}>
      <group>
        <group
          onClick={(event) => {
            event.stopPropagation()
            onActivate()
          }}
          ref={ref}
        >
          {hotspot.name === 'Simona' ? (
            <CharacterModel height={1.75} rotationY={Math.PI} />
          ) : (
            <mesh castShadow>
              {hotspot.type === 'terminal' ? (
                <cylinderGeometry args={[0.38, 0.55, 0.8, 8]} />
              ) : (
                <capsuleGeometry args={[0.26, 0.82, 8, 16]} />
              )}
              <meshStandardMaterial color={hotspot.color} emissive={hotspot.color} emissiveIntensity={active || near ? 1.9 : 0.95} roughness={0.18} />
            </mesh>
          )}
        </group>
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.62, 0]}>
        <ringGeometry args={[0.68, 0.74, 40]} />
        <meshStandardMaterial color={hotspot.color} emissive={hotspot.color} emissiveIntensity={near ? 1.6 : 0.9} transparent opacity={near ? 0.82 : 0.45} />
      </mesh>
      <Html center distanceFactor={8} position={[0, 1.15, 0]}>
        <div className={`world-label ${active || near ? 'active' : ''}`}>
          {hotspot.name}
          {near && <span>Press E or click</span>}
        </div>
      </Html>
    </group>
  )
}

export default Experience
