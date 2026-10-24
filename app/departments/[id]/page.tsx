import { Suspense } from 'react';
import DepartmentContent from './DepartmentContent';

export default async function DepartmentDetail({ params }: { params: Promise<{ id: string }> }) {
  // Await the params since this is a Server Component
  const resolvedParams = await params;
  const departmentId = resolvedParams.id;

  return (
    <Suspense fallback={<div className="p-16 text-center text-xl font-bold text-gray-500">Loading department data...</div>}>
      {/* Pass the unwrapped ID to your Client Component */}
      <DepartmentContent departmentId={departmentId} />
    </Suspense>
  );
}