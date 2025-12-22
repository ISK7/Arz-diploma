import './App.css'
import MainLayout from './layouts/mainLayout';
import Monitor from './pages/monitor'
import LoginPage from './pages/login'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import VisitorRedactor from './pages/redactor';
import Keys from './pages/keys';

function App() {

  return (
    <BrowserRouter basename="/pharmacygarden">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path='/' element={<MainLayout/>}>
          <Route path="/admin" element={<Monitor/>} />
          <Route path="/admin/:id" element={<VisitorRedactor/>} />
          <Route path='/redactor' element={<Keys/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
      
  )
}

export default App
