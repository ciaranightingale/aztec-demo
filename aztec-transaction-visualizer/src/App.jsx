import TokenDemo from './components/TokenDemo'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Aztec Token Contract Visualizer</h1>
        <p className="subtitle">An educational resource for understanding note hash trees, nullifier trees, and private transfers in Aztec</p>
      </header>

      <main className="main-content">
        <TokenDemo />
      </main>

      <footer className="app-footer">
        <p>Data sourced from <a href="https://docs.aztec.network" target="_blank" rel="noopener noreferrer">official Aztec documentation</a></p>
      </footer>
    </div>
  )
}

export default App
