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
    User: (id: string) => `/admin/users/${id}`,
  },
  Webhooks: {
    Users: '/webhooks/users',
  },
} as const;
