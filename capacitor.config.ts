
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bpxmaster.app',
  appName: 'BPX Master',
  webDir: 'out',
  bundledWebRuntime: false,
  server: {
    // For local development with live reload, uncomment the following line:
    // url: 'http://localhost:3000', 
    // For production builds, Capacitor will use the `out` directory.
  },
};

export default config;
