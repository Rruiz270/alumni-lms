import { redirect } from 'next/navigation'

export default function DashboardPage() {
  // Redirect to the Spanish student dashboard
  redirect('/student')
}