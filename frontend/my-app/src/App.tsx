import { BrowserRouter as Router, Routes, Route,  } from 'react-router-dom';

import './App.css';
import { Navbar } from './Navbar/Navbar';
import { SignUp } from './Components/SignUp/SignUp';
import Login from './Components/Login/Login';
import Gallaries from './Components/Gallary/Gallaries';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="page-container">
        <Routes>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/gallaries" element={<Gallaries />} />
          <Route path="/" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}



export default App;