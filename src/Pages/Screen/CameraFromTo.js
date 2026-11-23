import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { gsap } from 'gsap'
import { AVATAR_POSITIONS } from '../../datas/positions'

export function CameraFromTo({ mode }) {
  const { camera } = useThree()

  useEffect(() => {
    const target = AVATAR_POSITIONS[mode]
    if (!target) return

    const [tx, ty, tz] = target.camPosition

    gsap.to(camera.position, {
      x: tx, y: ty, z: tz,
      duration: 1.5,
      ease: 'power2.inOut',
      onUpdate: () => camera.updateProjectionMatrix(),
    })

    gsap.to(camera, {
      fov: target.fov,
      duration: 1.5,
      ease: 'power2.inOut',
      onUpdate: () => camera.updateProjectionMatrix(),
    })
  }, [mode])

  return null
}
