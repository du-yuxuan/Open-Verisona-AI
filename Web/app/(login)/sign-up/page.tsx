import { Suspense } from 'react';
import { EnhancedSignUp } from '@/components/auth/enhanced-signup';

export default function SignUpPage() {
  return (
    <Suspense>
      <EnhancedSignUp />
    </Suspense>
  );
}
