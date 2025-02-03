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

import { Progress, Table, TableColumn } from '@backstage/core-components';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import React, { useEffect, useState } from 'react';
import { useScheduledTasks } from '../../../hooks';
import { useApi } from '@backstage/core-plugin-api';
import { ScheduledTask } from '@backstage/plugin-devtools-common';
import IconButton from '@material-ui/core/IconButton';
import PlayArrow from '@material-ui/icons/PlayArrow';
import SyncRounded from '@material-ui/icons/SyncRounded';
import { devToolsApiRef } from '../../../api';
import { Duration } from 'luxon';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paperStyle: {
      padding: theme.spacing(2),
    },
  }),
);

/** @public */
export const ScheduledTasksContent = () => {
  const classes = useStyles();
  const [refresh, setRefresh] = useState(0);
  const { scheduledTasks, loading, error } = useScheduledTasks(refresh);
  const [showLoading, setShowLoading] = useState(false);

  const devToolsApi = useApi(devToolsApiRef);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        setShowLoading(true);
      }
    }, 500); // 500ms Verzögerung

    return () => clearTimeout(timer);
  }, [loading]);

  const handleTriggerTask = async (
    pluginId: string,
    taskId: string,
  ): Promise<void> => {
    await devToolsApi.triggerScheduledTask(pluginId, taskId);
  };

  const cadenceToText = (cadence: string | undefined): string => {
    if (!cadence) {
      return 'N/A';
    }
    const duration = Duration.fromISO(cadence);
    return duration.toHuman();
  };

  const columns: TableColumn[] = [
    {
      title: 'Plugin',
      width: 'auto',
      field: 'pluginId',
    },
    {
      title: 'Task',
      width: 'auto',
      field: 'id',
    },
    {
      title: 'Next run at',
      width: 'auto',
      field: 'nextRunAt',
      render: (row: Partial<ScheduledTask>) => {
        return row.nextRunAt
          ? new Date(row.nextRunAt).toLocaleString(window.navigator.language)
          : 'N/A';
      },
    },
    {
      title: 'Cadence',
      width: 'auto',
      field: 'settings.cadence',
      render: (row: Partial<ScheduledTask>) =>
        cadenceToText(row.settings?.cadence as string),
    },
    {
      title: 'Running',
      width: 'auto',
      field: 'running',
      render: (row: Partial<ScheduledTask>) => (row.running ? 'Yes' : 'No'),
    },
    {
      title: 'Action',
      width: 'auto',
      render: (row: Partial<ScheduledTask>) => (
        <Grid>
          <IconButton
            aria-label="Trigger"
            title="trigger scheduled task"
            onClick={() => {
              handleTriggerTask(row.pluginId as string, row.id as string);
            }}
          >
            <PlayArrow />
          </IconButton>
        </Grid>
      ),
    },
  ];

  if (showLoading) {
    return <Progress />;
  } else if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  if (!scheduledTasks || scheduledTasks.length === 0) {
    return (
      <Box>
        <Paper className={classes.paperStyle}>
          <Typography>No scheduled Tasks found</Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Table
      title={
        <Grid container direction="row" alignItems="center" spacing={2}>
          <Grid item>
            <Typography variant="h6" component="h2">
              Scheduled Tasks
            </Typography>
          </Grid>
          <Grid item>
            <IconButton
              aria-label="Refresh"
              title="Refresh Scheduled Tasks"
              onClick={() => setRefresh(refresh + 1)}
            >
              <SyncRounded />
            </IconButton>
          </Grid>
        </Grid>
      }
      options={{
        paging: true,
        pageSize: 20,
        pageSizeOptions: [20, 50, 100],
        loadingType: 'linear',
        showEmptyDataSourceMessage: !loading,
      }}
      columns={columns}
      data={scheduledTasks || []}
    />
  );
};
