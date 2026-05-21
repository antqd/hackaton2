import { useGLTF } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'

const CITY_TARGET_SIZE = 80

function City() {
  const { scene } = useGLTF('/models/city.glb')

  const { model, position, scale } = useMemo(() => {
    const clonedScene = scene.clone(true)
    const box = new THREE.Box3().setFromObject(clonedScene)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const footprint = Math.max(size.x, size.z) || 1
    const normalizedScale = CITY_TARGET_SIZE / footprint

    clonedScene.traverse((object) => {
      if (!object.isMesh) return

      object.castShadow = true
      object.receiveShadow = true
      object.frustumCulled = true

      if (object.material) {
        object.material = object.material.clone()
        object.material.envMapIntensity = 0.55
        object.material.roughness = Math.min(object.material.roughness ?? 0.65, 0.72)

        if ('emissive' in object.material) {
          object.material.emissive = object.material.emissive ?? new THREE.Color('#061827')
          object.material.emissiveIntensity = Math.max(object.material.emissiveIntensity ?? 0, 0.035)
        }
      }
    })

    return {
      model: clonedScene,
      position: [
        -center.x * normalizedScale,
        -box.min.y * normalizedScale,
        -center.z * normalizedScale,
      ],
      scale: normalizedScale,
    }
  }, [scene])

  return (
    <group position={position} scale={scale}>
      <primitive object={model} />
    </group>
  )
}

useGLTF.preload('/models/city.glb')

export default City
