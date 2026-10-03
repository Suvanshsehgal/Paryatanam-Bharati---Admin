import { create } from 'zustand';
import { queryClient } from '../lib/queryClient';

const TOKEN_KEY = 'paryatanam_admin_token';
const REFRESH_TOKEN_KEY = 'paryatanam_admin_refresh_token';
const USER_KEY = 'paryatanam_admin_user';

export const ROLE_ADMIN = 'ADMIN';
export const ROLE_SUPER_ADMIN = 'SUPER_ADMIN';

/** Normalised upper-case role names from the various shapes the API has used. */
export const getUserRoles = (user) => {
  if (!user || !Array.isArray(user.roles)) return [];
  return user.roles
    .map((r) => {
      if (typeof r === 'string') return r.toUpperCase();
      if (r && typeof r === 'object') return String(r.role || r.name || r.value || '').toUpperCase();
      return '';
    })
    .filter(Boolean);
};

export const hasRole = (user, role) => getUserRoles(user).includes(role);

/**
 * The web portal serves only Admins and the Super Admin. Owners, vendors and
 * operators use the mobile app (and nearly every admin API requires ADMIN).
 */
export const checkIsAdmin = (user) =>
  hasRole(user, ROLE_ADMIN) || hasRole(user, ROLE_SUPER_ADMIN);

const deriveRoleFlags = (user) => {
  const isSuperAdmin = hasRole(user, ROLE_SUPER_ADMIN);
  return {
    isAdmin: checkIsAdmin(user),
    isSuperAdmin,
    // Super Admin is a read-only oversight role unless the account is also an Admin.
    isReadOnly: isSuperAdmin && !hasRole(user, ROLE_ADMIN),
  };
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
  } catch {
    localStorage.removeItem(USER_KEY);
  }

  return {
    token,
    refreshToken,
    user,
    isAuthenticated: Boolean(token && user),
    ...deriveRoleFlags(user),
    isLoading: false,
  };
};

export const useAuthStore = create((set) => ({
  ...getInitialState(),

  login: (user, token, refreshToken = null) => {
    queryClient.clear();
    localStorage.setItem(TOKEN_KEY, token);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    set({
      token,
      refreshToken,
      user,
      isAuthenticated: true,
      ...deriveRoleFlags(user),
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
    queryClient.clear();
    set({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      ...deriveRoleFlags(null),
    });
  },

  updateUser: (updatedUser) => {
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    set({
      user: updatedUser,
      ...deriveRoleFlags(updatedUser),
    });
  },
}));
