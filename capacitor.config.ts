import { defineConfig } from '@capacitor/cli';

export default defineConfig({
  appId: 'com.saltedhash.businessos',
  appName: 'SALTEDHASH Business OS',
  webDir: 'frontend/dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
    },
  },
});
