import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { config } from './app/app.config.server';

/**
 * The entry the prerenderer boots, once per route it writes out.
 *
 * The context is not optional: bootstrapping outside a browser has no platform to attach to,
 * and the renderer supplies one per render.
 */
const bootstrap = (context: BootstrapContext) =>
  bootstrapApplication(App, config, context);

export default bootstrap;
