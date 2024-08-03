/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react'
import Draggable from 'react-draggable'

function PlaySection({ previewMode, setPreviewMode, setIsPlaying, formState, setFormState }) {
  // const isRunning = useRef(false) // Flag to check if the async function is currently running

  // // Async function to be run at intervals
  // const fetchData = async () => {}

  // useEffect(() => {
  //   const intervalId = setInterval(async () => {
  //     if (!isRunning.current) {
  //       isRunning.current = true
  //       await fetchData()
  //       isRunning.current = false
  //     }
  //   }, 5000) // Interval in milliseconds (e.g., 5000ms = 5 seconds)

  //   // Cleanup function to clear the interval when the component is unmounted
  //   return () => clearInterval(intervalId)
  // }, [])

  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })
  const boxDimensions = { width: 800, height: 400 } // Dimensions of the draggable box

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({ width: window.innerWidth, height: window.innerHeight })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const positions = {
    topLeft: { x: 0, y: 0 },
    topCenter: { x: (windowDimensions.width - boxDimensions.width) / 2, y: 0 },
    topRight: { x: windowDimensions.width - boxDimensions.width, y: 0 },
    centerLeft: { x: 0, y: (windowDimensions.height - boxDimensions.height) / 2 },
    center: {
      x: (windowDimensions.width - boxDimensions.width) / 2,
      y: (windowDimensions.height - boxDimensions.height) / 2
    },
    centerRight: {
      x: windowDimensions.width - boxDimensions.width,
      y: (windowDimensions.height - boxDimensions.height) / 2
    },
    bottomLeft: { x: 0, y: windowDimensions.height - boxDimensions.height },
    bottomCenter: {
      x: (windowDimensions.width - boxDimensions.width) / 2,
      y: windowDimensions.height - boxDimensions.height
    },
    bottomRight: {
      x: windowDimensions.width - boxDimensions.width,
      y: windowDimensions.height - boxDimensions.height
    }
  }

  const onStop = (e, data) => {
    setFormState({ ...formState, draggedPosition: data, selectedPostion: 'drag' })
  }

  useEffect(() => {
    setFormState({
      ...formState,
      draggedPosition:
        formState?.selectedPostion === 'drag' && formState?.draggedPosition
          ? formState.draggedPosition
          : formState?.selectedPostion === 'drag'
            ? positions['center']
            : positions[formState?.selectedPostion]
    })
  }, [])

  return (
    <div
      className="play-section"
      style={{
        fontFamily: formState?.selectedFontType,
        fontSize: `${formState?.selectedFontSize}px`,
        color: formState?.color
      }}
    >
      <button
        onClick={() => {
          setPreviewMode(false)
          setIsPlaying(false)
        }}
      >
        ✖️ Close {previewMode ? 'Preview' : ''}
      </button>

      <Draggable position={formState?.draggedPosition} onStop={onStop}>
        <div
          className="draggable-box"
          style={{
            width: boxDimensions.width,
            height: boxDimensions.height,
            border: '2px solid red',
            cursor: 'grab'
          }}
        >
          {formState?.text}
        </div>
      </Draggable>
    </div>
  )
}

export default PlaySection
