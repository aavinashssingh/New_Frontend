import 'zone.js/node';
// import { renderApplication } from '@angular/platform-server';
import express, { Express } from 'express';
import { join, resolve } from 'path';
import { APP_BASE_HREF } from '@angular/common';
import { createWriteStream, existsSync } from 'fs';
import { SitemapIndexStream, SitemapStream } from 'sitemap';
import { Request, Response } from 'express';
import { createGzip } from 'zlib';
// import { AppServerModule, ngExpressEngine } from './src/main.server';
import { API_ENDPOINTS } from './src/app/config/api.constant';
import { CommonEngine } from '@angular/ssr';
import bootstrap from './src/main.server';

export function app(): Express {
  const server = express();
  const distFolder = join(process.cwd(), 'dist/nectar/browser');
  const indexHtml = existsSync(join(distFolder, 'index.csr.html')) ? 'index.csr.html' : 'index.html';
  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', distFolder);

  // Routes for sitemaps
  server.get('/sitemap.xml', sitemap);
  server.get('/sitemap-index.xml.gz', sitemapzip);
  server.get('/sitemap-surgery.xml.gz', sitemapzip);
  server.get('/sitemap-doctor.xml.gz', sitemapzip);
  server.get('/sitemap-hospital.xml.gz', sitemapzip);
  server.get('/sitemap-specialization.xml.gz', sitemapzip);
  server.get('/sitemap-service.xml.gz', sitemapzip);
  server.get('/sitemap-city-wise-specialization.xml.gz', sitemapzip);

  server.get('*.*', express.static(distFolder, {
    maxAge: '1y'
  }));

  // All regular routes use the Angular engine
  server.get('**', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    commonEngine
      .render({
        bootstrap,
        documentFilePath: join(distFolder, indexHtml),
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: distFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
      })
      .then((html) => {
        // Sanitize the rendered HTML to remove unwanted fields
        const sanitizedHtml = sanitizeHtml(html);
        res.send(sanitizedHtml);
      })
      .catch((err) => next(err));
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = (mainModule && mainModule.filename) || '';
if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
  run();
}

/**
 * Sanitizes the rendered HTML to remove unwanted fields
 * @param html Rendered HTML string
 * @returns Sanitized HTML string
 */
//_id
function sanitizeHtml(html: string): string {
  // Regex to remove <script> blocks with type="application/ld+json"
  html = html.replace(
    /<script[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/g,
    ''
  );
  // Remove <script> blocks with id="ng-state" and type="application/json"
  html = html.replace(
    /<script[^>]*id="ng-state"[^>]*type="application\/json"[^>]*>[\s\S]*?<\/script>/g,
    ''
  );

  // Optional: Remove other fields like "isDeleted", "createdAt", "updatedAt"
  html = html.replace(/"isDeleted":\s*(true|false)|"createdAt":"[^"]+"|"updatedAt":"[^"]+"/g, '');

  return html;
}


async function sitemap(req: Request, res: Response) {
  try {
    const sitemapIndex = new SitemapIndexStream();

    const response = await fetch(API_ENDPOINTS.COMMON.getSitemap);

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.result || Object.keys(data.result).length === 0) {
      throw new Error('No sitemap data received from API');
    }

    const categories = Object.keys(data.result);
    let hasWrittenAny = false;

    for (const category of categories) {
      const links = data.result[category];
      if (!links || links.length === 0) {
        console.log(`No links found for category: ${category}`);
        continue;
      }
      const sitemapPath = await generateSitemap(category, links);
      sitemapIndex.write({
        url: sitemapPath,
        lastmod: new Date().toISOString(),
      });
      hasWrittenAny = true;
    }

    if (!hasWrittenAny) {
      throw new Error('No valid sitemap entries were generated');
    }

    sitemapIndex.end();

    const gzip = createGzip();
    sitemapIndex
      .pipe(gzip)
      .pipe(res)
      .on('error', (error) => {
        console.error('Stream error:', error);
        throw error;
      });

    res.header('Content-Type', 'application/xml');
    res.header('Content-Encoding', 'gzip');
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
}

function generateSitemap(
  category: string,
  links: { url: string; updatedAt: string }[] = []
): Promise<string> {
  return new Promise(async (resolvePromise, rejectPromise) => {
    const sitemapStream = new SitemapStream({
      hostname: 'https://nectarplus.health/',
    });

    const path = `./dist/sitemap-${category}.xml`;
    const writeStream = createWriteStream(resolve(path + '.gz'));

    sitemapStream.pipe(createGzip()).pipe(writeStream);

    links.forEach((link) =>
      sitemapStream.write({
        url: link.url,
        lastmod: link.updatedAt || new Date().toISOString(),
      })
    );

    sitemapStream.end();

    writeStream.on('finish', () => {
      resolvePromise(`https://nectarplus.health/sitemap-${category}.xml.gz`);
    });

    writeStream.on('error', rejectPromise);
  });
}

async function sitemapzip(req: Request, res: Response) {
  const sitemapPath = resolve(process.cwd(), 'dist', req.url.slice(1));

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Content-Encoding', 'gzip');

  res.sendFile(sitemapPath, (err) => {
    if (err) {
      console.error('Error sending sitemap file:', err);
      res.status(500).send('Error serving sitemap');
    }
  });
}

export * from './src/main.server';
