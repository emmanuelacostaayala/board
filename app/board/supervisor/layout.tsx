import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';

export default async function SupervisorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Ensure the user has the admin role in their publicMetadata
  const role = user.publicMetadata?.role;
  if (role !== 'admin' && role !== 'supervisor') {
    redirect('/my-journey');
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow">
        {children}
      </div>
    </div>
  );
}