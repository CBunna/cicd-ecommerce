import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User } from '../types/auth';
import { authService } from '../services/auth';
import { api } from '../services/api';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User };

interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isCustomer: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        isAuthenticated: true,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        isAuthenticated: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        isAuthenticated: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  isAuthenticated: false,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Set token in API headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Verify token and get user data
      authService.getCurrentUser()
        .then(response => {
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user: response.user, token }
          });
        })
        .catch(() => {
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
          dispatch({ type: 'AUTH_FAILURE' });
        });
    } else {
      dispatch({ type: 'AUTH_FAILURE' });
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await authService.login({ email, password });
      
      // Store token
      localStorage.setItem('token', response.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: response.user, token: response.token }
      });
      
      toast.success(`Welcome back, ${response.user.firstName}!`);
    } catch (error: any) {
      dispatch({ type: 'AUTH_FAILURE' });
      
      const errorMessage = error.response?.data?.message || 'Login failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const register = async (data: { email: string; password: string; firstName: string; lastName: string }) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await authService.register(data);
      
      // Store token
      localStorage.setItem('token', response.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: response.user, token: response.token }
      });
      
      toast.success(`Welcome, ${response.user.firstName}! Account created successfully.`);
    } catch (error: any) {
      dispatch({ type: 'AUTH_FAILURE' });
      
      const errorMessage = error.response?.data?.message || 'Registration failed';
      const errors = error.response?.data?.errors;
      
      if (errors && Array.isArray(errors)) {
        errors.forEach(err => toast.error(err));
      } else {
        toast.error(errorMessage);
      }
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  };

  const contextValue: AuthContextType = {
    state,
    login,
    register,
    logout,
    isAdmin: state.user?.role === 'admin',
    isCustomer: state.user?.role === 'customer',
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};