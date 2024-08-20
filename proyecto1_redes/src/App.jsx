import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Login, Register, Home } from './pages';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </Router>
  )
}

export default App;