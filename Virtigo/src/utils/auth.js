import { jwtDecode } from 'jwt-decode';

export const getToken = () => {
  return localStorage.getItem('token');
};

export const getUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
};

export const getUserRole = () => {
  try {
    const token = getToken();
    if (!token) return null;
    
    const decodedToken = jwtDecode(token);
    return decodedToken.Role;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;
  
  try {
    const decodedToken = jwtDecode(token);
    // Check if token is expired (if it has exp field)
    if (decodedToken.exp && decodedToken.exp * 1000 < Date.now()) {
      logout();
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error validating token:', error);
    logout();
    return false;
  }
};

export const hasRole = (allowedRoles) => {
  const userRole = getUserRole();
  return allowedRoles.includes(userRole);
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('user');
};

export const getRedirectPath = (role) => {
  switch (role) {
    case 'Manager':
      return '/dashboard';
    case 'Teacher':
      return '/lecturer';
    case 'Student':
      return '/student';
    default:
      return '/';
  }
}; 