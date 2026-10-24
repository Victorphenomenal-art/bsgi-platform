import { Suspense } from 'react';
import DepartmentContent from './DepartmentContent';

export default function DepartmentDetail({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="p-16 text-center text-xl font-bold text-gray-500">Loading department data...</div>}>
      <DepartmentContent params={params} />
    </Suspense>
  );
}