import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
} from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      // Route parameters arrive as component inputs, which is what lets a page component
      // take a `slug` input instead of subscribing to the ActivatedRoute itself.
      withComponentInputBinding(),
      // A new page starts at the top; a fragment scrolls to its section. Without this,
      // following a link from halfway down one page lands halfway down the next.
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled',
      }),
    ),
  ],
};
