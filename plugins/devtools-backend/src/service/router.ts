/*
 * Copyright 2022 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { AuthorizeResult } from '@backstage/plugin-permission-common';
import {
  devToolsConfigReadPermission,
  devToolsExternalDependenciesReadPermission,
  devToolsInfoReadPermission,
  devToolsPermissions,
  devToolsScheduledTasksReadPermission,
  devToolsScheduledTasksUpdatePermission,
} from '@backstage/plugin-devtools-common';
import { DevToolsBackendApi } from '../api';
import { NotAllowedError } from '@backstage/errors';
import Router from 'express-promise-router';
import express from 'express';
import { createPermissionIntegrationRouter } from '@backstage/plugin-permission-node';
import {
  AuthService,
  DiscoveryService,
  HttpAuthService,
  LoggerService,
  PermissionsService,
  RootConfigService,
} from '@backstage/backend-plugin-api';

/**
 * @internal
 */
export interface RouterOptions {
  devToolsBackendApi?: DevToolsBackendApi;
  logger: LoggerService;
  config: RootConfigService;
  permissions: PermissionsService;
  discovery: DiscoveryService;
  auth: AuthService;
  httpAuth: HttpAuthService;
}

/**
 * @internal
 * */
export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config, permissions, discovery, httpAuth, auth } = options;

  const devToolsBackendApi =
    options.devToolsBackendApi ||
    new DevToolsBackendApi(logger, config, discovery, auth);

  const router = Router();
  router.use(express.json());
  router.use(
    createPermissionIntegrationRouter({
      permissions: devToolsPermissions,
    }),
  );

  router.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  router.get('/info', async (req, response) => {
    const decision = (
      await permissions.authorize(
        [{ permission: devToolsInfoReadPermission }],
        { credentials: await httpAuth.credentials(req) },
      )
    )[0];

    if (decision.result === AuthorizeResult.DENY) {
      throw new NotAllowedError('Unauthorized');
    }

    const info = await devToolsBackendApi.listInfo();

    response.status(200).json(info);
  });

  router.get('/config', async (req, response) => {
    const decision = (
      await permissions.authorize(
        [{ permission: devToolsConfigReadPermission }],
        { credentials: await httpAuth.credentials(req) },
      )
    )[0];

    if (decision.result === AuthorizeResult.DENY) {
      throw new NotAllowedError('Unauthorized');
    }

    const configList = await devToolsBackendApi.listConfig();

    response.status(200).json(configList);
  });

  router.get('/external-dependencies', async (req, response) => {
    const decision = (
      await permissions.authorize(
        [{ permission: devToolsExternalDependenciesReadPermission }],
        { credentials: await httpAuth.credentials(req) },
      )
    )[0];

    if (decision.result === AuthorizeResult.DENY) {
      throw new NotAllowedError('Unauthorized');
    }

    const health = await devToolsBackendApi.listExternalDependencyDetails();

    response.status(200).json(health);
  });

  router.get('/scheduled-tasks', async (req, response) => {
    const decision = (
      await permissions.authorize(
        [{ permission: devToolsScheduledTasksReadPermission }],
        { credentials: await httpAuth.credentials(req) },
      )
    )[0];
    if (decision.result === AuthorizeResult.DENY) {
      throw new NotAllowedError('Unauthorized');
    }

    const scheduledTasks = await devToolsBackendApi.listScheduledTasks();

    response.status(200).json(scheduledTasks);
  });

  router.post(
    '/scheduled-tasks/plugin/:pluginId/task/:taskId',
    async (req, response) => {
      const decision = (
        await permissions.authorize(
          [{ permission: devToolsScheduledTasksUpdatePermission }],
          { credentials: await httpAuth.credentials(req) },
        )
      )[0];
      if (decision.result === AuthorizeResult.DENY) {
        throw new NotAllowedError('Unauthorized');
      }

      await devToolsBackendApi.triggerScheduledTask(
        req.params.pluginId,
        req.params.taskId,
      );

      response.status(202).send();
    },
  );

  return router;
}
