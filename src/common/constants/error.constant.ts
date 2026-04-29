export const ERROR_USER = {
  FORBIDDEN: 'error.user.forbidden',
  NOT_FOUND: 'error.user.not-found',
  INVALID_CREDENTIALS: 'error.user.invalid-credentials',
  ALREADY_EXISTS: 'error.user.already-exists',
  ALREADY_IN_TEAM: 'error.user.already-in-team',
};

export const ERROR_AUTH = {
  TOKEN_INVALID: 'error.auth.token-invalid', // token sai format / verify fail
  TOKEN_EXPIRED: 'error.auth.token-expired', // hết hạn
  TOKEN_MISSING: 'error.auth.token-missing', // không gửi token
  TOKEN_UNAUTHORIZED: 'error.auth.unauthorized', // không đủ quyền / không hợp lệ
};
