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
  Admin: {
    Users: '/admin/users',
  },
  Webhooks: {
    Users: '/webhooks/users',
  },
} as const;
