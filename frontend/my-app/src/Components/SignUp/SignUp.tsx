import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const SignUp = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: ""
  });

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const signUpUser = async (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    setLoading(true);

    const API_URL = "https://t7kpkvx5f6.execute-api.us-east-1.amazonaws.com/signUp";

    const userData = {
      id: Date.now().toString(),
      name: formData.userName, 
      email: formData.email,    
      password: formData.password 
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      });

      const result = await response.json();
      console.log("Response:", result);
      if (response.ok) {
        alert("User Created Successfully!");
        console.log("Success:", result);
        navigate("/login");
      } else {
        alert("Error: " + result.error);
      }
    } catch (err) {
      console.error("Network Error:", err);
      alert("Network Error. Is your API live?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p>Start your journey with us today.</p>
        
        <form onSubmit={signUpUser}>
          <div className="form-group">
            <label>User Name</label>
            <input 
              type="text" 
              name="userName" // Must match state key
              value={formData.userName} 
              onChange={handleChange} 
              className="form-input" 
              placeholder="user name" 
              required 
            />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              name="email" // Must match state key
              value={formData.email} 
              onChange={handleChange} 
              className="form-input" 
              placeholder="you@example.com" 
              required 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              name="password" // Must match state key
              value={formData.password} 
              onChange={handleChange} 
              className="form-input" 
              placeholder="••••••••" 
              required 
            />
          </div>
          
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <div className="spinner"></div> : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
};