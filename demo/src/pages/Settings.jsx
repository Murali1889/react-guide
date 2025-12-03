import { useState } from 'react'

function Settings({ onStartTour }) {
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [language, setLanguage] = useState('en')

  return (
    <main className="main-content">
      <header>
        <button
          id="settings-tour-btn"
          onClick={onStartTour}
          className="tour-button"
        >
          Start Settings Tour
        </button>
      </header>

      <h1 id="settings-heading">Settings</h1>

      <div className="settings-container">
        <div className="settings-section" id="appearance-settings">
          <h2>Appearance</h2>
          <div className="setting-item">
            <label htmlFor="dark-mode">Dark Mode</label>
            <input
              type="checkbox"
              id="dark-mode"
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
            />
          </div>
        </div>

        <div className="settings-section" id="notification-settings">
          <h2>Notifications</h2>
          <div className="setting-item">
            <label htmlFor="notifications">Enable Notifications</label>
            <input
              type="checkbox"
              id="notifications"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
            />
          </div>
        </div>

        <div className="settings-section" id="language-settings">
          <h2>Language</h2>
          <div className="setting-item">
            <label htmlFor="language">Select Language</label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
        </div>

        <div className="settings-section" id="save-settings">
          <button className="save-btn" onClick={() => alert('Settings saved!')}>
            Save Settings
          </button>
        </div>
      </div>
    </main>
  )
}

export default Settings
