'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { 
  Settings, 
  Database, 
  Globe, 
  Bell,
  Shield,
  Zap,
  Monitor,
  Mail,
  Key,
  Server,
  HardDrive,
  Activity,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Save
} from 'lucide-react'

interface SystemHealth {
  database: 'healthy' | 'warning' | 'error'
  api: 'healthy' | 'warning' | 'error'
  storage: 'healthy' | 'warning' | 'error'
  lastCheck: string
}

interface SystemSettings {
  siteName: string
  adminEmail: string
  enableRegistration: boolean
  enableNotifications: boolean
  maxUploadSize: number
  sessionTimeout: number
  enableMaintenance: boolean
  enableLogging: boolean
}

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState('general')
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    database: 'healthy',
    api: 'healthy',
    storage: 'healthy',
    lastCheck: new Date().toISOString()
  })
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: 'Alumni LMS',
    adminEmail: 'admin@alumni-lms.com',
    enableRegistration: true,
    enableNotifications: true,
    maxUploadSize: 10,
    sessionTimeout: 30,
    enableMaintenance: false,
    enableLogging: true
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const checkSystemHealth = async () => {
    try {
      setLoading(true)
      // Simulate health check - replace with real API calls
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSystemHealth({
        database: 'healthy',
        api: 'healthy', 
        storage: 'healthy',
        lastCheck: new Date().toISOString()
      })
    } catch (error) {
      console.error('Health check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      setSaving(true)
      // Simulate save - replace with real API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Save failed:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    checkSystemHealth()
  }, [])

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      default:
        return <Activity className="h-5 w-5 text-gray-500" />
    }
  }

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'error': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600">Configure platform settings and monitor system health</p>
        </div>
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              System Health
            </span>
            <Button variant="outline" size="sm" onClick={checkSystemHealth} disabled={loading}>
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Database className="h-6 w-6 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Database</p>
                  <p className="text-sm text-gray-600">PostgreSQL</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getHealthIcon(systemHealth.database)}
                <span className={`text-sm font-medium ${getHealthColor(systemHealth.database)}`}>
                  {systemHealth.database}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Server className="h-6 w-6 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">API Server</p>
                  <p className="text-sm text-gray-600">Next.js</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getHealthIcon(systemHealth.api)}
                <span className={`text-sm font-medium ${getHealthColor(systemHealth.api)}`}>
                  {systemHealth.api}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <HardDrive className="h-6 w-6 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Storage</p>
                  <p className="text-sm text-gray-600">Cloud Storage</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getHealthIcon(systemHealth.storage)}
                <span className={`text-sm font-medium ${getHealthColor(systemHealth.storage)}`}>
                  {systemHealth.storage}
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            Last checked: {new Date(systemHealth.lastCheck).toLocaleString()}
          </div>
        </CardContent>
      </Card>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                General Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    placeholder="Alumni LMS"
                  />
                </div>
                <div>
                  <Label htmlFor="adminEmail">Admin Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={settings.adminEmail}
                    onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                    placeholder="admin@alumni-lms.com"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">User Registration</h3>
                    <p className="text-sm text-gray-600">Allow new users to register accounts</p>
                  </div>
                  <Switch
                    checked={settings.enableRegistration}
                    onCheckedChange={(checked) => setSettings({ ...settings, enableRegistration: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Maintenance Mode</h3>
                    <p className="text-sm text-gray-600">Put the site in maintenance mode</p>
                  </div>
                  <Switch
                    checked={settings.enableMaintenance}
                    onCheckedChange={(checked) => setSettings({ ...settings, enableMaintenance: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">System Logging</h3>
                    <p className="text-sm text-gray-600">Enable detailed system logs</p>
                  </div>
                  <Switch
                    checked={settings.enableLogging}
                    onCheckedChange={(checked) => setSettings({ ...settings, enableLogging: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                    min="5"
                    max="480"
                  />
                </div>
                <div>
                  <Label htmlFor="maxUploadSize">Max Upload Size (MB)</Label>
                  <Input
                    id="maxUploadSize"
                    type="number"
                    value={settings.maxUploadSize}
                    onChange={(e) => setSettings({ ...settings, maxUploadSize: parseInt(e.target.value) })}
                    min="1"
                    max="100"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Password Policy</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>✓ Minimum 8 characters</p>
                    <p>✓ At least one uppercase letter</p>
                    <p>✓ At least one number</p>
                    <p>✓ At least one special character</p>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-600 mb-3">Enhanced security for admin accounts</p>
                  <Button variant="outline" size="sm">
                    <Key className="h-4 w-4 mr-2" />
                    Configure 2FA
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Email Notifications</h3>
                  <p className="text-sm text-gray-600">Send system notifications via email</p>
                </div>
                <Switch
                  checked={settings.enableNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, enableNotifications: checked })}
                />
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Email Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtpHost">SMTP Host</Label>
                    <Input id="smtpHost" placeholder="smtp.gmail.com" />
                  </div>
                  <div>
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input id="smtpPort" placeholder="587" />
                  </div>
                  <div>
                    <Label htmlFor="smtpUser">SMTP Username</Label>
                    <Input id="smtpUser" placeholder="your-email@gmail.com" />
                  </div>
                  <div>
                    <Label htmlFor="smtpPass">SMTP Password</Label>
                    <Input id="smtpPass" type="password" placeholder="Your app password" />
                  </div>
                </div>
                
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Test Email Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Settings */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Performance Optimization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Database</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">~50ms</p>
                  <p className="text-sm text-blue-700">Average query time</p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-900">API Response</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">~120ms</p>
                  <p className="text-sm text-green-700">Average response time</p>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-5 w-5 text-purple-600" />
                    <span className="font-medium text-purple-900">Memory Usage</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">256MB</p>
                  <p className="text-sm text-purple-700">Current usage</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Optimization Tools</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-16 flex flex-col items-center justify-center gap-2">
                    <Database className="h-5 w-5" />
                    <span className="text-sm">Optimize Database</span>
                  </Button>
                  
                  <Button variant="outline" className="h-16 flex flex-col items-center justify-center gap-2">
                    <HardDrive className="h-5 w-5" />
                    <span className="text-sm">Clear Cache</span>
                  </Button>
                  
                  <Button variant="outline" className="h-16 flex flex-col items-center justify-center gap-2">
                    <Activity className="h-5 w-5" />
                    <span className="text-sm">Run Performance Test</span>
                  </Button>
                  
                  <Button variant="outline" className="h-16 flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="h-5 w-5" />
                    <span className="text-sm">Restart Services</span>
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900">Performance Recommendations</h4>
                    <ul className="mt-2 text-sm text-yellow-800 space-y-1">
                      <li>• Consider enabling database connection pooling</li>
                      <li>• Implement Redis caching for frequently accessed data</li>
                      <li>• Add database indexes for commonly queried fields</li>
                      <li>• Enable gzip compression for API responses</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}