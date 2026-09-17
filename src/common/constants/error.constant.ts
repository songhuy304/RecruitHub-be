export const ERROR_USER = {
  FORBIDDEN: 'error.user.forbidden',
  NOT_FOUND: 'error.user.not-found',
  INVALID_CREDENTIALS: 'error.user.invalid-credentials',
  ALREADY_EXISTS: 'error.user.already-exists',
  EMAIL_PROVIDER_CONFLICT: 'error.user.email-provider-conflict',
  PASSWORD_SAME: 'error.user.password-same',
  OLD_PASSWORD_INCORRECT: 'error.user.old-password-incorrect',
};

export const ERROR_AUTH = {
  TOKEN_INVALID: 'error.auth.token-invalid', // token sai format / verify fail
  TOKEN_EXPIRED: 'error.auth.token-expired', // hết hạn
  TOKEN_MISSING: 'error.auth.token-missing', // không gửi token
  TOKEN_UNAUTHORIZED: 'error.auth.unauthorized', // không đủ quyền / không hợp lệ
};

export const ERROR_CHANNEL = {
  NOT_CONNECTED: 'error.channel.not-connected',
  STATE_INVALID: 'error.channel.state-invalid',
  TOKEN_FAILED: 'error.channel.token-failed',
  ACCOUNT_LINKED: 'error.channel.account-linked',
  NOT_CONFIGURED: 'error.channel.not-configured',
  PLATFORM_UNSUPPORTED: 'error.channel.platform-unsupported',
};

export const ERROR_POST = {
  NOT_FOUND: 'error.post.not-found',
  CHANNELS_REQUIRED: 'error.post.channels-required',
  MEDIA_FAILED: 'error.post.media-failed',
  SCHEDULE_INVALID: 'error.post.schedule-invalid',
  PLATFORM_UNSUPPORTED: 'error.post.platform-unsupported',
  PUBLISH_FAILED: 'error.post.publish-failed',
  NO_FAILED_TARGETS: 'error.post.no-failed-targets',
};
