import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  HelpCircle, 
  MessageSquare, 
  BookOpen, 
  FileText, 
  Video,
  ExternalLink,
  Search,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Users,
  Mail,
  Phone
} from 'lucide-react';

export default function AdminSupportPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Help & Support</h1>
          <p className="text-muted-foreground mt-1">
            Documentation, tutorials, and support resources
          </p>
        </div>
        <Button>
          <MessageSquare className="h-4 w-4 mr-2" />
          Contact Support
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Documentation</p>
                <p className="text-sm text-muted-foreground">Admin guides</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Video className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Video Tutorials</p>
                <p className="text-sm text-muted-foreground">Watch & learn</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Live Chat</p>
                <p className="text-sm text-muted-foreground">Get instant help</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium">API Docs</p>
                <p className="text-sm text-muted-foreground">Developer guide</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search help articles, tutorials, and documentation..." 
                className="pl-10"
              />
            </div>
            <Button>Search</Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Documentation */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Getting Started
              </CardTitle>
              <CardDescription>
                Essential guides to get you up and running
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Admin Dashboard Overview</p>
                      <p className="text-sm text-muted-foreground">Learn to navigate the admin interface</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">5 min read</Badge>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Users className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">User Management Guide</p>
                      <p className="text-sm text-muted-foreground">Managing student accounts and permissions</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">8 min read</Badge>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Questionnaire Management</p>
                      <p className="text-sm text-muted-foreground">Creating and managing questionnaires</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">12 min read</Badge>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Lightbulb className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium">AI Integration Setup</p>
                      <p className="text-sm text-muted-foreground">Configuring Dify workflows and AI features</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">15 min read</Badge>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Video Tutorials
              </CardTitle>
              <CardDescription>
                Step-by-step video guides for common tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer">
                  <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center">
                    <Video className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium mb-1">Platform Setup Walkthrough</h3>
                  <p className="text-sm text-muted-foreground mb-2">Complete setup guide from start to finish</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>12:34</span>
                    <Star className="h-3 w-3" />
                    <span>4.8/5</span>
                  </div>
                </div>

                <div className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer">
                  <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center">
                    <Video className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium mb-1">Analytics Dashboard Tour</h3>
                  <p className="text-sm text-muted-foreground mb-2">Understanding metrics and insights</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>8:45</span>
                    <Star className="h-3 w-3" />
                    <span>4.9/5</span>
                  </div>
                </div>

                <div className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer">
                  <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center">
                    <Video className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium mb-1">Email Campaign Setup</h3>
                  <p className="text-sm text-muted-foreground mb-2">Creating and managing email campaigns</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>15:20</span>
                    <Star className="h-3 w-3" />
                    <span>4.7/5</span>
                  </div>
                </div>

                <div className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer">
                  <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center">
                    <Video className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium mb-1">Security Configuration</h3>
                  <p className="text-sm text-muted-foreground mb-2">Setting up security policies and 2FA</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>10:15</span>
                    <Star className="h-3 w-3" />
                    <span>4.6/5</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Quick Support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-medium mb-2">Live Chat</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Get instant help from our support team
                </p>
                <Button className="w-full">Start Chat</Button>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-medium mb-2">Email Support</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Send us a detailed message
                </p>
                <Button variant="outline" className="w-full">Send Email</Button>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Phone className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-medium mb-2">Phone Support</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Call us during business hours
                </p>
                <Button variant="outline" className="w-full">Call Now</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Platform Status</span>
                  <Badge variant="outline" className="text-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Operational
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Services</span>
                  <Badge variant="outline" className="text-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Operational
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database</span>
                  <Badge variant="outline" className="text-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Operational
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email Service</span>
                  <Badge variant="outline" className="text-yellow-600">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Degraded
                  </Badge>
                </div>

                <div className="pt-3 border-t">
                  <Button variant="outline" className="w-full" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Status Page
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <p className="font-medium">Support Hours</p>
                <p className="text-muted-foreground">Mon-Fri: 9AM-5PM EST</p>
              </div>
              
              <div className="text-sm">
                <p className="font-medium">Emergency Support</p>
                <p className="text-muted-foreground">24/7 for critical issues</p>
              </div>
              
              <div className="text-sm">
                <p className="font-medium">Email</p>
                <p className="text-muted-foreground">admin@verisona.ai</p>
              </div>
              
              <div className="text-sm">
                <p className="font-medium">Phone</p>
                <p className="text-muted-foreground">+1 (555) 123-4567</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions and answers for administrators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">How do I add new questionnaire templates?</h3>
              <p className="text-sm text-muted-foreground">
                Navigate to Admin → Questionnaires → Create New. You can create custom question sets or use AI-generated templates from Dify workflows.
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">How can I monitor user engagement?</h3>
              <p className="text-sm text-muted-foreground">
                Use the Analytics dashboard to view user activity, completion rates, and engagement metrics. You can filter by date ranges and user demographics.
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">What security features are available?</h3>
              <p className="text-sm text-muted-foreground">
                The platform includes 2FA, IP whitelisting, session timeouts, password complexity requirements, and comprehensive audit logging.
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">How do I configure email notifications?</h3>
              <p className="text-sm text-muted-foreground">
                Go to Admin → Communications → Email Templates to customize notification content, timing, and targeting criteria for different user segments.
              </p>
            </div>

            <div className="text-center pt-4">
              <Button variant="outline">
                View All FAQs
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}