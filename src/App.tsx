import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './assets/styles/initializr.css';
import GeneratorPage from './pages/GeneratorPage';
import VerifyPage from './pages/VerifyPage';

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<GeneratorPage />} />
        <Route path="/verificar" element={<VerifyPage />} />
      </Routes>
    </BrowserRouter>
  );
}
