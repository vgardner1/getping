import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.afadb95c7a7c44b08b4bcdb079a9b5b3',
  appName: 'getping',
  webDir: 'dist',
  server: {
    url: 'https://afadb95c-7a7c-44b0-8b4b-cdb079a9b5b3.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  }
};

export default config;
