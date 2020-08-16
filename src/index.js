import 'pepjs'
import React, { useState, useRef, useEffect } from 'react'
import { render } from 'react-dom'
import { Canvas, useThree } from 'react-three-fiber'
import { useSpring, animated } from 'react-spring'
import { useArray, usePrevious } from 'react-hanger'
// import { useUpdate } from 'react-use'
import { Math as ThreeMath } from 'three'
import cloneDeep from 'lodash.clonedeep'

import Grid from './grid'
import Thing from './components/Thing'
import ScorePopup from './components/ScorePopup'
import './styles.css'

const ComponentGrid = ({ width, height, setScore }) => {
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
  // const upd = useUpdate()
  // useTimeoutFn()
  // const [isReady, cancel, reset] = useTimeoutFn(fn, 250);

  useEffect(() => {
    const gridModel = gridInstance.current
    console.log('swapstack value: ', swapStack.value)
    if (swapStack.value.length === 2) {
      try {
        swapStack.clear()
        const beforeGrid = cloneDeep(gridModel._grid)
        const newGrid = gridModel.swapPositions(swapStack.value[0], swapStack.value[1])
        if (newGrid) {
          setGrid(newGrid)
          // Find out the matches
          const matchA = gridModel.findMatchForField(swapStack.value[0].pos)
          const matchB = gridModel.findMatchForField(swapStack.value[1].pos)

          // @todo Swap back on no match, figure out hooks?
          if (!matchA && !matchB) {
            setTimeout(() => {
              // console.log('no match, reverting..')
              // console.log(swapStack)
              // const revertGrid = gridModel.swapPositions(swapStack.value[1], swapStack.value[0])
              console.log('no matches, reverting..')
              setGrid(beforeGrid)
            }, 250)
            return () => {
              console.log('stopping early because no match')
            }
          }

          // Recursive function dealing with matches, filling the grid back up
          // And dealing with matches resulting from that...
          const processMatches = (matches = []) => {
            // Remove matches, push gems down
            const gridWithoutMatches = matches.reduce((_grid, match) => {
              if (!match) return _grid
              if (match.length) setScore((prevScore) => prevScore + match.length * 10)
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

    return () => {
      // console.log('dropping useEffect hook')
    }
  }, [swapStack, setGrid, setScore])

  if (!grid) return null
  const spacing = 0.2
  const gridComponent = grid.map((item) => {
    const [x, y] = item.pos
    const active = swapStack.value.find((stackItem) => stackItem && stackItem.id === item.id)
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

    camera.lookAt(0, 3, 0)
    camera.fov = Math.max(multiplier * baseFOV, baseFOV)
    camera.updateProjectionMatrix()
  }, [camera, viewport.width])
  return null
}

function App() {
  const [started, setStarted] = useState(false)
  const [score, setScore] = useState(0)
  const prevScore = usePrevious(score)
  const scorePopups = useArray([])

  useEffect(() => {
    const diff = score - prevScore
    if (diff > 0) {
      scorePopups.push({ id: Math.floor(Math.random() * 10000), value: diff })
    }
  }, [score, prevScore])

  const hud = useSpring({ score, from: { score: 0 } })

  return (
    <>
      <Canvas shadowMap camera={{ position: [0, 3, 7], aspect: 1 }}>
        <CameraTweaker />
        <ambientLight color="white" intensity={0.2} />
        <directionalLight color="white" intensity={0.75} position={[0, 10, 10]}>
          <mesh attach="target" position={[0, 2, 0]} />
        </directionalLight>
        <pointLight castShadow color="red" position={[-5, 0, 5]} intensity={0.2} />
        <pointLight castShadow color="blue" position={[5, 0, 5]} intensity={0.2} />
        <pointLight castShadow color="white" position={[-1, 0, 5]} intensity={0.2} />
        <pointLight castShadow color="white" position={[1, 0, 5]} intensity={0.2} />
        {started ? <ComponentGrid width={7} height={7} setScore={setScore} /> : null}

        {/* Shadows on a plane */}
        <mesh receiveShadow position-z={-15} rotation-x={ThreeMath.degToRad(-85)}>
          <planeBufferGeometry attach="geometry" args={[1000, 1000]} />
          <meshPhongMaterial attach="material" color="#333" />
        </mesh>
      </Canvas>

      <span className="score">
        Score:&nbsp;
        <animated.span>{hud.score.interpolate((val) => Math.floor(val).toString())}</animated.span>
      </span>

      {scorePopups.value.map((scorePopup) => (
        <ScorePopup key={scorePopup.id} {...scorePopup} onRemove={() => scorePopups.removeById(scorePopup.id)} />
      ))}

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
