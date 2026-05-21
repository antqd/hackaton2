import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Float, Html, PointerLockControls, Sky, Stars } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

const npcData = [
  { name: 'Campanella AI', position: [0, 1.45, -3.4], color: '#f7c968', scale: 1.25, path: 0.35 },
  { name: 'AI Governor', position: [0, 2.2, 1.2], color: '#d9f3ff', scale: 1.5, path: 0.18 },
  { name: 'Scientist', position: [-7.2, 1.1, 2.6], color: '#62c6ff', scale: 0.9, path: 0.65 },
  { name: 'Citizen', position: [6.2, 1, 3.6], color: '#7df3c6', scale: 0.82, path: 1.05 },
  { name: 'Rebel', position: [-5.2, 1.1, -6.2], color: '#ff6e8f', scale: 0.92, path: 0.9 },
  { name: 'Ecologist', position: [5.5, 1.1, -5.4], color: '#95ff9e', scale: 0.9, path: 0.75 },
  { name: 'Energy Minister', position: [-1.8, 1.1, 7.4], color: '#ffd36b', scale: 0.96, path: 0.55 },
  { name: 'Tourist AI Guide', position: [8.4, 1, -1.6], color: '#b98cff', scale: 0.86, path: 1.15 },
]

const broadcasts = [
  'Flying tram crossed Ionian transit spine.',
  'Hidden archive ping detected below Campanella plaza.',
  'Agriculture dome opened nocturnal pollination cycle.',
  'Harbor AI rerouted solar ferries along Calabria coast.',
  'Public monument requested ethical vote from citizens.',
]

function WorldScene({ activeNpc, onNpcSelect, onTerminalActivate, onWorldEvent, stats }) {
  return (
    <Canvas
      camera={{ position: [0, 2.1, 11], fov: 62 }}
      className="world-canvas"
      dpr={[1, 1.65]}
      shadows
    >
      <color attach="background" args={['#02040a']} />
      <fog attach="fog" args={['#07131f', 10, 72]} />
      <Sky azimuth={0.18} distance={450000} inclination={0.62} mieCoefficient={0.008} mieDirectionalG={0.86} rayleigh={0.4} turbidity={14} />
      <ambientLight intensity={0.18} />
      <hemisphereLight args={['#62c6ff', '#100713', 0.42]} />
      <directionalLight castShadow intensity={2.1} position={[8, 16, 6]} shadow-mapSize={2048} />
      <spotLight angle={0.42} color="#f7c968" distance={44} intensity={220} penumbra={0.85} position={[0, 18, 0]} />
      <pointLight color="#62c6ff" intensity={9} position={[-9, 5, -8]} distance={26} />

      <PlayerController />
      <WorldEvents onWorldEvent={onWorldEvent} />
      <CalabriaSolarCity stats={stats} />
      <MediterraneanCoast />
      <LivingTraffic />
      <DroneSwarm />
      <HologramNetwork />
      <ParticleField />
      <AITerminals onTerminalActivate={onTerminalActivate} />

      {npcData.map((npc) => (
        <NPC
          active={activeNpc === npc.name}
          key={npc.name}
          npc={npc}
          onSelect={() => onNpcSelect(npc.name)}
        />
      ))}

      <Stars radius={100} depth={48} count={3200} factor={4.5} saturation={0} fade speed={0.65} />
      <Environment preset="night" />
      <EffectComposer>
        <Bloom intensity={1.25} luminanceSmoothing={0.18} luminanceThreshold={0.18} mipmapBlur />
        <Vignette darkness={0.48} eskil={false} offset={0.22} />
      </EffectComposer>
    </Canvas>
  )
}

function PlayerController() {
  const keys = useRef({})
  const { camera } = useThree()
  const velocity = useRef(new THREE.Vector3())
  const direction = useRef(new THREE.Vector3())

  useEffect(() => {
    const down = (event) => {
      keys.current[event.code] = true
    }
    const up = (event) => {
      keys.current[event.code] = false
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  useFrame((_, delta) => {
    const speed = keys.current.ShiftLeft || keys.current.ShiftRight ? 9.5 : 5.2
    direction.current.set(0, 0, 0)

    if (keys.current.KeyW) direction.current.z -= 1
    if (keys.current.KeyS) direction.current.z += 1
    if (keys.current.KeyA) direction.current.x -= 1
    if (keys.current.KeyD) direction.current.x += 1

    direction.current.normalize().applyQuaternion(camera.quaternion)
    direction.current.y = 0
    direction.current.normalize()

    velocity.current.lerp(direction.current.multiplyScalar(speed), 0.16)
    camera.position.addScaledVector(velocity.current, delta)
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -18, 18)
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -18, 18)
    camera.position.y = 2.05 + Math.sin(performance.now() * 0.006) * 0.025
  })

  return <PointerLockControls selector=".world-canvas" />
}

function WorldEvents({ onWorldEvent }) {
  const last = useRef(0)
  useFrame(({ clock }) => {
    if (clock.elapsedTime - last.current < 14) return
    last.current = clock.elapsedTime
    onWorldEvent?.(broadcasts[Math.floor(Math.random() * broadcasts.length)])
  })
  return null
}

function CalabriaSolarCity({ stats }) {
  const buildings = useMemo(() => {
    const items = []
    for (let i = 0; i < 92; i += 1) {
      const angle = (i / 92) * Math.PI * 2
      const ring = i % 4 === 0 ? 5.8 : i % 4 === 1 ? 9.2 : i % 4 === 2 ? 12.4 : 15.2
      const height = 0.9 + ((i * 13) % 13) * 0.28
      items.push({
        id: i,
        position: [Math.cos(angle) * ring, height / 2, Math.sin(angle) * ring],
        rotation: [0, -angle, 0],
        scale: [0.45 + (i % 5) * 0.09, height, 0.5 + (i % 6) * 0.08],
        color: i % 5 === 0 ? '#f7c968' : i % 3 === 0 ? '#7df3c6' : '#62c6ff',
      })
    }
    return items
  }, [])

  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[22, 128]} />
        <meshStandardMaterial color="#071018" metalness={0.4} roughness={0.46} />
      </mesh>

      <UtopianPlaza stats={stats} />
      <SolarRings stats={stats} />
      <EnergyRoads />
      <AgricultureDomes />
      <SmartHarbor />
      <MediterraneanArcades />

      {buildings.map((building) => (
        <Building building={building} key={building.id} />
      ))}
    </group>
  )
}

function UtopianPlaza({ stats }) {
  const core = useRef()
  useFrame(({ clock }) => {
    if (!core.current) return
    core.current.rotation.y = clock.elapsedTime * 0.45
    core.current.material.emissiveIntensity = 2.4 + Math.sin(clock.elapsedTime * 2) * 0.45 + stats.energy / 80
  })

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[2.2, 5.4, 160]} />
        <meshStandardMaterial color="#133b55" emissive="#0e6ea4" emissiveIntensity={0.55} transparent opacity={0.72} />
      </mesh>
      <Float floatIntensity={0.72} rotationIntensity={0.16} speed={1.1}>
        <mesh castShadow position={[0, 3.2, 0]} ref={core}>
          <icosahedronGeometry args={[1.55, 4]} />
          <meshStandardMaterial color="#fff2b0" emissive="#f7c968" emissiveIntensity={3} metalness={0.3} roughness={0.12} />
        </mesh>
      </Float>
      <EnergyBeam from={[0, 0.1, 0]} height={18} color="#f7c968" />
    </group>
  )
}

function SolarRings() {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.rotation.y = clock.elapsedTime * 0.16
    ref.current.rotation.z = Math.sin(clock.elapsedTime * 0.28) * 0.18
  })

  return (
    <group ref={ref} position={[0, 4.3, 0]}>
      {[3.2, 4.35, 5.5, 6.7].map((radius, index) => (
        <mesh key={radius} rotation={[Math.PI / 2 + index * 0.24, index * 0.35, 0]}>
          <torusGeometry args={[radius, 0.026, 12, 180]} />
          <meshStandardMaterial color={index % 2 ? '#f7c968' : '#62c6ff'} emissive={index % 2 ? '#f7c968' : '#62c6ff'} emissiveIntensity={1.8} />
        </mesh>
      ))}
    </group>
  )
}

function Building({ building }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.material.emissiveIntensity = 0.38 + Math.sin(clock.elapsedTime * 3 + building.id) * 0.2
  })

  return (
    <group position={building.position} rotation={building.rotation}>
      <mesh castShadow ref={ref} scale={building.scale}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#071321" emissive={building.color} emissiveIntensity={0.48} metalness={0.78} roughness={0.2} />
      </mesh>
      <mesh position={[0, building.scale[1] + 0.04, 0]} scale={[building.scale[0] * 1.1, 0.035, building.scale[2] * 1.1]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={building.color} emissive={building.color} emissiveIntensity={1.4} />
      </mesh>
    </group>
  )
}

function MediterraneanArcades() {
  return (
    <group>
      {Array.from({ length: 18 }).map((_, index) => {
        const x = -8.5 + index
        return (
          <group key={index} position={[x, 0.7, 10.8]}>
            <mesh castShadow>
              <boxGeometry args={[0.14, 1.4, 0.2]} />
              <meshStandardMaterial color="#d7c49c" emissive="#4f3a14" emissiveIntensity={0.12} />
            </mesh>
            <mesh position={[0, 0.68, 0]}>
              <torusGeometry args={[0.34, 0.035, 10, 20, Math.PI]} />
              <meshStandardMaterial color="#f7c968" emissive="#f7c968" emissiveIntensity={0.38} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

function AgricultureDomes() {
  return (
    <group>
      {[[-13, 0.55, -9], [-15.2, 0.5, -5.2], [13.5, 0.55, -9.5], [15, 0.5, -5.5]].map((position, index) => (
        <Float floatIntensity={0.08} key={index} speed={0.8}>
          <mesh position={position}>
            <sphereGeometry args={[1.25, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#7df3c6" emissive="#1bbf82" emissiveIntensity={0.45} transparent opacity={0.36} roughness={0.1} />
          </mesh>
        </Float>
      ))}
    </group>
  )
}

function SmartHarbor() {
  return (
    <group position={[0, 0.05, 18]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[18, 5]} />
        <meshStandardMaterial color="#08233d" emissive="#0c68a5" emissiveIntensity={0.22} transparent opacity={0.72} />
      </mesh>
      {[-6, -2, 2, 6].map((x) => (
        <mesh key={x} position={[x, 0.18, -1.4]}>
          <boxGeometry args={[2.2, 0.22, 0.5]} />
          <meshStandardMaterial color="#0d1624" emissive="#62c6ff" emissiveIntensity={0.72} />
        </mesh>
      ))}
    </group>
  )
}

function MediterraneanCoast() {
  const water = useRef()
  useFrame(({ clock }) => {
    if (!water.current) return
    water.current.material.emissiveIntensity = 0.18 + Math.sin(clock.elapsedTime * 1.4) * 0.04
  })
  return (
    <mesh ref={water} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 21]}>
      <planeGeometry args={[60, 18, 16, 16]} />
      <meshStandardMaterial color="#051b2c" emissive="#0b68b0" emissiveIntensity={0.18} metalness={0.3} roughness={0.18} transparent opacity={0.78} />
    </mesh>
  )
}

function EnergyRoads() {
  return (
    <group>
      {Array.from({ length: 18 }).map((_, index) => {
        const angle = (index / 18) * Math.PI * 2
        return (
          <mesh key={index} rotation={[-Math.PI / 2, 0, angle]} position={[0, 0.045, 0]}>
            <planeGeometry args={[0.055, 42]} />
            <meshStandardMaterial color="#62c6ff" emissive="#62c6ff" emissiveIntensity={1.05} transparent opacity={0.56} />
          </mesh>
        )
      })}
      {[6.6, 10.2, 14.5].map((radius) => (
        <mesh key={radius} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.055, 0]}>
          <torusGeometry args={[radius, 0.035, 8, 160]} />
          <meshStandardMaterial color="#f7c968" emissive="#f7c968" emissiveIntensity={0.95} transparent opacity={0.72} />
        </mesh>
      ))}
    </group>
  )
}

function LivingTraffic() {
  const trams = useMemo(
    () =>
      Array.from({ length: 16 }).map((_, index) => ({
        radius: 7 + (index % 4) * 2.7,
        speed: 0.22 + (index % 5) * 0.035,
        offset: (index / 16) * Math.PI * 2,
        y: 2.4 + (index % 3) * 0.55,
        color: index % 2 ? '#f7c968' : '#62c6ff',
      })),
    [],
  )

  return (
    <group>
      {trams.map((tram, index) => (
        <TrafficCraft key={index} tram={tram} />
      ))}
    </group>
  )
}

function TrafficCraft({ tram }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current) return
    const angle = clock.elapsedTime * tram.speed + tram.offset
    ref.current.position.set(Math.cos(angle) * tram.radius, tram.y, Math.sin(angle) * tram.radius)
    ref.current.rotation.y = -angle + Math.PI / 2
  })

  return (
    <mesh ref={ref} castShadow>
      <boxGeometry args={[0.9, 0.18, 0.28]} />
      <meshStandardMaterial color="#050b12" emissive={tram.color} emissiveIntensity={1.65} metalness={0.55} roughness={0.18} />
    </mesh>
  )
}

function DroneSwarm() {
  const drones = useMemo(
    () =>
      Array.from({ length: 26 }).map((_, index) => ({
        radius: 6 + Math.random() * 14,
        speed: 0.15 + Math.random() * 0.3,
        offset: Math.random() * Math.PI * 2,
        y: 4 + Math.random() * 8,
      })),
    [],
  )

  return drones.map((drone, index) => <Drone drone={drone} key={index} />)
}

function Drone({ drone }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current) return
    const angle = clock.elapsedTime * drone.speed + drone.offset
    ref.current.position.set(Math.cos(angle) * drone.radius, drone.y + Math.sin(clock.elapsedTime * 1.7 + drone.offset) * 0.5, Math.sin(angle) * drone.radius)
    ref.current.rotation.y = -angle
  })
  return (
    <group ref={ref}>
      <mesh>
        <octahedronGeometry args={[0.12, 0]} />
        <meshStandardMaterial color="#dff8ff" emissive="#62c6ff" emissiveIntensity={2.2} />
      </mesh>
      <pointLight color="#62c6ff" distance={3.5} intensity={0.8} />
    </group>
  )
}

function HologramNetwork() {
  const panels = [
    { position: [-8, 3.2, -2], label: 'SYBARIS AGRI-DOME', color: '#7df3c6' },
    { position: [7.5, 3.5, -3.2], label: 'IONIAN PORT ONLINE', color: '#62c6ff' },
    { position: [-5.5, 4, 7.2], label: 'PUBLIC VOTE LIVE', color: '#f7c968' },
    { position: [5.8, 3.8, 7.4], label: 'ARCHIVE OF KNOWLEDGE', color: '#b98cff' },
  ]

  return panels.map((panel) => <HologramPanel key={panel.label} panel={panel} />)
}

function HologramPanel({ panel }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.55 + panel.position[0]) * 0.22
    ref.current.position.y = panel.position[1] + Math.sin(clock.elapsedTime * 1.1) * 0.16
  })

  return (
    <group position={panel.position} ref={ref}>
      <mesh>
        <planeGeometry args={[2.6, 1]} />
        <meshStandardMaterial color={panel.color} emissive={panel.color} emissiveIntensity={1.2} transparent opacity={0.22} side={THREE.DoubleSide} />
      </mesh>
      <Html center distanceFactor={11} position={[0, 0, 0.02]}>
        <div className="world-label billboard">{panel.label}</div>
      </Html>
    </group>
  )
}

function NPC({ active, npc, onSelect }) {
  const group = useRef()
  const body = useRef()

  useFrame(({ clock, camera }) => {
    if (!group.current || !body.current) return
    const t = clock.elapsedTime
    group.current.position.x = npc.position[0] + Math.sin(t * 0.35 + npc.position[2]) * npc.path
    group.current.position.z = npc.position[2] + Math.cos(t * 0.32 + npc.position[0]) * npc.path
    group.current.lookAt(camera.position.x, group.current.position.y, camera.position.z)
    body.current.position.y = Math.sin(t * 2 + npc.position[0]) * 0.12
  })

  return (
    <group position={npc.position} ref={group}>
      <Float floatIntensity={0.35} speed={1.8}>
        <mesh
          castShadow
          onClick={(event) => {
            event.stopPropagation()
            onSelect()
          }}
          ref={body}
          scale={npc.scale}
        >
          <capsuleGeometry args={[0.28, 0.9, 8, 16]} />
          <meshStandardMaterial color={npc.color} emissive={npc.color} emissiveIntensity={active ? 3.1 : 1.45} roughness={0.15} />
        </mesh>
      </Float>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.82, 0]}>
        <ringGeometry args={[0.76, 0.82, 44]} />
        <meshStandardMaterial color={npc.color} emissive={npc.color} emissiveIntensity={1.8} transparent opacity={0.76} />
      </mesh>
      <Html center distanceFactor={8} position={[0, 1.18, 0]}>
        <div className={`world-label ${active ? 'active' : ''}`}>{npc.name}</div>
      </Html>
    </group>
  )
}

function AITerminals({ onTerminalActivate }) {
  const terminals = [
    { position: [-2.8, 0.4, 4.2], label: 'Memory archive' },
    { position: [2.9, 0.4, 4.2], label: 'Ethics vote' },
    { position: [0, 0.4, -7.2], label: 'Hidden terminal' },
    { position: [-10.5, 0.4, 10.4], label: 'Harbor signal' },
  ]

  return terminals.map((terminal) => (
    <Float floatIntensity={0.25} key={terminal.label} speed={1.4}>
      <group position={terminal.position}>
        <mesh
          castShadow
          onClick={(event) => {
            event.stopPropagation()
            onTerminalActivate()
          }}
        >
          <cylinderGeometry args={[0.42, 0.6, 0.8, 6]} />
          <meshStandardMaterial color="#0b2036" emissive="#62c6ff" emissiveIntensity={1.25} metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.7, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.58, 0.025, 10, 48]} />
          <meshStandardMaterial color="#f7c968" emissive="#f7c968" emissiveIntensity={1.8} />
        </mesh>
        <Html center distanceFactor={10} position={[0, 1.28, 0]}>
          <div className="world-label terminal-label">{terminal.label}</div>
        </Html>
      </group>
    </Float>
  ))
}

function EnergyBeam({ from, height, color }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.material.opacity = 0.3 + Math.sin(clock.elapsedTime * 3) * 0.08
  })
  return (
    <mesh position={[from[0], height / 2, from[2]]} ref={ref}>
      <cylinderGeometry args={[0.055, 0.26, height, 24, 1, true]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.2} transparent opacity={0.32} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  )
}

function ParticleField() {
  const points = useMemo(() => {
    const positions = new Float32Array(1600 * 3)
    for (let i = 0; i < 1600; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 58
      positions[i * 3 + 1] = Math.random() * 22 + 0.6
      positions[i * 3 + 2] = (Math.random() - 0.5) * 58
    }
    return positions
  }, [])

  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.rotation.y = clock.elapsedTime * 0.02
    ref.current.position.y = Math.sin(clock.elapsedTime * 0.35) * 0.25
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[points, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#bcefff" blending={THREE.AdditiveBlending} depthWrite={false} size={0.05} transparent opacity={0.72} />
    </points>
  )
}

export default WorldScene
