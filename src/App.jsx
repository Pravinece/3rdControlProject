import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'
import Experience from './Pages/Screen/Experience'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <section className="hero" id="center">
        <div className="heroContent" >
          <Experience />
        </div>
      </section>
    </>
  )
}

export default App
