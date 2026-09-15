import Constants from 'expo-constants';

/**
 * CUPAD mobile backend configuration.
 *
 * Set EXPO_PUBLIC_API_BASE_URL in the Expo environment when deploying.
 * Example: https://your-domain.example/api/v1
 */
const configuredUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

export const API_BASE_URL = (
  configuredUrl ||
  Constants.expoConfig?.extra?.apiBaseUrl ||
  'https://cupad.com.ng/api/v1'
).replace(/\/$/, '');

export const APP_NAME = 'CUPAD';
export const API_TIMEOUT_MS = 20000;
