// import Versions from './components/Versions'
// import electronLogo from './assets/electron.svg'

import { useState } from 'react'
import PlaySection from './components/PlaySection'
import ColorPickerDropdown from './components/ColorPickerDropdown'
import { useLocalStorage, waitFor } from './helpers'

import playImg from './assets/play.png'
import stopImg from './assets/red_stop_button.png'

const commonFonts = [
  'Arial',
  'Arial Black',
  'Comic Sans MS',
  'Courier New',
  'Georgia',
  'Helvetica',
  'Impact',
  'Times New Roman',
  'Trebuchet MS',
  'Verdana'
]

// const fontSizes = [
//   '8', // Extra small
//   '10', // Small
//   '12', // Base text size
//   '14', // Slightly larger
//   '16', // Common body text size
//   '18', // Medium
//   '20', // Large
//   '24', // Extra large
//   '32', // Heading size
//   '48', // Larger heading
//   '64' // Extra large heading
// ]

const positions = [
  { value: 'drag', label: 'Drag and Drop' },
  { value: 'topLeft', label: 'Top Left' },
  { value: 'topCenter', label: 'Top Center' },
  { value: 'topRight', label: 'Top Right' },
  { value: 'centerLeft', label: 'Center Left' },
  { value: 'center', label: 'Center' },
  { value: 'centerRight', label: 'Center Right' },
  { value: 'bottomLeft', label: 'Bottom Left' },
  { value: 'bottomCenter', label: 'Bottom Center' },
  { value: 'bottomRight', label: 'Bottom Right' }
]

function Home() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  const [formState, setFormState] = useLocalStorage('formState', {
    text: '',
    selectedPostion: '',
    selectedFontSize: '',
    selectedFontType: '',
    color: '#000',
    howLong: '',
    interval: ''
  })

  const handleChange = async (e) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
      ...(e.target.name === 'selectedPostion' && !e.target.value === 'drag'
        ? { draggedPosition: null }
        : {}),
      time: Date.now()
    })
    await waitFor(100)
    if (e.target.name === 'selectedPostion')
      // if (e.target.value === 'drag') {
      setPreviewMode(true)
    //  }
  }

  // const ipcHandle = () => window.electron.ipcRenderer.send('ping')
  // const ipcOpenFlashWindow = () => window.electron.ipcRenderer.send('flash', formState)

  const startTimeout = () => window.electron.ipcRenderer.send('startTimeout', formState)

  const cancelTimeout = () => window.electron.ipcRenderer.send('cancelTimeout', formState)

  return (
    <main className="app-setup">
      <form
        autoComplete="off"
        onSubmit={async (e) => {
          e.preventDefault()

          //  alert('l')

          setIsPlaying(true)
          await waitFor(50)
          startTimeout()
        }}
      >
        <div className="area">
          <input
            className="form-input"
            placeholder="Enter Text"
            required
            name="text" // This is the name attribute
            value={formState?.text}
            onChange={handleChange}
          />

          <div className="form-section">
            {/* <div className="custom-select">
            <select
              required
              name="selectedFontSize" // This is the name attribute
              value={formState?.selectedFontSize}
              onChange={handleChange}
            >
              <option value="">Font size</option>
              {fontSizes.map((el) => (
                <option key={el} value={el}>
                  {el}
                </option>
              ))}
            </select>
          </div> */}
            <input
              type="number"
              className="form-input"
              placeholder="Font size"
              required
              title="Seconds"
              name="selectedFontSize" // This is the name attribute
              value={formState?.selectedFontSize}
              onChange={handleChange}
            />

            <div className="custom-select">
              <select
                required
                name="selectedFontType" // This is the name attribute
                value={formState?.selectedFontType}
                onChange={handleChange}
                style={{ fontFamily: formState?.selectedFontType }}
              >
                <option style={{ fontFamily: 'Arial, sans-serif' }} value="">
                  Font type
                </option>
                {commonFonts.map((el) => (
                  <option style={{ fontFamily: el }} key={el} value={el}>
                    {el}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-section">
            <ColorPickerDropdown
              color={formState.color}
              setColor={(color) => setFormState({ ...formState, color })}
            />
            <div className="custom-select">
              <select
                required
                name="selectedPostion" // This is the name attribute
                value={formState?.selectedPostion}
                onChange={handleChange}
              >
                <option value="">Position</option>
                {positions.map((el) => (
                  <option key={el.value} value={el.value}>
                    {el.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-section">
            <input
              type="number"
              className="form-input"
              placeholder="How long"
              required
              title="How long in miliseconds"
              name="howLong" // This is the name attribute
              value={formState?.howLong}
              onChange={handleChange}
              //  min={500}
            />
            <input
              type="number"
              className="form-input"
              placeholder="Interval"
              required
              title="Interval in miliseconds"
              name="interval" // This is the name attribute
              value={formState?.interval}
              onChange={handleChange}
              //   min={500}
            />
          </div>
        </div>

        {!isPlaying && (
          <button key={'play'} title="Play" className="action-btn" type="submit">
            <img src={playImg} style={{ width: '100%', height: '100%' }} />
          </button>
        )}

        {isPlaying && (
          <button
            key={'stop'}
            title="Stop"
            className="action-btn stop"
            type="button"
            onClick={async (e) => {
              e.stopPropagation()
              setIsPlaying(false)
              await waitFor(50)
              cancelTimeout()
            }}
          >
            <img src={stopImg} style={{ width: '100%', height: '100%' }} />
          </button>
        )}
      </form>

      {previewMode ? (
        <PlaySection
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          previewMode={previewMode}
          setPreviewMode={setPreviewMode}
          formState={formState}
          setFormState={setFormState}
        />
      ) : null}
    </main>
  )
}

export default Home
