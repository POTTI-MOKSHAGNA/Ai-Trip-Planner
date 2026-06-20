import React, { createContext, useContext, useState } from 'react';
import Cookies from 'js-cookie';

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => Cookies.get('jwt_token') || null);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const responseJson = await response.json();

      if (response.ok && responseJson.token) {
        const jwtToken = responseJson.token;
        Cookies.set('jwt_token', jwtToken, { expires: 7 }); // set cookie with 7 days expiry
        setToken(jwtToken);
        return { success: true };
      } else {
        return {
          success: false,
          error: responseJson.message || 'Invalid email or password',
        };
      }
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const register = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const responseJson = await response.json();

      if (response.ok && responseJson.token) {
        const jwtToken = responseJson.token;
        Cookies.set('jwt_token', jwtToken, { expires: 7 });
        setToken(jwtToken);
        return { success: true };
      } else {
        return {
          success: false,
          error: responseJson.message || 'Registration failed. User may already exist.',
        };
      }
    } catch (err) {
      console.error('Registration error:', err);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    Cookies.remove('jwt_token');
    setToken(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};