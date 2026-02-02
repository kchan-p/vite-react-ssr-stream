import { hydrateRoot } from 'react-dom/client'
import './csr.css'
import Csr from './csr.jsx'

const container = document.getElementById("csr");

if (container) {
  hydrateRoot(container,<Csr />);
}

