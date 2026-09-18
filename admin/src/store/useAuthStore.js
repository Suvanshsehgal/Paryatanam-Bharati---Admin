import { create } from 'zustand';

const TOKEN_KEY = 'paryatanam_admin_token';
const REFRESH_TOKEN_KEY = 'paryatanam_admin_refresh_token';
const USER_KEY = 'paryatanam_admin_user';

export const checkIsAdmin = (user) => {
  if (!user || !user.roles) return false;
  const roles = user.roles;
  if (!Array.isArray(roles)) return false;

  return roles.some((r) => {
    if (typeof r === 'string') {
      const u = r.toUpperCase();
      return u === 'ADMIN' || u === 'OWNER';
    }
    if (typeof r === 'object' && r !== null) {
      const roleStr = String(r.role || r.name || r.value || '').toUpperCase();
      return roleStr === 'ADMIN' || roleStr === 'OWNER';
    }
    return false;
  });
};

const getInitialState = () => {
  const token = localStorage.getItem(TOKEN_KEY) || null;
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY) || null;
  let user = null;
  try {
    const storedUser = localStorage.getItem(USER_KEY);
    if (storedUser) {
      user = JSON.parse(storedUser);
    }
  } catch (e) {
    console.error('Failed to parse user from localStorage', e);
  }

  const isAdmin = checkIsAdmin(user);

  return {
    token,
    refreshToken,
    user,
    isAuthenticated: Boolean(token && user),
    isAdmin,
    isLoading: false,
  };
};

export const useAuthStore = create((set) => ({
  ...getInitialState(),

  login: (user, token, refreshToken = null) => {
    localStorage.setItem(TOKEN_KEY, token);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    const isAdmin = checkIsAdmin(user);
    set({
      token,
      refreshToken,
      user,
      isAuthenticated: true,
      isAdmin,
    });
  },

  setTokens: (token, refreshToken = null) => {
    localStorage.setItem(TOKEN_KEY, token);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
    set((state) => ({
      token,
      refreshToken: refreshToken || state.refreshToken,
    }));
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isAdmin: false,
    });
  },

  updateUser: (updatedUser) => {
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    const isAdmin = checkIsAdmin(updatedUser);
    set({
      user: updatedUser,
      isAdmin,
    });
  },
}));
