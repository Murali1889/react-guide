import { useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import { ReactGuide } from '../../src/ReactGuide.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Settings from './pages/Settings.jsx'
import './App.css'

// Cross-page tour that spans multiple pages
const crossPageTourSteps = [
  {
    step: 1,
    path: '/',
    id: 'start-tour-btn',
    title: 'Welcome to the Full Tour!',
    content: 'This tour will guide you through all pages of the app. Let\'s start here on the Home page.',
    onNext: () => console.log('Starting the tour!')
  },
  {
    step: 2,
    path: '/',
    targets: [
      { className: 'logo' },
    ],
    title: 'Logo Section',
    content: 'These are the Vite and React logos. Notice how we can highlight the entire section!'
  },
  {
    step: 3,
    path: '/',
    targets: [
      { id: 'counter-btn' },
      { id: 'main-heading' }
    ],
    title: 'Multiple Elements',
    content: 'Mursa Guide can highlight multiple elements at once! Here we\'re showing both the heading and the counter button.'
  },
  {
    step: 4,
    path: '/',
    id: 'sidebar-menu',
    title: 'Navigation',
    content: 'Use this menu to navigate. Click "Go to About" to continue!',
    nextLabel: 'Go to About',  // Custom button label
    nextPath: '/about'  // Navigate when clicking Next
  },
  {
    step: 5,
    path: '/about',
    id: 'about-heading',
    title: 'About Page',
    content: 'Welcome to the About page! The tour automatically navigated here.',
    onNext: () => console.log('Viewed About page heading')
  },
  {
    step: 6,
    path: '/about',
    targets: [
      { id: 'what-is-it' },
      { id: 'features-list' }
    ],
    title: 'Learn About Mursa Guide',
    content: 'Here you can see both the introduction and features sections highlighted together.'
  },
  {
    step: 7,
    path: '/about',
    id: 'how-to-use',
    title: 'Usage Example',
    content: 'Check out how easy it is to implement Mursa Guide in your project.',
    nextLabel: 'Go to Settings',
    nextPath: '/settings'
  },
  {
    step: 8,
    path: '/settings',
    id: 'settings-heading',
    title: 'Settings Page',
    content: 'Now we\'ve navigated to Settings! Cross-page tours are seamless.'
  },
  {
    step: 9,
    path: '/settings',
    targets: [
      { id: 'appearance-settings' },
      { id: 'notification-settings' },
      { id: 'language-settings' }
    ],
    title: 'All Settings',
    content: 'We can highlight all three settings sections at once to give users an overview!'
  },
  {
    step: 10,
    path: '/settings',
    id: 'save-settings',
    title: 'Tour Complete!',
    content: 'That\'s it! You\'ve seen how Mursa Guide handles cross-page tours and multiple highlights.',
    nextLabel: 'Complete Tour',
    onNext: () => console.log('Tour completed successfully!')
  }
]

// Single page tours for each page
const homeSteps = [
  {
    step: 1,
    id: 'start-tour-btn',
    title: 'Welcome!',
    content: 'This is the Home page tour. Click Next to continue.'
  },
  {
    step: 2,
    className: 'logo-section',
    title: 'Logos',
    content: 'The Vite and React logos are displayed here.'
  },
  {
    step: 3,
    targets: [
      { id: 'counter-btn' },
      { id: 'main-heading' }
    ],
    title: 'Multiple Highlights Demo',
    content: 'This step highlights TWO elements at once - the heading and counter!'
  },
  {
    step: 4,
    id: 'sidebar-menu',
    title: 'Navigation',
    content: 'Use this sidebar to navigate between pages.'
  }
]

const aboutSteps = [
  {
    step: 1,
    id: 'about-tour-btn',
    title: 'About Tour',
    content: 'Welcome to the About page tour!'
  },
  {
    step: 2,
    targets: [
      { id: 'what-is-it' },
      { id: 'features-list' }
    ],
    title: 'Two Sections',
    content: 'Highlighting both the introduction and features sections together.'
  },
  {
    step: 3,
    id: 'how-to-use',
    title: 'Code Example',
    content: 'See how to implement Mursa Guide in your project.'
  }
]

const settingsSteps = [
  {
    step: 1,
    id: 'settings-tour-btn',
    title: 'Settings Tour',
    content: 'Let\'s explore the Settings page!'
  },
  {
    step: 2,
    targets: [
      { id: 'appearance-settings' },
      { id: 'notification-settings' }
    ],
    title: 'Settings Groups',
    content: 'Multiple settings sections highlighted at once.'
  },
  {
    step: 3,
    id: 'save-settings',
    title: 'Save',
    content: 'Don\'t forget to save your settings!'
  }
]

function AppContent() {
  const navigate = useNavigate()
  const [isTourOpen, setIsTourOpen] = useState(false)
  const [tourType, setTourType] = useState('home') // 'home', 'about', 'settings', 'cross-page'
  const [isClickDisabled, setIsClickDisabled] = useState(true)

  const getSteps = () => {
    switch (tourType) {
      case 'cross-page':
        return crossPageTourSteps
      case 'about':
        return aboutSteps
      case 'settings':
        return settingsSteps
      default:
        return homeSteps
    }
  }

  const handleStartTour = (type) => {
    setTourType(type)
    setIsTourOpen(true)
  }

  const handleNavigate = (path) => {
    navigate(path)
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <nav id="sidebar-menu">
          <h3>Menu</h3>
          <ul>
            <li>
              <NavLink to="/">Home</NavLink>
            </li>
            <li>
              <NavLink to="/about">About</NavLink>
            </li>
            <li>
              <NavLink to="/settings">Settings</NavLink>
            </li>
          </ul>
        </nav>

        {/* Cross-page tour button */}
        <div className="sidebar-section">
          <h3>Full Tour</h3>
          <button
            className="cross-page-tour-btn"
            onClick={() => handleStartTour('cross-page')}
          >
            Start Cross-Page Tour
          </button>
          <p className="sidebar-hint">Tours across all pages!</p>
        </div>

        {/* Click disabled toggle */}
        <div className="sidebar-option">
          <label>
            <input
              type="checkbox"
              checked={isClickDisabled}
              onChange={(e) => setIsClickDisabled(e.target.checked)}
            />
            Disable clicks on highlighted
          </label>
        </div>
      </aside>

      {/* Main Content - Routes */}
      <Routes>
        <Route path="/" element={<Home onStartTour={() => handleStartTour('home')} />} />
        <Route path="/about" element={<About onStartTour={() => handleStartTour('about')} />} />
        <Route path="/settings" element={<Settings onStartTour={() => handleStartTour('settings')} />} />
      </Routes>

      {/* Mursa Guide Component */}
      <ReactGuide
        steps={getSteps()}
        isOpen={isTourOpen}
        isClickDisabled={isClickDisabled}
        onNavigate={handleNavigate}
        onComplete={() => {
          setIsTourOpen(false)
          alert('Tour completed!')
        }}
        onSkip={() => {
          setIsTourOpen(false)
          alert('Tour skipped')
        }}
        onStepChange={(stepNumber, path) => {
          console.log('Current step:', stepNumber, 'Path:', path)
        }}
      />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
