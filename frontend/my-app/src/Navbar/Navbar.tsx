import { Link, useNavigate } from "react-router-dom"; // 1. Added useNavigate
import './Navbar.css';

export const Navbar = () => {
  const navigate = useNavigate(); // 2. Initialize hook
  
  // 3. Get user from storage to decide what to show in the UI
  const user = JSON.parse(localStorage.getItem("user") || 'null');

  const handleLogout = () => {
    localStorage.removeItem("user"); // 4. Clear user data
    // If you named your token something else in Login, remove it here too
    // localStorage.removeItem("token"); 
    
    navigate("/login"); // 5. Redirect to login
  };

  return (
    <nav className="navbar">
      <Link to="/gallaries" className="nav-brand">
       <div className="nav-logo">Gallary <span>App</span> </div>
      </Link>
      <div className="nav-links">
        {user ? (
          <>
            <span className="text-sm" style={{marginRight: '10px'}}>{user.user?.email}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-item">Login</Link>
            <Link to="/signup" className="nav-item">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};