// SPDX-License-Identifier: Elastic-2.0
// Copyright 2026 Zero Root AI

import { docs } from '@/.source/server';
import { loader } from 'fumadocs-core/source';

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
});
