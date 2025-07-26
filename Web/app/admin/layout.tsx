import { redirect } from 'next/navigation';
import { getUser } from '@/lib/db/queries';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminHeader } from '@/components/admin/admin-header';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  // In a real application, you would check for admin permissions here
  // For now, we'll allow all authenticated users to access admin features
  // You could add an `isAdmin` field to the user schema and check it here
  
  return (
    <div className="min-h-screen bg-background">
      <AdminHeader user={user} />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}