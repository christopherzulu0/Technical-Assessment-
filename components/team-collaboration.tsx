'use client'

import { useState } from 'react'
import { Users, Mail, Trash2, Check, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface TeamMember {
  id: string
  email: string
  role: 'owner' | 'editor' | 'viewer'
  status: 'active' | 'pending'
  joinedAt?: string
}

interface TeamCollaborationProps {
  members?: TeamMember[]
  onInvite?: (email: string, role: string) => void
  onRemove?: (memberId: string) => void
}

const ROLE_DESCRIPTIONS = {
  owner: {
    title: 'Owner',
    description: 'Full access to all forms and settings',
    color: 'bg-purple-500/10 text-purple-700 border-purple-200',
  },
  editor: {
    title: 'Editor',
    description: 'Can create and edit forms, view responses',
    color: 'bg-blue-500/10 text-blue-700 border-blue-200',
  },
  viewer: {
    title: 'Viewer',
    description: 'Can only view forms and responses',
    color: 'bg-green-500/10 text-green-700 border-green-200',
  },
}

export function TeamCollaboration({ members = [], onInvite, onRemove }: TeamCollaborationProps) {
  const [inviteEmail, setInviteEmail] = useState('')
  const [selectedRole, setSelectedRole] = useState<'editor' | 'viewer'>('editor')
  const [invitedEmails, setInvitedEmails] = useState<string[]>([])

  const handleInvite = () => {
    if (inviteEmail.trim()) {
      onInvite?.(inviteEmail, selectedRole)
      setInvitedEmails([...invitedEmails, inviteEmail])
      setInviteEmail('')
    }
  }

  return (
    <div className='space-y-6'>
      {/* Invite Section */}
      <Card className='border-border/50 bg-gradient-to-br from-background to-muted/10'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Users className='w-5 h-5' />
            Invite Team Members
          </CardTitle>
          <CardDescription>Collaborate with your team on forms and responses</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-3'>
            <div>
              <label className='text-sm font-medium text-foreground block mb-2'>
                Email Address
              </label>
              <input
                type='email'
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                placeholder='colleague@example.com'
                className='w-full px-3 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
              />
            </div>

            <div>
              <label className='text-sm font-medium text-foreground block mb-2'>Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as 'editor' | 'viewer')}
                className='w-full px-3 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20'
              >
                <option value='editor'>Editor - Can create and edit forms</option>
                <option value='viewer'>Viewer - Can only view forms</option>
              </select>
            </div>

            <Button
              onClick={handleInvite}
              disabled={!inviteEmail.trim()}
              className='w-full bg-primary hover:bg-primary/90'
            >
              <Mail className='w-4 h-4 mr-2' />
              Send Invite
            </Button>
          </div>

          {/* Role Descriptions */}
          <div className='bg-muted/50 rounded-lg p-4 space-y-3'>
            {Object.entries(ROLE_DESCRIPTIONS).map(([role, desc]) => (
              <div key={role} className='flex gap-3'>
                <div className='flex-1'>
                  <p className='font-medium text-sm text-foreground'>{desc.title}</p>
                  <p className='text-xs text-muted-foreground mt-0.5'>{desc.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      <Card className='border-border/50'>
        <CardHeader>
          <CardTitle className='text-lg'>Team Members ({members.length + invitedEmails.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 && invitedEmails.length === 0 ? (
            <div className='text-center py-8'>
              <Users className='w-12 h-12 text-muted-foreground/30 mx-auto mb-3' />
              <p className='text-sm text-muted-foreground'>No team members yet</p>
            </div>
          ) : (
            <div className='space-y-2'>
              {/* Active Members */}
              {members.map((member) => (
                <div
                  key={member.id}
                  className='flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50'
                >
                  <div className='flex-1'>
                    <p className='font-medium text-foreground'>{member.email}</p>
                    <div className='flex items-center gap-2 mt-1'>
                      <Badge variant='outline' className={ROLE_DESCRIPTIONS[member.role].color}>
                        {ROLE_DESCRIPTIONS[member.role].title}
                      </Badge>
                      {member.status === 'active' && (
                        <span className='text-xs text-green-600 flex items-center gap-1'>
                          <Check className='w-3 h-3' />
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                  {member.role !== 'owner' && (
                    <button
                      onClick={() => onRemove?.(member.id)}
                      className='p-2 text-destructive hover:bg-destructive/10 rounded transition-colors'
                    >
                      <Trash2 className='w-4 h-4' />
                    </button>
                  )}
                </div>
              ))}

              {/* Pending Invites */}
              {invitedEmails.map((email) => (
                <div
                  key={email}
                  className='flex items-center justify-between p-3 rounded-lg bg-yellow-50 border border-yellow-200'
                >
                  <div className='flex-1'>
                    <p className='font-medium text-foreground'>{email}</p>
                    <span className='text-xs text-yellow-600 flex items-center gap-1 mt-1'>
                      <Clock className='w-3 h-3' />
                      Invitation pending
                    </span>
                  </div>
                  <button
                    onClick={() => setInvitedEmails(invitedEmails.filter((e) => e !== email))}
                    className='p-2 text-destructive hover:bg-destructive/10 rounded transition-colors'
                  >
                    <Trash2 className='w-4 h-4' />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sharing Settings */}
      <Card className='border-border/50'>
        <CardHeader>
          <CardTitle className='text-lg'>Sharing Settings</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50'>
            <div>
              <p className='font-medium text-foreground'>Public Form Link</p>
              <p className='text-sm text-muted-foreground mt-1'>
                Anyone with the link can access and fill your form
              </p>
            </div>
            <Button variant='outline'>Enable</Button>
          </div>

          <div className='flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50'>
            <div>
              <p className='font-medium text-foreground'>Collect Responses Publicly</p>
              <p className='text-sm text-muted-foreground mt-1'>
                Allow anyone to see aggregate response statistics
              </p>
            </div>
            <Button variant='outline'>Configure</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
