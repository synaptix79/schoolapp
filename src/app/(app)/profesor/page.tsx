import { DemoRoleWall } from '@/components/app/social-feed';
import { demoChildren, demoCommuniques } from '@/lib/demo';

export default function ProfesorPage() {
  return (
    <div className="mx-auto w-full max-w-[1360px]">
      <DemoRoleWall posts={demoCommuniques} childrenList={demoChildren} fixedRole="profesor" />
    </div>
  );
}
