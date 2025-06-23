import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [isActive, setIsActive] = useState(false)

  const toggleActive = () => {
    // setIsActive(!isActive)
  }

  return (
    <>
      <div id="row-columns">
        <div id="column-left">
          <div id="books" className='wrapper'></div>
          <div id="chapters" className='wrapper'></div>
          <div id="verses" className='wrapper'></div>
        </div>
        <div id="column-right">
          <div id="history" className='wrapper'></div>
        </div>
      </div>
      <div id="row-info">
      <div id="info"></div>
        <button 
          id="btn-select" 
          className={isActive ? 'active' : 'inactive'}
          onClick={toggleActive}
        >
          Live
        </button>
      </div>
    </>
  )
}

export default App
