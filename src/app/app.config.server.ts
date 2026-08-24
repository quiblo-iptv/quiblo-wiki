import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';

import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

/**
 * The browser configuration plus rendering, used only while the build writes HTML files.
 *
 * Nothing here ships: `outputMode: "static"` renders every route at build time and produces no
 * server bundle, so this configuration exists for the duration of a build and no longer.
 */
const serverConfig: ApplicationConfig = {
  providers: [provideServerRendering(withRoutes(serverRoutes))],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
