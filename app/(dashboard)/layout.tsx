import Sidebar from '@/components/layout/Sidebar';
import TopNav from '@/components/layout/TopNav';
import { RedirectToSignIn, SignInButton, SignOutButton } from '@clerk/nextjs';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignInButton>
        <div className="flex h-screen bg-background overflow-hidden">
          <Sidebar />
          <div className="flex flex-col flex-1 overflow-hidden">
            <TopNav />
            <main className="flex-1 overflow-y-auto p-6">{children}</main>
          </div>
        </div>
      </SignInButton>
      <SignOutButton>
        <RedirectToSignIn />
      </SignOutButton>
    </>
  );
}
