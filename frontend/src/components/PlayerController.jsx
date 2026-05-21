import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const WALK_SPEED = 10
const SPRINT_SPEED = 18
const START = new THREE.Vector3(-14, 2.5, 3)
const WORLD_LIMIT = 95

function PlayerController({ onPlayerPosition }) {
  const keys = useRef({})
  const yaw = useRef(0)
  const pitch = useRef(0)
  const velocity = useRef(new THREE.Vector3())
  const direction = useRef(new THREE.Vector3())
  const forwardVector = useRef(new THREE.Vector3())
  const rightVector = useRef(new THREE.Vector3())
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'))
  const { camera, gl } = useThree()
  const lastPositionUpdate = useRef(0)

  useEffect(() => {
    camera.position.copy(START)
    camera.rotation.order = 'YXZ'

    const canvas = gl.domElement
    canvas.tabIndex = 0
    const lock = () => {
      canvas.focus()
      canvas.requestPointerLock?.()
    }
    const mouseMove = (event) => {
      if (document.pointerLockElement !== canvas) return
      yaw.current -= event.movementX * 0.0022
      pitch.current = THREE.MathUtils.clamp(pitch.current - event.movementY * 0.0018, -1.15, 1.05)
    }
    const keyDown = (event) => {
      event.preventDefault()
      keys.current[event.code] = true
      keys.current[event.key.toLowerCase()] = true
    }
    const keyUp = (event) => {
      event.preventDefault()
      keys.current[event.code] = false
      keys.current[event.key.toLowerCase()] = false
    }

    canvas.addEventListener('click', lock)
    document.addEventListener('click', lock)
    document.addEventListener('mousemove', mouseMove)
    document.addEventListener('keydown', keyDown)
    document.addEventListener('keyup', keyUp)

    return () => {
      canvas.removeEventListener('click', lock)
      document.removeEventListener('click', lock)
      document.removeEventListener('mousemove', mouseMove)
      document.removeEventListener('keydown', keyDown)
      document.removeEventListener('keyup', keyUp)
    }
  }, [camera, gl])

  useFrame((_, delta) => {
    euler.current.set(pitch.current, yaw.current, 0)
    camera.quaternion.setFromEuler(euler.current)

    const forward =
      Number(keys.current.KeyW || keys.current.w || keys.current.ArrowUp) -
      Number(keys.current.KeyS || keys.current.s || keys.current.ArrowDown)
    const strafe =
      Number(keys.current.KeyD || keys.current.d || keys.current.ArrowRight) -
      Number(keys.current.KeyA || keys.current.a || keys.current.ArrowLeft)
    const speed = keys.current.ShiftLeft || keys.current.ShiftRight ? SPRINT_SPEED : WALK_SPEED

    camera.getWorldDirection(forwardVector.current)
    forwardVector.current.y = 0
    forwardVector.current.normalize()
    rightVector.current.crossVectors(forwardVector.current, camera.up).normalize()

    direction.current
      .copy(forwardVector.current)
      .multiplyScalar(forward)
      .addScaledVector(rightVector.current, strafe)

    if (direction.current.lengthSq() > 0) {
      direction.current.normalize()
      velocity.current.lerp(direction.current.multiplyScalar(speed), 0.22)
    } else {
      velocity.current.lerp(new THREE.Vector3(0, 0, 0), 0.18)
    }

    camera.position.addScaledVector(velocity.current, delta)
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -WORLD_LIMIT, WORLD_LIMIT)
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -WORLD_LIMIT, WORLD_LIMIT)
    camera.position.y = START.y

    if (onPlayerPosition && performance.now() - lastPositionUpdate.current > 120) {
      lastPositionUpdate.current = performance.now()
      onPlayerPosition({
        x: Number(camera.position.x.toFixed(2)),
        y: Number(camera.position.y.toFixed(2)),
        z: Number(camera.position.z.toFixed(2)),
      })
    }
  })

  return null
}

export default PlayerController
