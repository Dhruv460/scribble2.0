import { useState } from 'react'
import './App.css'
import Gamezone from './Managers/Gamezone.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Gamezone />
    </>
  )
}

export default App
