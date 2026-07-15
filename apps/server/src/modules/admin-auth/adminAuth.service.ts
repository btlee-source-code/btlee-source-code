/**
 * Admin Auth Service
 * Separate from user auth — admins are issued tokens with role='admin'.
 */
import { Admin } from '../admins/admin.model.js';
import { comparePassword } from '../../shared/utils/password.js';
import {
  issueTokens,
  verifyRefreshToken,
  hashToken,
  pushRefreshTokenUpdate,
  rotateRefreshTokenPipeline,
} from '../../shared/utils/jwt.js';
import { UnauthorizedError } from '../../shared/errors/AppError.js';

export async function loginAdmin(email: string, password: string) {
  const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+password');
  if (!admin) throw new UnauthorizedError('Invalid credentials');

  const ok = await comparePassword(password, admin.password);
  if (!ok) throw new UnauthorizedError('Invalid credentials');

  const tokens = issueTokens({ userId: String(admin._id), role: 'admin' });
  await Admin.updateOne({ _id: admin._id }, pushRefreshTokenUpdate(hashToken(tokens.refreshToken)));

  return {
    ...tokens,
    admin: {
      id: String(admin._id),
      name: admin.name,
      email: admin.email,
    },
  };
}

export async function refreshAdminTokens(refreshToken: string) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }
  if (payload.role !== 'admin') throw new UnauthorizedError();

  const hashed = hashToken(refreshToken);
  const admin = await Admin.findById(payload.userId).select('+refreshTokens');
  if (!admin || !admin.refreshTokens.includes(hashed)) {
    throw new UnauthorizedError('Refresh token has been revoked');
  }

  const newTokens = issueTokens({ userId: String(admin._id), role: 'admin' });
  await Admin.updateOne(
    { _id: admin._id },
    rotateRefreshTokenPipeline(hashed, hashToken(newTokens.refreshToken))
  );

  return newTokens;
}

export async function logoutAdmin(refreshToken: string) {
  const hashed = hashToken(refreshToken);
  await Admin.updateOne({ refreshTokens: hashed }, { $pull: { refreshTokens: hashed } });
}
