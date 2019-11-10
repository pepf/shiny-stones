import React, { useState, useEffect, useMemo } from 'react'
import { useSpring, animated } from 'react-spring/three'
import { Math as ThreeMath } from 'three'

type ThingProps = {
  type: 0 | 1 | 2 | 3 | 4
  position: [number, number, number]
  active: boolean
  onClick: (e: MouseEvent, type: ThingProps['type']) => void
}
const geometries = ['octahedron', 'icosahedron', 'octahedron', 'dodecahedron', 'tetrahedron']

const Thing: React.FC<ThingProps> = props => {
  const Geometry = useMemo(() => `${geometries[props.type]}BufferGeometry`, [props.type])
  const [hover, setHover] = useState(false)
  const [init, setInit] = useState(false)
  const color = ['red', 'green', 'blue', 'purple', 'orange'][props.type]
  const { scale, rotation, position, metalness, emissive } = useSpring({
    position: init ? props.position : [props.position[0], props.position[1] + 0.5, props.position[2]],
    scale: props.active ? [1.2, 1.2, 1.2] : [1, 1, 1],
    rotation: hover ? ThreeMath.degToRad(90) : 0,
    metalness: props.active ? 0 : 0.5
  })

  useEffect(() => {
    setInit(true)
    return () => {
      // console.log('cleanup!')
    }
  }, [])

  return (
    <group>
      <animated.mesh
        position={position}
        scale={scale}
        rotation-x={rotation}
        receiveShadow
        castShadow
        onClick={e => props.onClick(e, props.type)}
        onPointerOver={e => setHover(true)}
        onPointerOut={e => setHover(false)}>
        <Geometry attach="geometry" args={[0.5, 0]} />
        <animated.meshStandardMaterial attach="material" color={color} roughness={0.5} metalness={metalness} />
      </animated.mesh>
      {props.active ? (
        <animated.mesh position={position}>
          <torusBufferGeometry attach="geometry" args={[0.75, 0.05, 2, 5, 6.43]} />
          <meshBasicMaterial attach="material" color="#aaaaaa" transparent />
        </animated.mesh>
      ) : null}
    </group>
  )
}

export default Thing
