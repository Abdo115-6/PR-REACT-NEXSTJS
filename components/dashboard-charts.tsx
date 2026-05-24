'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { format, parseISO } from 'date-fns'

interface ChartData {
  donationsOverTime: { date: string; amount: number; count: number }[]
  campaignPerformance: { name: string; raised: number; goal: number; donations: number }[]
  revenueBreakdown: { name: string; value: number; color: string }[]
}

export function DashboardCharts({ data }: { data: ChartData }) {
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  return (
    <div className="space-y-6">
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Donation Trends</TabsTrigger>
          <TabsTrigger value="campaigns">Campaign Performance</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Donations Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              {data.donationsOverTime.length === 0 ? (
                <p className="text-muted-foreground text-center py-12">No donation data yet</p>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.donationsOverTime}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(d) => format(parseISO(d), 'MMM d')}
                        className="text-xs"
                      />
                      <YAxis className="text-xs" />
                      <Tooltip
                        labelFormatter={(d) => format(parseISO(d as string), 'MMM d, yyyy')}
                        formatter={(value: number) => [`MAD ${value.toLocaleString()}`, 'Amount']}
                      />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {data.campaignPerformance.length === 0 ? (
                <p className="text-muted-foreground text-center py-12">No campaigns yet</p>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.campaignPerformance}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" tick={false} />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Bar dataKey="raised" fill="#3b82f6" name="Raised" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="goal" fill="#e2e8f0" name="Goal" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {data.revenueBreakdown.length === 0 ? (
                <p className="text-muted-foreground text-center py-12">No revenue data yet</p>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.revenueBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        dataKey="value"
                      >
                        {data.revenueBreakdown.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`MAD ${value.toLocaleString()}`, '']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
