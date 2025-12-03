function About({ onStartTour }) {
  return (
    <main className="main-content">
      <header>
        <button
          id="about-tour-btn"
          onClick={onStartTour}
          className="tour-button"
        >
          Start About Tour
        </button>
      </header>

      <h1 id="about-heading">About React Guide</h1>

      <div className="about-container">
        <section className="about-section" id="what-is-it">
          <h2>What is React Guide?</h2>
          <p>
            React Guide is a lightweight, customizable tour/guide component for React applications.
            It helps you create interactive walkthroughs to onboard users and showcase features.
          </p>
        </section>

        <section className="about-section" id="features-list">
          <h2>Key Features</h2>
          <ul>
            <li>Spotlight effect on target elements</li>
            <li>Smooth animations and transitions</li>
            <li>Flexible positioning (auto-detects best placement)</li>
            <li>Support for ID and className targeting</li>
            <li>Progress indicator</li>
            <li>Customizable callbacks</li>
          </ul>
        </section>

        <section className="about-section" id="how-to-use">
          <h2>How to Use</h2>
          <pre className="code-block">
{`import { ReactGuide } from 'react-guide'

const steps = [
  { step: 1, id: 'element-id', content: 'Description' },
  { step: 2, className: 'my-class', content: 'Another step' }
]

<ReactGuide
  steps={steps}
  isOpen={true}
  onComplete={() => console.log('Done!')}
/>`}
          </pre>
        </section>

        <section className="about-section" id="contact-info">
          <h2>Contact</h2>
          <p>Have questions? Reach out to us!</p>
          <button className="contact-btn">Get in Touch</button>
        </section>
      </div>
    </main>
  )
}

export default About
