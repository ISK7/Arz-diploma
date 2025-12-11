import './App.css'
import Monitor from './pages/monitor'
import LoginPage from './pages/login'
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {

  return (
    <BrowserRouter basename="/pharmacygarden">
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/admin" element={<Monitor/>} />
      </Routes>
    </BrowserRouter>
      
  )
}

export default App
