'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Mail, 
  Send, 
  Eye, 
  MousePointer, 
  AlertTriangle,
  TrendingUp,
  Users,
  Calendar,
  Settings,
  Download,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react';

interface EmailStats {
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  totalFailed: number;
  openRate: number;
  clickRate: number;
  failureRate: number;
}

interface QueueStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  cancelled: number;
}

export function EmailDashboard() {
  const [emailStats, setEmailStats] = useState<EmailStats>({
    totalSent: 0,
    totalOpened: 0,
    totalClicked: 0,
    totalFailed: 0,
    openRate: 0,
    clickRate: 0,
    failureRate: 0,
  });

  const [queueStats, setQueueStats] = useState<QueueStats>({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    cancelled: 0,
  });

  const [workflowEnabled, setWorkflowEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, these would be API calls
      // For now, we'll use mock data
      setEmailStats({
        totalSent: 1247,
        totalOpened: 892,
        totalClicked: 234,
        totalFailed: 12,
        openRate: 71.5,
        clickRate: 18.8,
        failureRate: 0.96,
      });

      setQueueStats({
        total: 45,
        pending: 12,
        processing: 3,
        completed: 28,
        failed: 1,
        cancelled: 1,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      // Implementation would call the export API
      console.log('Exporting email data...');
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const handleTestEmail = async () => {
    try {
      // Implementation would send a test email
      console.log('Sending test email...');
    } catch (error) {
      console.error('Error sending test email:', error);
    }
  };

  const toggleWorkflows = () => {
    setWorkflowEnabled(!workflowEnabled);
    // Implementation would update workflow configuration
  };

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    color = 'primary' 
  }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ElementType;
    color?: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-${color}-600`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Email Management</h1>
          <Button disabled>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage your email campaigns and notifications
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleTestEmail} variant="outline" size="sm">
            <Send className="mr-2 h-4 w-4" />
            Test Email
          </Button>
          <Button onClick={handleExportData} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button onClick={loadDashboardData} size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Email Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Sent"
          value={emailStats.totalSent.toLocaleString()}
          subtitle="Last 30 days"
          icon={Mail}
          color="blue"
        />
        <StatCard
          title="Open Rate"
          value={`${emailStats.openRate}%`}
          subtitle={`${emailStats.totalOpened} opened`}
          icon={Eye}
          color="green"
        />
        <StatCard
          title="Click Rate"
          value={`${emailStats.clickRate}%`}
          subtitle={`${emailStats.totalClicked} clicks`}
          icon={MousePointer}
          color="purple"
        />
        <StatCard
          title="Failure Rate"
          value={`${emailStats.failureRate}%`}
          subtitle={`${emailStats.totalFailed} failed`}
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="queue">Email Queue</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Performance Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>
                  Email engagement metrics for the last 30 days
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Open Rate</span>
                    <span>{emailStats.openRate}%</span>
                  </div>
                  <Progress value={emailStats.openRate} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Click Rate</span>
                    <span>{emailStats.clickRate}%</span>
                  </div>
                  <Progress value={emailStats.clickRate} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Delivery Rate</span>
                    <span>{(100 - emailStats.failureRate).toFixed(1)}%</span>
                  </div>
                  <Progress value={100 - emailStats.failureRate} />
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest email campaigns and notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: 'Welcome', count: 23, time: '2 hours ago', status: 'sent' },
                    { type: 'Booking Confirmation', count: 45, time: '4 hours ago', status: 'sent' },
                    { type: 'Class Reminder', count: 67, time: '6 hours ago', status: 'sent' },
                    { type: 'Progress Report', count: 12, time: '1 day ago', status: 'sent' },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{activity.type}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.count} emails • {activity.time}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {activity.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="queue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Queue Status</CardTitle>
              <CardDescription>
                Current status of the email processing queue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{queueStats.total}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{queueStats.pending}</div>
                  <div className="text-xs text-muted-foreground">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{queueStats.processing}</div>
                  <div className="text-xs text-muted-foreground">Processing</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{queueStats.completed}</div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{queueStats.failed}</div>
                  <div className="text-xs text-muted-foreground">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">{queueStats.cancelled}</div>
                  <div className="text-xs text-muted-foreground">Cancelled</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>
                Manage and preview your email templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[
                  { name: 'Welcome Email', usage: 156, lastModified: '2 days ago' },
                  { name: 'Booking Confirmation', usage: 342, lastModified: '1 week ago' },
                  { name: 'Class Reminder', usage: 891, lastModified: '3 days ago' },
                  { name: 'Progress Report', usage: 67, lastModified: '1 day ago' },
                  { name: 'Course Completion', usage: 23, lastModified: '5 days ago' },
                  { name: 'Engagement Email', usage: 45, lastModified: '1 week ago' },
                ].map((template, index) => (
                  <Card key={index} className="border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{template.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Usage: {template.usage}</span>
                          <span>{template.lastModified}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            Preview
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            Edit
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Workflows</CardTitle>
              <CardDescription>
                Configure automated email workflows and triggers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Workflow Status */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Email Workflows</h3>
                    <p className="text-sm text-muted-foreground">
                      {workflowEnabled ? 'All automated workflows are active' : 'Workflows are paused'}
                    </p>
                  </div>
                  <Button onClick={toggleWorkflows} variant={workflowEnabled ? "destructive" : "default"}>
                    {workflowEnabled ? (
                      <>
                        <Pause className="mr-2 h-4 w-4" />
                        Pause All
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Resume All
                      </>
                    )}
                  </Button>
                </div>

                {/* Individual Workflows */}
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    { name: 'Welcome Sequence', enabled: true, description: 'New user onboarding emails' },
                    { name: 'Booking Confirmations', enabled: true, description: 'Automatic booking confirmations' },
                    { name: 'Class Reminders', enabled: true, description: '24h and 1h before class' },
                    { name: 'Progress Reports', enabled: true, description: 'Weekly student progress updates' },
                    { name: 'Engagement Campaigns', enabled: false, description: 'Re-engage inactive users' },
                    { name: 'Teacher Summaries', enabled: true, description: 'Weekly teacher reports' },
                  ].map((workflow, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{workflow.name}</p>
                        <p className="text-xs text-muted-foreground">{workflow.description}</p>
                      </div>
                      <Badge variant={workflow.enabled ? "default" : "secondary"}>
                        {workflow.enabled ? "Active" : "Paused"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Template Performance</CardTitle>
                <CardDescription>
                  Open and click rates by template type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { template: 'Welcome', openRate: 85, clickRate: 45 },
                    { template: 'Booking Confirmation', openRate: 92, clickRate: 67 },
                    { template: 'Class Reminder', openRate: 78, clickRate: 34 },
                    { template: 'Progress Report', openRate: 71, clickRate: 28 },
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{item.template}</span>
                        <span>Open: {item.openRate}% | Click: {item.clickRate}%</span>
                      </div>
                      <div className="flex space-x-2">
                        <Progress value={item.openRate} className="flex-1" />
                        <Progress value={item.clickRate} className="flex-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Language Preferences</CardTitle>
                <CardDescription>
                  Email engagement by language
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Spanish (ES)</span>
                    <div className="text-right">
                      <div className="text-sm font-medium">847 emails (68%)</div>
                      <div className="text-xs text-muted-foreground">74% open rate</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>English (EN)</span>
                    <div className="text-right">
                      <div className="text-sm font-medium">400 emails (32%)</div>
                      <div className="text-xs text-muted-foreground">67% open rate</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}