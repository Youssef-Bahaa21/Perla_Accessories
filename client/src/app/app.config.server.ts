import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    // Additional server-specific providers can be added here
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
