'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { format } from 'date-fns';

interface MetricsData {
  dailyRegistrations: Array<{ date: string; count: number }>;
  dailyResponses: Array<{ date: string; count: number }>;
  dailyReports: Array<{ date: string; count: number }>;
}

export function AdminMetricsCharts() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'registrations' | 'responses' | 'reports'>('registrations');

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const response = await fetch('/api/admin/metrics');
        if (response.ok) {
          const data = await response.json();
          setMetrics(data);
        }
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2 mb-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">Unable to load metrics</p>
      </div>
    );
  }

  const tabs = [
    { id: 'registrations', label: 'User Registrations', data: metrics.dailyRegistrations },
    { id: 'responses', label: 'Response Submissions', data: metrics.dailyResponses },
    { id: 'reports', label: 'Report Generation', data: metrics.dailyReports },
  ] as const;

  const activeData = tabs.find(tab => tab.id === activeTab)?.data || [];
  const maxValue = Math.max(...activeData.map(d => d.count), 1);

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80 text-muted-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="space-y-4">
        {activeData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No data available for the selected period</p>
          </div>
        ) : (
          <>
            {/* Chart Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">
                  {tabs.find(tab => tab.id === activeTab)?.label}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Last 30 days
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  Total: {activeData.reduce((sum, d) => sum + d.count, 0)}
                </Badge>
                <Badge variant="outline">
                  Avg: {Math.round(activeData.reduce((sum, d) => sum + d.count, 0) / activeData.length || 0)}
                </Badge>
              </div>
            </div>

            {/* Simple Bar Chart */}
            <div className="space-y-2">
              <div className="flex items-end gap-1 h-32 bg-muted/30 rounded p-2">
                {activeData.map((item, index) => (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <div
                      className="w-full bg-primary rounded-sm transition-all hover:bg-primary/80"
                      style={{
                        height: `${(item.count / maxValue) * 100}%`,
                        minHeight: item.count > 0 ? '2px' : '0px',
                      }}
                      title={`${format(new Date(item.date), 'MMM dd')}: ${item.count}`}
                    />
                    {index % 5 === 0 && (
                      <span className="text-xs text-muted-foreground truncate">
                        {format(new Date(item.date), 'dd')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Data Table */}
            <div className="max-h-32 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Date</th>
                    <th className="text-right py-2">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {activeData.slice(-7).reverse().map((item, index) => (
                    <tr key={index} className="border-b border-border/50">
                      <td className="py-1 text-muted-foreground">
                        {format(new Date(item.date), 'MMM dd, yyyy')}
                      </td>
                      <td className="py-1 text-right font-medium">
                        {item.count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}