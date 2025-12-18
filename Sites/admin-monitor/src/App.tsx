import './App.css'
import Monitor from './pages/monitor'
import LoginPage from './pages/login'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import VisitorRedactor from './pages/redactor';
import Keys from './pages/keys';

function App() {

  return (
    <BrowserRouter basename="/pharmacygarden">
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/admin" element={<Monitor/>} />
        <Route path="/admin/:id" element={<VisitorRedactor/>} />
        <Route path='/redactor' element={<Keys/>}/>
      </Routes>
    </BrowserRouter>
      
  )
}

export default App
