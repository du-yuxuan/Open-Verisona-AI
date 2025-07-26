import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Settings, 
  Database, 
  Shield, 
  FileText, 
  Server, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  HardDrive,
  Cpu,
  MemoryStick,
  Wifi,
  Lock,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Download,
  Upload,
  Trash2
} from 'lucide-react';

export default function AdminSystemPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">System Management</h1>
          <p className="text-muted-foreground mt-1">
            Configure system settings, monitor health, and manage security
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            System Healthy
          </Badge>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              CPU Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">34%</div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div className="bg-green-500 h-2 rounded-full" style={{width: '34%'}}></div>
            </div>
            <span className="text-xs text-muted-foreground mt-1">Normal</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MemoryStick className="h-4 w-4" />
              Memory Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">67%</div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{width: '67%'}}></div>
            </div>
            <span className="text-xs text-muted-foreground mt-1">Moderate</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Storage Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45%</div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{width: '45%'}}></div>
            </div>
            <span className="text-xs text-muted-foreground mt-1">Healthy</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Server className="h-4 w-4" />
              Uptime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.8%</div>
            <div className="flex items-center gap-1 mt-2">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span className="text-xs text-muted-foreground">15 days, 4 hours</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Management Tabs */}
      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  General Settings
                </CardTitle>
                <CardDescription>
                  Configure general platform settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="platform-name">Platform Name</Label>
                  <Input id="platform-name" defaultValue="Verisona AI" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="support-email">Support Email</Label>
                  <Input id="support-email" defaultValue="support@verisona.ai" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max-users">Maximum Users</Label>
                  <Input id="max-users" type="number" defaultValue="10000" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable maintenance mode to prevent user access
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Registration Enabled</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow new users to register
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send email notifications to users
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="h-5 w-5" />
                  API Configuration
                </CardTitle>
                <CardDescription>
                  Configure external API integrations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dify-endpoint">Dify API Endpoint</Label>
                  <Input id="dify-endpoint" defaultValue="https://api.dify.ai/v1" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dify-key">Dify API Key</Label>
                  <div className="flex items-center gap-2">
                    <Input id="dify-key" type="password" defaultValue="sk-****" />
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="openai-key">OpenAI API Key</Label>
                  <div className="flex items-center gap-2">
                    <Input id="openai-key" type="password" defaultValue="sk-****" />
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rate-limit">API Rate Limit</Label>
                  <Input id="rate-limit" defaultValue="100 requests/minute" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>API Caching</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable caching for API responses
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Status
                </CardTitle>
                <CardDescription>
                  Monitor database health and performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Connection Status</span>
                    <Badge variant="outline" className="text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Database Size</span>
                    <span className="text-sm">2.3 GB</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Active Connections</span>
                    <span className="text-sm">24/100</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Query Performance</span>
                    <Badge variant="outline" className="text-green-600">Excellent</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Last Backup</span>
                    <span className="text-sm">2 hours ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  Database Operations
                </CardTitle>
                <CardDescription>
                  Manage database backups and maintenance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button className="w-full" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Create Backup
                  </Button>
                  
                  <Button className="w-full" variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Restore Backup
                  </Button>
                  
                  <Button className="w-full" variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Optimize Database
                  </Button>
                  
                  <Button className="w-full" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    View Query Logs
                  </Button>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Automatic Backups</Label>
                        <p className="text-sm text-muted-foreground">
                          Daily backups at 2:00 AM
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Database Tables</CardTitle>
              <CardDescription>Overview of database tables and sizes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Database className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">users</p>
                      <p className="text-sm text-muted-foreground">User accounts and profiles</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">2,847 rows</p>
                    <p className="text-xs text-muted-foreground">234 KB</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Database className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">questionnaires</p>
                      <p className="text-sm text-muted-foreground">Questionnaire templates</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">47 rows</p>
                    <p className="text-xs text-muted-foreground">89 KB</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Database className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">responses</p>
                      <p className="text-sm text-muted-foreground">User questionnaire responses</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">18,392 rows</p>
                    <p className="text-xs text-muted-foreground">1.2 MB</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Database className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium">reports</p>
                      <p className="text-sm text-muted-foreground">AI-generated reports</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">1,234 rows</p>
                    <p className="text-xs text-muted-foreground">456 KB</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Status
                </CardTitle>
                <CardDescription>
                  Monitor security health and threats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">SSL Certificate</span>
                    <Badge variant="outline" className="text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Valid
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Firewall Status</span>
                    <Badge variant="outline" className="text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Failed Login Attempts</span>
                    <Badge variant="outline" className="text-yellow-600">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      23 today
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Last Security Scan</span>
                    <span className="text-sm">1 hour ago</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Vulnerabilities</span>
                    <Badge variant="outline" className="text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      None
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Security Configuration
                </CardTitle>
                <CardDescription>
                  Configure security settings and policies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Require 2FA for admin accounts
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Password Complexity</Label>
                    <p className="text-sm text-muted-foreground">
                      Enforce strong password requirements
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Session Timeout</Label>
                    <p className="text-sm text-muted-foreground">
                      Auto-logout after 30 minutes
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>IP Whitelisting</Label>
                    <p className="text-sm text-muted-foreground">
                      Restrict admin access by IP
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-attempts">Max Login Attempts</Label>
                  <Input id="max-attempts" type="number" defaultValue="5" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lockout-duration">Lockout Duration (minutes)</Label>
                  <Input id="lockout-duration" type="number" defaultValue="15" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                System Logs
              </CardTitle>
              <CardDescription>
                Monitor system activity and debug issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Input placeholder="Search logs..." className="flex-1" />
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  <div className="flex items-center gap-3 p-3 border rounded-lg text-sm">
                    <Badge variant="outline" className="text-green-600">INFO</Badge>
                    <span className="text-muted-foreground">2024-12-10 14:32:15</span>
                    <span>User login successful: user@example.com</span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 border rounded-lg text-sm">
                    <Badge variant="outline" className="text-blue-600">DEBUG</Badge>
                    <span className="text-muted-foreground">2024-12-10 14:31:42</span>
                    <span>API request processed: /api/questionnaires</span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 border rounded-lg text-sm">
                    <Badge variant="outline" className="text-yellow-600">WARN</Badge>
                    <span className="text-muted-foreground">2024-12-10 14:29:18</span>
                    <span>High memory usage detected: 82%</span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 border rounded-lg text-sm">
                    <Badge variant="outline" className="text-green-600">INFO</Badge>
                    <span className="text-muted-foreground">2024-12-10 14:28:55</span>
                    <span>Database backup completed successfully</span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 border rounded-lg text-sm">
                    <Badge variant="outline" className="text-red-600">ERROR</Badge>
                    <span className="text-muted-foreground">2024-12-10 14:25:32</span>
                    <span>Failed API call to Dify: Connection timeout</span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 border rounded-lg text-sm">
                    <Badge variant="outline" className="text-green-600">INFO</Badge>
                    <span className="text-muted-foreground">2024-12-10 14:22:09</span>
                    <span>New user registered: student@university.edu</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}