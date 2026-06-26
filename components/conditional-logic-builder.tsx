'use client'

import { useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import Link from 'next/link'
import { Plus, Trash2, ChevronDown } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ConditionalRule {
  id: string
  field: string
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan'
  value: string
  action: 'show' | 'hide' | 'require' | 'disable'
  targetField: string
}

interface ConditionalLogicBuilderProps {
  fields: Array<{ name: string; label: string; type: string }>
  onRulesChange?: (rules: ConditionalRule[]) => void
}

const OPERATORS = [
  { value: 'equals', label: 'Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'greaterThan', label: 'Greater than' },
  { value: 'lessThan', label: 'Less than' },
]

const ACTIONS = [
  { value: 'show', label: 'Show field', color: 'bg-green-500/10 text-green-700' },
  { value: 'hide', label: 'Hide field', color: 'bg-red-500/10 text-red-700' },
  { value: 'require', label: 'Make required', color: 'bg-blue-500/10 text-blue-700' },
  { value: 'disable', label: 'Disable field', color: 'bg-gray-500/10 text-gray-700' },
]

export function ConditionalLogicBuilder({
  fields,
  onRulesChange,
}: ConditionalLogicBuilderProps) {
  const { has, isLoaded } = useAuth()
  const canUseConditionalLogic = isLoaded && (has?.({ feature: 'conditional_logic' }) ?? false)
  const [rules, setRules] = useState<ConditionalRule[]>([])

  const addRule = () => {
    const newRule: ConditionalRule = {
      id: Math.random().toString(36).substr(2, 9),
      field: fields[0]?.name || '',
      operator: 'equals',
      value: '',
      action: 'show',
      targetField: fields[1]?.name || '',
    }
    const updated = [...rules, newRule]
    setRules(updated)
    onRulesChange?.(updated)
  }

  const removeRule = (id: string) => {
    const updated = rules.filter((r) => r.id !== id)
    setRules(updated)
    onRulesChange?.(updated)
  }

  const updateRule = (id: string, updates: Partial<ConditionalRule>) => {
    const updated = rules.map((r) => (r.id === id ? { ...r, ...updates } : r))
    setRules(updated)
    onRulesChange?.(updated)
  }

  if (isLoaded && !canUseConditionalLogic) {
    return (
      <Card className='border-border/50 bg-muted/20'>
        <CardHeader>
          <CardTitle className='text-lg'>Conditional Logic</CardTitle>
          <CardDescription>
            Upgrade to Professional to add branching and dynamic field rules.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button render={<Link href='/pricing' />} nativeButton={false} className='bg-primary hover:bg-primary/90'>
            View Plans
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='space-y-6'>
      <Card className='border-border/50 bg-gradient-to-br from-background to-muted/10'>
        <CardHeader>
          <CardTitle className='text-lg'>Conditional Logic</CardTitle>
          <CardDescription>
            Create dynamic forms that show or hide questions based on user responses
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {rules.length === 0 ? (
            <div className='text-center py-8'>
              <div className='w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3'>
                <ChevronDown className='w-6 h-6 text-primary' />
              </div>
              <p className='text-sm text-muted-foreground mb-4'>
                No conditional rules yet. Add one to get started!
              </p>
              <Button onClick={addRule} className='bg-primary hover:bg-primary/90'>
                <Plus className='w-4 h-4 mr-2' />
                Add Condition
              </Button>
            </div>
          ) : (
            <>
              <div className='space-y-3'>
                {rules.map((rule, index) => (
                  <Card key={rule.id} className='border-border/50 bg-muted/20'>
                    <CardContent className='p-4 space-y-3'>
                      <div className='flex items-center gap-2 mb-3'>
                        <Badge variant='outline' className='bg-primary/10 text-primary border-primary/20'>
                          IF
                        </Badge>
                        <span className='text-xs font-medium text-muted-foreground'>
                          Rule {index + 1}
                        </span>
                      </div>

                      <div className='grid grid-cols-1 md:grid-cols-4 gap-3'>
                        {/* Field Selection */}
                        <div>
                          <label className='text-xs font-medium text-muted-foreground block mb-1.5'>
                            Field
                          </label>
                          <select
                            value={rule.field}
                            onChange={(e) => updateRule(rule.id, { field: e.target.value })}
                            className='w-full px-2 py-1.5 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/20'
                          >
                            {fields.map((f) => (
                              <option key={f.name} value={f.name}>
                                {f.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Operator */}
                        <div>
                          <label className='text-xs font-medium text-muted-foreground block mb-1.5'>
                            Operator
                          </label>
                          <select
                            value={rule.operator}
                            onChange={(e) =>
                              updateRule(rule.id, {
                                operator: e.target.value as ConditionalRule['operator'],
                              })
                            }
                            className='w-full px-2 py-1.5 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/20'
                          >
                            {OPERATORS.map((op) => (
                              <option key={op.value} value={op.value}>
                                {op.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Value */}
                        <div>
                          <label className='text-xs font-medium text-muted-foreground block mb-1.5'>
                            Value
                          </label>
                          <input
                            type='text'
                            value={rule.value}
                            onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                            placeholder='Enter value...'
                            className='w-full px-2 py-1.5 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/20'
                          />
                        </div>

                        {/* Delete */}
                        <div className='flex items-end'>
                          <button
                            onClick={() => removeRule(rule.id)}
                            className='w-full px-2 py-1.5 text-destructive hover:bg-destructive/10 rounded transition-colors'
                          >
                            <Trash2 className='w-4 h-4 mx-auto' />
                          </button>
                        </div>
                      </div>

                      {/* Then Action */}
                      <div className='border-t border-border pt-3 space-y-3'>
                        <div className='flex items-center gap-2'>
                          <Badge variant='outline' className='bg-primary/10 text-primary border-primary/20'>
                            THEN
                          </Badge>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                          {/* Action */}
                          <div>
                            <label className='text-xs font-medium text-muted-foreground block mb-1.5'>
                              Action
                            </label>
                            <select
                              value={rule.action}
                              onChange={(e) =>
                                updateRule(rule.id, {
                                  action: e.target.value as ConditionalRule['action'],
                                })
                              }
                              className='w-full px-2 py-1.5 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/20'
                            >
                              {ACTIONS.map((action) => (
                                <option key={action.value} value={action.value}>
                                  {action.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Target Field */}
                          <div>
                            <label className='text-xs font-medium text-muted-foreground block mb-1.5'>
                              Target Field
                            </label>
                            <select
                              value={rule.targetField}
                              onChange={(e) => updateRule(rule.id, { targetField: e.target.value })}
                              className='w-full px-2 py-1.5 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/20'
                            >
                              {fields.map((f) => (
                                <option key={f.name} value={f.name}>
                                  {f.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button
                onClick={addRule}
                variant='outline'
                className='w-full border-dashed border-2 hover:border-primary/50 hover:bg-primary/5'
              >
                <Plus className='w-4 h-4 mr-2' />
                Add Another Condition
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
