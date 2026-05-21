import { useGLTF } from '@react-three/drei'
import { useEffect, useMemo } from 'react'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js'
import * as THREE from 'three'

function CharacterModel({ src = '/models/player.glb', height = 1.75, rotationY = Math.PI }) {
  const { scene } = useGLTF(src)

  const { model, offset, scale } = useMemo(() => {
    const clonedScene = clone(scene)
    const box = new THREE.Box3().setFromObject(clonedScene)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const normalizedScale = height / (size.y || 1)

    return {
      offset: [
        -center.x * normalizedScale,
        -box.min.y * normalizedScale,
        -center.z * normalizedScale,
      ],
      model: clonedScene,
      scale: normalizedScale,
    }
  }, [height, scene])

  useEffect(() => {
    model.traverse((object) => {
      if (!object.isMesh) return
      object.castShadow = true
      object.receiveShadow = true
      object.frustumCulled = false
    })
  }, [model])

  return (
    <group position={offset} rotation={[0, rotationY, 0]} scale={scale}>
      <primitive object={model} />
    </group>
  )
}

useGLTF.preload('/models/player.glb')
useGLTF.preload('/models/player2.glb')
useGLTF.preload('/models/player3.glb')
useGLTF.preload('/models/player4.glb')

export default CharacterModel
