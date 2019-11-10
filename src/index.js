import 'pepjs'
import React, { useState, useRef, useEffect } from 'react'
import { render } from 'react-dom'
import { Canvas, useThree } from 'react-three-fiber'
import { Math as ThreeMath } from 'three'
import { useArray } from 'react-hanger'

import Grid from './grid'
import Thing from './components/Thing'
import './styles.css'

const ComponentGrid = ({ component, width, height }) => {
  const gridInstance = useRef(null)
  const [grid, setGrid] = useState(null)

  useEffect(() => {
    gridInstance.current = new Grid(width, height)
    setGrid(gridInstance.current._grid)

    // cleanup
    return () => {
      delete gridInstance.current
    }
  }, [width, height])

  const swapStack = useArray([])

  useEffect(() => {
    const gridModel = gridInstance.current
    if (swapStack.value.length === 2) {
      try {
        swapStack.clear()
        const newGrid = gridModel.swapPositions(swapStack.value[0], swapStack.value[1])
        if (newGrid) {
          setGrid(newGrid)
          // Find out the matches
          const matchA = gridModel.findMatchForField(swapStack.value[0].pos)
          const matchB = gridModel.findMatchForField(swapStack.value[1].pos)

          // Return on no match
          if (!matchA && !matchB) return

          // Recursive function dealing with matches, filling the grid back up
          // And dealing with matches resulting from that...
          const processMatches = (matches = []) => {
            // Remove matches, push gems down
            const gridWithoutMatches = matches.reduce((_grid, match) => {
              if (!match) return _grid
              gridModel._grid = _grid.removeMatch(match)
              return gridModel
            }, gridModel)

            // Delay every step a bit so react-spring animations are visible
            // There's probably a better way but this seems to work exactly right :)
            setTimeout(() => {
              setGrid(gridWithoutMatches._grid)
              setTimeout(() => {
                setGrid(gridModel.moveDown())
                setTimeout(() => {
                  setGrid(gridModel.fill())
                  const chainMatches = gridModel.findAllMatches()
                  if (chainMatches.length > 0) {
                    // Recurse here
                    console.log(chainMatches.length, ' chain matches found')
                    processMatches(chainMatches)
                  }
                }, 200)
              }, 200)
            }, 200)
          }

          processMatches([matchA, matchB])
        }
      } catch (e) {
        console.warn(e.toString())
        console.warn(e.stack)
      }
    }
  }, [swapStack])

  if (!grid) return null
  const spacing = 0.2
  const gridComponent = grid.map(item => {
    const [x, y] = item.pos
    const active = swapStack.value.find(stackItem => stackItem && stackItem.id === item.id)
    return (
      <Thing
        key={item.id}
        type={item.type}
        position={[x + x * spacing, y + y * spacing, 0]}
        active={active}
        onClick={() => {
          swapStack.push(item)
        }}
      />
    )
  })
  return <group position={[-3.33, 0, 0]}>{gridComponent}</group>
}

// Seems to fit the grid +/- to screen on mobile and desktop
const CameraTweaker = () => {
  const { camera, viewport } = useThree()
  useEffect(() => {
    const baseFOV = 75
    const multiplier = (11 / viewport.width) * 0.8

    camera.fov = Math.max(multiplier * baseFOV, baseFOV)
    camera.updateProjectionMatrix()
  }, [])
  return null
}

function App() {
  const [started, setStarted] = useState(false)
  return (
    <>
      <Canvas shadowMap camera={{ position: [0, 3, 7], aspect: 1 }}>
        <CameraTweaker />
        <ambientLight color="white" intensity={0.3} />
        <pointLight castShadow color="red" position={[-5, 0, 1]} intensity={0.2} />
        <pointLight castShadow color="blue" position={[5, 0, 1]} intensity={0.2} />
        <pointLight castShadow color="white" position={[0, 10, 5]} intensity={0.5} />
        {started ? <ComponentGrid width={7} height={7} /> : null}

        {/* Shadows on a plane */}
        <mesh receiveShadow position-z={-15} rotation-x={ThreeMath.degToRad(-85)}>
          <planeBufferGeometry attach="geometry" args={[1000, 1000]} />
          <meshPhongMaterial attach="material" color="grey" />
        </mesh>
      </Canvas>

      {!started && (
        <div className="intro">
          <h2>
            shiny stones
            <br />
            💎
          </h2>
          <p onClick={() => setStarted(true)}>Click to play!</p>
        </div>
      )}
    </>
  )
}

render(<App />, document.querySelector('#root'))
