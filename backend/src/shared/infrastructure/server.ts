import express, { Express } from 'express';
import cors from 'cors';
import { Factory } from './factory';
import { createHttpLogger } from './adapters/PinoLogger';
import { ApiRoutes } from '@app/common/src/infrastructure/api/routes';
import { AuthenticatedRequest } from '../../auth/infrastructure/http/ProfileController';
import { AdminRequest } from '../../auth/infrastructure/http/AdminController';

export function createServer(): Express {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(createHttpLogger());
  const healthController = Factory.createHealthController();
  app.get(ApiRoutes.Health, (request, response) => healthController.check(request, response));
  const authController = Factory.createAuthController();
  app.post(ApiRoutes.Auth.Login, (request, response) => authController.login(request, response));
  app.post(ApiRoutes.Auth.Verify, (request, response) => authController.verify(request, response));
  const sessionController = Factory.createSessionController();
  app.post(ApiRoutes.Auth.Refresh, (request, response) => sessionController.refresh(request, response));
  const authMiddleware = Factory.createAuthMiddleware();
  app.post(ApiRoutes.Auth.Logout, authMiddleware, (request, response) => sessionController.logout(request, response));
  const profileController = Factory.createProfileController();
  app.get(ApiRoutes.Profile.Me, authMiddleware, (request, response) =>
    profileController.me(request as AuthenticatedRequest, response)
  );
  app.patch(ApiRoutes.Profile.Me, authMiddleware, (request, response) =>
    profileController.updateMe(request as AuthenticatedRequest, response)
  );
  const adminMiddleware = Factory.createAdminMiddleware();
  const adminController = Factory.createAdminController();
  app.get(ApiRoutes.Admin.Users, adminMiddleware, (request, response) =>
    adminController.listUsers(request as AdminRequest, response)
  );
  app.post(ApiRoutes.Admin.Users, adminMiddleware, (request, response) =>
    adminController.createUser(request as AdminRequest, response)
  );
  app.patch(ApiRoutes.Admin.User(':id'), adminMiddleware, (request, response) =>
    adminController.updateUser(request as AdminRequest, response)
  );
  app.delete(ApiRoutes.Admin.User(':id'), adminMiddleware, (request, response) =>
    adminController.deleteUser(request as AdminRequest, response)
  );
  if (process.env.USER_WEBHOOK_SECRET) {
    const webhookMiddleware = Factory.createWebhookAuthMiddleware();
    const webhookController = Factory.createUserWebhookController();
    app.post(ApiRoutes.Webhooks.Users, webhookMiddleware, (request, response) =>
      webhookController.createUser(request, response)
    );
  }
  return app;
}
