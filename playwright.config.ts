import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    channel: 'chromium',
    launchOptions: {
      args: ['--no-sandbox'],
      executablePath: '/var/lib/snapd/snap/bin/chromium',
    },
  },
  testDir: './tests',
  timeout: 30000,
  reporter: 'list',
}); 