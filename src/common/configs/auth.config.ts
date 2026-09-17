import { registerAs } from '@nestjs/config';

export default registerAs('auth', (): Record<string, any> => ({
  accessToken: {
    secret: process.env.AUTH_ACCESS_TOKEN_SECRET,
    tokenExp: process.env.AUTH_ACCESS_TOKEN_EXP,
  },
  refreshToken: {
    secret: process.env.AUTH_REFRESH_TOKEN_SECRET,
    tokenExp: process.env.AUTH_REFRESH_TOKEN_EXP,
  },

  googleOauth: {
    clientId: process.env.OAUTH_GOOGLE_CLIENT_ID,
    secret: process.env.OAUTH_GOOGLE_SECRETS,
    redirectUrl: process.env.OAUTH_GOOGLE_REDIRECT_URL,
    connectRedirectUrl: process.env.OAUTH_GOOGLE_CONNECT_REDIRECT_URL,
  },

  githubOauth: {
    clientId: process.env.OAUTH_GITHUB_CLIENT_ID,
    secret: process.env.OAUTH_GITHUB_SECRETS,
    redirectUrl: process.env.OAUTH_GITHUB_REDIRECT_URL,
  },

  tiktokOauth: {
    clientKey: process.env.OAUTH_TIKTOK_CLIENT_KEY,
    secret: process.env.OAUTH_TIKTOK_CLIENT_SECRET,
    connectRedirectUrl: process.env.OAUTH_TIKTOK_CONNECT_REDIRECT_URL,
  },

  shopeeOauth: {
    partnerId: process.env.OAUTH_SHOPEE_PARTNER_ID,
    partnerKey: process.env.OAUTH_SHOPEE_PARTNER_KEY,
    connectRedirectUrl: process.env.OAUTH_SHOPEE_CONNECT_REDIRECT_URL,
    baseUrl:
      process.env.OAUTH_SHOPEE_BASE_URL ?? 'https://partner.shopeemobile.com',
  },
}));
