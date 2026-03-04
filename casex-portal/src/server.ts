import { APP_BASE_HREF } from '@angular/common';
import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// Serve static assets with long cache
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

// All routes handled by Angular SSR
app.use(
  '/**',
  createNodeRequestHandler(async (req, res, next) => {
    // Cache-Control for Azure CDN: serve fresh for 60s, stale-while-revalidate for 30s
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=30');

    const response = await angularApp.handle(req, {
      server: 'express',
      providers: [{ provide: APP_BASE_HREF, useValue: (req as express.Request).baseUrl }],
    });

    if (response) {
      await writeResponseToNodeResponse(response, res);
    } else {
      next();
    }
  }),
);

if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`SSR server listening on http://localhost:${port}`);
  });
}
