import Draggable from 'react-draggable'
import { useLocalStorage } from './helpers'
import { useEffect } from 'react'

function FlashArea() {
  // eslint-disable-next-line no-unused-vars
  const [formState, setFormState] = useLocalStorage('formState', {
    text: '',
    selectedPostion: '',
    selectedFontSize: '',
    selectedFontType: '',
    color: '#000',
    howLong: '',
    interval: ''
  })

  const boxDimensions = { width: 800, height: 400 } // Dimensions of the draggable box

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.storageArea === window.localStorage) {
        setFormState(JSON.parse(window.localStorage.getItem('formState')))
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [setFormState])

  return (
    <div
      className="play-section"
      style={{
        fontFamily: formState?.selectedFontType,
        fontSize: `${formState?.selectedFontSize}px`,
        color: formState?.color,
        backgroundColor: 'transparent'
      }}
    >
      {/*  <button

        onClick={() => {
          window.electron.ipcRenderer.send('close-other-windows')
        }}
      >
        ✖️ Close
      </button> */}
      <Draggable position={formState?.draggedPosition} disabled={true}>
        <div
          className="draggable-box"
          style={{
            width: boxDimensions.width,
            height: boxDimensions.height,
            backgroundColor: 'transparent'
          }}
        >
          {formState?.text}
        </div>
      </Draggable>
    </div>
  )
}

export default FlashArea
