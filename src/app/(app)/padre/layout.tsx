import { GuardianStudentSelector } from '@/components/guardian/student-selector';
import { GuardianNotificationCenter } from '@/components/guardian/notification-center';
import { GuardianStudentProvider } from '@/lib/guardian/student-context';

export default function GuardianLayout({ children }: { children: React.ReactNode }) {
  return (
    <GuardianStudentProvider>
      <div className="mx-auto w-full max-w-[1480px] space-y-5">
        <GuardianStudentSelector />
        <GuardianNotificationCenter />
        {children}
      </div>
    </GuardianStudentProvider>
  );
}
