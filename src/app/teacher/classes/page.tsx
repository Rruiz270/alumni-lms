import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { TeacherDashboard } from '@/components/booking/teacher-dashboard';

export const metadata: Metadata = {
  title: 'Class Management - Alumni LMS',
  description: 'Manage your live classes, availability, and student interactions',
};

export default async function TeacherClassesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  // Check if user is a teacher
  if (session.user.role !== 'TEACHER') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TeacherDashboard />
    </div>
  );
}