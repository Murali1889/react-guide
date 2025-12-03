import { useState } from 'react'

function Home({ onStartTour }) {
  const [count, setCount] = useState(0)

  return (
    <main className="main-content">
      <header>
        <button
          id="start-tour-btn"
          onClick={onStartTour}
          className="tour-button"
        >
          Start Tour
        </button>
      </header>

      <div className="logo-section">
        <a href="https://vite.dev" target="_blank" rel="noreferrer">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src="/react.svg" className="logo react" alt="React logo" />
        </a>
      </div>

      <h1 id="main-heading">Mursa Guide Demo</h1>

      <div className="card">
        <button id="counter-btn" onClick={() => setCount((count) => count + 1)}>
          Count is {count}
        </button>
        <p>
          Click the button above to test interactivity
        </p>
      </div>

      <section className="features">
        <div className="feature-cards">
          <div className="feature-card">
            <h3>Spotlight Effect</h3>
            <p>Highlights the target element with a dark overlay</p>
          </div>
        </div>
        <div className="feature-cards">
          <div className="feature-card">
            <h3>Arrow Pointer</h3>
            <p>Arrow points to the highlighted element</p>
          </div>
        </div>
        <div className="feature-cards">
          <div className="feature-card">
            <h3>Easy Navigation</h3>
            <p>Back, Next, and Skip buttons for control</p>
          </div>
        </div>
      </section>

      <p className="read-the-docs">
        Click "Start Tour" to see Mursa Guide in action!
      </p>
    </main>
  )
}

export default Home
