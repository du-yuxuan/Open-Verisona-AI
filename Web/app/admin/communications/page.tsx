import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Mail, 
  Bell, 
  MessageSquare, 
  Send, 
  Eye, 
  Edit,
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp
} from 'lucide-react';

export default function AdminCommunicationsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Communications</h1>
          <p className="text-muted-foreground mt-1">
            Manage email templates, notifications, and user communications
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Emails Sent Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600">+18% from yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Active Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">34</div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-muted-foreground">Across all channels</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Open Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">73.4%</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600">+5.2% this week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Click-through Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.8%</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600">Above average</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Communications Tabs */}
      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="templates">Email Templates</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <Input placeholder="Search templates..." className="w-full" />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Sort
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Welcome Email Template */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Welcome Email</CardTitle>
                  <Badge variant="outline" className="text-green-600">Active</Badge>
                </div>
                <CardDescription>
                  First email sent to new users after registration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last modified</span>
                    <span>2 days ago</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Opens</span>
                    <span>87.3%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Click rate</span>
                    <span>32.1%</span>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Questionnaire Reminder */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Questionnaire Reminder</CardTitle>
                  <Badge variant="outline" className="text-green-600">Active</Badge>
                </div>
                <CardDescription>
                  Reminds users to complete their questionnaire
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last modified</span>
                    <span>1 week ago</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Opens</span>
                    <span>65.7%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Click rate</span>
                    <span>28.4%</span>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Report Ready */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Report Ready</CardTitle>
                  <Badge variant="outline" className="text-green-600">Active</Badge>
                </div>
                <CardDescription>
                  Notifies users when their AI report is ready
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last modified</span>
                    <span>3 days ago</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Opens</span>
                    <span>94.2%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Click rate</span>
                    <span>78.1%</span>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Progress */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Weekly Progress</CardTitle>
                  <Badge variant="outline" className="text-yellow-600">Draft</Badge>
                </div>
                <CardDescription>
                  Weekly summary of student progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last modified</span>
                    <span>5 days ago</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Opens</span>
                    <span>--</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Click rate</span>
                    <span>--</span>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Active Notifications
                </CardTitle>
                <CardDescription>
                  Currently running notification campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">Daily Progress Reminder</p>
                        <p className="text-sm text-muted-foreground">Sent at 6:00 PM daily</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-green-600">Active</Badge>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">New Feature Announcement</p>
                        <p className="text-sm text-muted-foreground">One-time notification</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-blue-600">Scheduled</Badge>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">Weekend Motivation</p>
                        <p className="text-sm text-muted-foreground">Sent on weekends</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-yellow-600">Paused</Badge>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
                <CardDescription>
                  Global notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Send email notifications to users</p>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-muted-foreground">Send browser push notifications</p>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">SMS Notifications</p>
                      <p className="text-sm text-muted-foreground">Send text message notifications</p>
                    </div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">In-app Notifications</p>
                      <p className="text-sm text-muted-foreground">Show notifications within the app</p>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button className="w-full">
                      <Bell className="h-4 w-4 mr-2" />
                      Create New Notification
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Email Campaigns
              </CardTitle>
              <CardDescription>
                Manage and track email marketing campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Mail className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Back to School Campaign</h3>
                      <p className="text-sm text-muted-foreground">Sent to 2,847 students</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-muted-foreground">Open Rate: 82.3%</span>
                        <span className="text-xs text-muted-foreground">Click Rate: 34.1%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Weekly Newsletter</h3>
                      <p className="text-sm text-muted-foreground">Recurring weekly campaign</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-muted-foreground">Avg Open Rate: 67.8%</span>
                        <span className="text-xs text-muted-foreground">Avg Click Rate: 23.4%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Application Deadline Reminder</h3>
                      <p className="text-sm text-muted-foreground">Scheduled for next week</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-muted-foreground">Target: 1,234 students</span>
                        <span className="text-xs text-muted-foreground">Send Date: Dec 15, 2024</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-yellow-600">
                      <Clock className="h-3 w-3 mr-1" />
                      Scheduled
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
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