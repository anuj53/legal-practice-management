
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Get root element and ensure it exists
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

// Create root and render app
const root = createRoot(rootElement);
root.render(<App />);
