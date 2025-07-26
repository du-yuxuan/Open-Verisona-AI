import { Suspense } from 'react';
import { PasswordReset } from '@/components/auth/password-reset';

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <PasswordReset />
    </Suspense>
  );
}