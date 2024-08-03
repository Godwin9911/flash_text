import React, { useState, useRef, useEffect } from 'react'
import { HexColorPicker } from 'react-colorful'

const ColorPickerDropdown = ({ color, setColor }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="dropdown-container" ref={dropdownRef}>
      <div className="dropdown-button" onClick={toggleDropdown}>
        Color
        <span className="dropdown-arrow" style={{ color }}>
          ▼
        </span>
      </div>
      {isOpen && (
        <div className="dropdown-menu">
          <HexColorPicker color={color} onChange={setColor} />
        </div>
      )}
    </div>
  )
}

export default ColorPickerDropdown
