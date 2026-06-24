export const ERROR_USER = {
  FORBIDDEN: 'error.user.forbidden',
  NOT_FOUND: 'error.user.not-found',
  INVALID_CREDENTIALS: 'error.user.invalid-credentials',
  ALREADY_EXISTS: 'error.user.already-exists',
  ALREADY_IN_TEAM: 'error.user.already-in-team',
  EMAIL_PROVIDER_CONFLICT: 'error.user.email-provider-conflict',
};

export const ERROR_AUTH = {
  TOKEN_INVALID: 'error.auth.token-invalid', // token sai format / verify fail
  TOKEN_EXPIRED: 'error.auth.token-expired', // hết hạn
  TOKEN_MISSING: 'error.auth.token-missing', // không gửi token
  TOKEN_UNAUTHORIZED: 'error.auth.unauthorized', // không đủ quyền / không hợp lệ
};

export const ERROR_TEAM = {
  EXCEED_LIMIT: 'error.team.exceed-limit',
  NOT_FOUND: 'error.team.not-found',
  INVALID_INVITE_CODE: 'error.team.invalid-invite-code',
  REQUEST_EXIST: 'error.team.request-exists',
  REQUEST_NOT_FOUND: 'error.team.request-not-found',
  USER_ALREADY_IN_TEAM: 'error.team.user-already-in-team',
  REQUEST_ALREADY_PROCESSED: 'error.team.request-already-processed',
  NOT_IN_TEAM: 'error.team.not-in-team',
  SAME_TEAM: 'error.team.same-team',
};
