'use client'

import { useState } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ResponseFiltersProps {
  onSearch?: (query: string) => void
  onFilterChange?: (filters: FilterState) => void
}

interface FilterState {
  dateRange: 'all' | 'today' | 'week' | 'month'
  status: 'all' | 'read' | 'unread'
  sort: 'newest' | 'oldest'
}

export function ResponseFilters({ onSearch, onFilterChange }: ResponseFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterState>({
    dateRange: 'all',
    status: 'all',
    sort: 'newest',
  })
  const [showFilters, setShowFilters] = useState(false)

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    onSearch?.(value)
  }

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters as FilterState)
    onFilterChange?.(newFilters)
  }

  const activeFilterCount = [
    filters.dateRange !== 'all' ? 1 : 0,
    filters.status !== 'all' ? 1 : 0,
  ].reduce((a, b) => a + b, 0)

  return (
    <div className='space-y-4'>
      {/* Search Bar */}
      <div className='relative'>
        <Search className='absolute left-3 top-3 w-4 h-4 text-muted-foreground' />
        <input
          type='text'
          placeholder='Search responses...'
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className='w-full pl-9 pr-4 py-2.5 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
        />
      </div>

      {/* Filter Toggle */}
      <Button
        variant='outline'
        size='sm'
        onClick={() => setShowFilters(!showFilters)}
        className='relative'
      >
        <Filter className='w-4 h-4 mr-2' />
        Filters
        {activeFilterCount > 0 && (
          <Badge variant='secondary' className='ml-2 bg-primary/10 text-primary border-primary/20'>
            {activeFilterCount}
          </Badge>
        )}
      </Button>

      {/* Filter Panel */}
      {showFilters && (
        <Card className='border-border/50 bg-muted/30'>
          <CardContent className='pt-6'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              {/* Date Range */}
              <div>
                <label className='text-sm font-medium text-foreground mb-2 block'>Date Range</label>
                <div className='space-y-2'>
                  {['all', 'today', 'week', 'month'].map((range) => (
                    <label key={range} className='flex items-center gap-2 cursor-pointer'>
                      <input
                        type='radio'
                        name='dateRange'
                        checked={filters.dateRange === range}
                        onChange={() => handleFilterChange('dateRange', range)}
                        className='w-4 h-4 accent-primary'
                      />
                      <span className='text-sm capitalize'>{range === 'all' ? 'All Time' : range}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className='text-sm font-medium text-foreground mb-2 block'>Status</label>
                <div className='space-y-2'>
                  {['all', 'read', 'unread'].map((status) => (
                    <label key={status} className='flex items-center gap-2 cursor-pointer'>
                      <input
                        type='radio'
                        name='status'
                        checked={filters.status === status}
                        onChange={() => handleFilterChange('status', status)}
                        className='w-4 h-4 accent-primary'
                      />
                      <span className='text-sm capitalize'>{status === 'all' ? 'All Status' : status}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className='text-sm font-medium text-foreground mb-2 block'>Sort By</label>
                <div className='space-y-2'>
                  {['newest', 'oldest'].map((sort) => (
                    <label key={sort} className='flex items-center gap-2 cursor-pointer'>
                      <input
                        type='radio'
                        name='sort'
                        checked={filters.sort === sort}
                        onChange={() => handleFilterChange('sort', sort)}
                        className='w-4 h-4 accent-primary'
                      />
                      <span className='text-sm capitalize'>{sort}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
