import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { installSwRecovery } from './lib/sw-recovery'

installSwRecovery();

createRoot(document.getElementById("root")!).render(<App />);
