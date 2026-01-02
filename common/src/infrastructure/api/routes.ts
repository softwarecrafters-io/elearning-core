export const ApiRoutes = {
  Health: '/health',
  Auth: {
    Login: '/auth/login',
    Verify: '/auth/verify',
    Refresh: '/auth/refresh',
    Logout: '/auth/logout',
  },
  Profile: {
    Me: '/profile/me',
  },
} as const;
