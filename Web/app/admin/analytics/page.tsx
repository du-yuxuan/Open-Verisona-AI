import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye,
  Zap,
  Activity,
  Download,
  Filter,
  Calendar,
  Target
} from 'lucide-react';

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive platform analytics and insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Date Range
          </Button>
          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,847</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600">+12.5% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Active Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600">+8.3% from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78.4%</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600">+5.2% improvement</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Avg Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142ms</div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-green-600">Optimal performance</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
          <TabsTrigger value="behavior">User Behavior</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  User Growth Trend
                </CardTitle>
                <CardDescription>
                  Monthly active user growth over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted/10 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Chart visualization would be here</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Integration with analytics service recommended
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Engagement Metrics
                </CardTitle>
                <CardDescription>
                  Daily active users and session duration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Daily Active Users</span>
                    <Badge variant="outline">892</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Avg Session Duration</span>
                    <Badge variant="outline">12m 34s</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Pages per Session</span>
                    <Badge variant="outline">4.2</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Bounce Rate</span>
                    <Badge variant="outline">23.1%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
                <CardDescription>
                  System performance and response times
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">API Response Time</span>
                    <Badge variant="outline" className="text-green-600">142ms</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Page Load Time</span>
                    <Badge variant="outline" className="text-green-600">1.2s</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Error Rate</span>
                    <Badge variant="outline" className="text-green-600">0.12%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Uptime</span>
                    <Badge variant="outline" className="text-green-600">99.8%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Server Health</CardTitle>
                <CardDescription>Real-time server monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">CPU Usage</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded">
                        <div className="h-2 bg-green-500 rounded" style={{width: '34%'}}></div>
                      </div>
                      <span className="text-xs text-muted-foreground">34%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Memory Usage</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded">
                        <div className="h-2 bg-yellow-500 rounded" style={{width: '67%'}}></div>
                      </div>
                      <span className="text-xs text-muted-foreground">67%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Storage Usage</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded">
                        <div className="h-2 bg-blue-500 rounded" style={{width: '45%'}}></div>
                      </div>
                      <span className="text-xs text-muted-foreground">45%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="accessibility" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Accessibility Compliance
                </CardTitle>
                <CardDescription>
                  WCAG 2.1 AA compliance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Score</span>
                    <Badge variant="outline" className="text-green-600">94/100</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Color Contrast</span>
                    <Badge variant="outline" className="text-green-600">Excellent</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Keyboard Navigation</span>
                    <Badge variant="outline" className="text-green-600">Compliant</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Screen Reader Support</span>
                    <Badge variant="outline" className="text-yellow-600">Good</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Equity Metrics</CardTitle>
                <CardDescription>Underrepresented student support tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Low-income student usage</span>
                    <Badge variant="outline">43.2%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">First-generation college</span>
                    <Badge variant="outline">38.7%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Underrepresented minorities</span>
                    <Badge variant="outline">52.1%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Accessibility tool usage</span>
                    <Badge variant="outline">18.4%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                User Journey Analysis
              </CardTitle>
              <CardDescription>
                Understanding how students navigate the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">87%</div>
                    <div className="text-sm text-muted-foreground mt-1">Complete onboarding</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">74%</div>
                    <div className="text-sm text-muted-foreground mt-1">Start questionnaire</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">62%</div>
                    <div className="text-sm text-muted-foreground mt-1">Complete full report</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Most Popular Features</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">College Match Quiz</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded">
                          <div className="h-2 bg-blue-500 rounded" style={{width: '85%'}}></div>
                        </div>
                        <span className="text-xs text-muted-foreground">85%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Personality Assessment</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded">
                          <div className="h-2 bg-green-500 rounded" style={{width: '78%'}}></div>
                        </div>
                        <span className="text-xs text-muted-foreground">78%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Essay Guidance</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded">
                          <div className="h-2 bg-purple-500 rounded" style={{width: '72%'}}></div>
                        </div>
                        <span className="text-xs text-muted-foreground">72%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Career Exploration</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded">
                          <div className="h-2 bg-orange-500 rounded" style={{width: '65%'}}></div>
                        </div>
                        <span className="text-xs text-muted-foreground">65%</span>
                      </div>
                    </div>
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