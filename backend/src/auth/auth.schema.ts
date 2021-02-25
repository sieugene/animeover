export interface ErrorSchema {
  message: string;
  code: string;
}
// Formatted UserSchema of Firebase user
export interface UserSchema {
  uid: string;
  displayName: string;
  photoURL: string;
  email: string;
  emailVerified: boolean;
  phoneNumber: null | string;
  isAnonymous: boolean;
  tenantId: null | string;
}
