import React, { useEffect } from 'react'
import { animated, useSpring } from 'react-spring'

const ScorePopup = ({ value, onRemove }) => {
  useEffect(() => {
    setTimeout(onRemove, 1000)
  }, [])

  const props = useSpring({ top: '5rem', from: { top: '2rem' } })
  return (
    <animated.span className="score-popup" style={props}>
      +{value}
    </animated.span>
  )
}

export default ScorePopup
