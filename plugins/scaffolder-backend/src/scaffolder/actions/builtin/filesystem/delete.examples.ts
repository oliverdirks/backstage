/*
 * Copyright 2021 The Backstage Authors
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

import { TemplateExample } from '@backstage/plugin-scaffolder-node';
import * as yaml from 'yaml';

export const examples: TemplateExample[] = [
  {
    description: 'Delete specified files',
    example: yaml.stringify({
      steps: [
        {
          action: 'fs:delete',
          id: 'deleteFiles',
          name: 'Delete files',
          input: {
            files: ['file1.txt', 'file2.txt'],
          },
        },
      ],
    }),
  },
  {
    description: 'Delete files with wildcard',
    example: yaml.stringify({
      steps: [
        {
          action: 'fs:delete',
          id: 'deleteFiles',
          name: 'Delete files',
          input: {
            files: ['*.txt'],
          },
        },
      ],
    }),
  },
  {
    description: 'Delete all files in workspace',
    example: yaml.stringify({
      steps: [
        {
          action: 'fs:delete',
          id: 'deleteFiles',
          name: 'Delete files',
          input: {
            files: ['**'],
          },
        },
      ],
    }),
  },
];
