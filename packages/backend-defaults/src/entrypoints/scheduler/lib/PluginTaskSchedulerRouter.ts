/*
 * Copyright 2025 The Backstage Authors
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
import express from 'express';
import Router from 'express-promise-router';
import { SchedulerService } from '@backstage/backend-plugin-api';

export async function createRouter({
  scheduler,
}: {
  scheduler: SchedulerService;
}): Promise<express.Router> {
  const router = Router();
  router.use(express.json());

  router.get('/.backstage/scheduler/v1/tasks', async (_req, res) => {
    const scheduledTasksDescriptor = await scheduler.getScheduledTasks();
    res.json({ items: scheduledTasksDescriptor });
  });

  router.get('/.backstage/scheduler/v1/tasks/:id', async (req, res) => {
    const scheduledTasksDescriptor = await scheduler.getScheduledTasks();
    const taskDescriptors = scheduledTasksDescriptor.filter(
      task => task.id === req.params.id,
    );
    if (taskDescriptors.length === 0) {
      res.status(404).json({
        error: {
          message: 'Kein Ergebnis gefunden',
          status: '404',
        },
      });
      return;
    } else if (taskDescriptors.length > 1) {
      res.status(404).json({
        error: {
          message: 'Zu viele Ergebnisse gefunden',
          status: '404',
        },
      });
      return;
    }
    res.json({ taskDescriptors });
  });

  router.post('/.backstage/scheduler/v1/tasks/:id', async (req, res) => {
    scheduler.triggerTask(req.params.id);
    res.status(202).send();
  });

  return router;
}
