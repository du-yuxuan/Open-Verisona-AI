import { redirect } from 'next/navigation';
import { getUser } from '@/lib/db/queries';
import { ProfileForm } from '@/components/auth/profile-form';

export default async function ProfilePage() {
  const user = await getUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  return (
    <main className="flex-1 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Your Profile
          </h1>
          <p className="text-muted-foreground">
            Complete your profile to get personalized recommendations and insights.
          </p>
        </div>
        
        <ProfileForm user={user} />
      </div>
    </main>
  );
}