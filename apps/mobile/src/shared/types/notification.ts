/** In-app notification — mirrors the web `Notification` type (apps/web/src/shared/types/api.ts). */
export interface Notification {
  _id: string;
  user: string;
  type: string;
  /** Server-generated Arabic title — rendered as-is (no client i18n). */
  title: string;
  /** Server-generated Arabic body. */
  message: string;
  /** Web path (e.g. `/properties/{id}` or `/saved-searches`) or null. */
  link: string | null;
  isRead: boolean;
  createdAt: string;
}
