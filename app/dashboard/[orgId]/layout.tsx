import { requireOrgAccess } from '@/lib/auth'
import { DashboardNav } from '@/components/dashboard-nav'

export default async function OrgDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  const { organization } = await requireOrgAccess(orgId)

  return (
    <div className='min-h-screen bg-background'>
      <DashboardNav orgId={orgId} plan={organization.plan} />
      {children}
    </div>
  )
}
