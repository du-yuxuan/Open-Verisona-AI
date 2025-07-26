import { redirect } from 'next/navigation';
import { getUser } from '@/lib/db/queries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Sparkles, 
  User, 
  GraduationCap, 
  Target, 
  BookOpen, 
  ArrowRight, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Award,
  Calendar,
  MessageSquare,
  BarChart3,
  Settings,
  Bell
} from 'lucide-react';

export default async function DashboardPage() {
  const user = await getUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  // Calculate progress metrics
  const profileProgress = user.profileCompleted ? 100 : 
    (user.firstName && user.lastName ? 30 : 0) + 
    (user.graduationYear ? 20 : 0) + 
    (user.schoolName ? 25 : 0) + 
    (user.preferences ? 25 : 0);

  const questionnairesCompleted = 0; // TODO: Implement when questionnaire system is ready
  const reportsGenerated = 0; // TODO: Implement when report system is ready
  
  // Mock data for demonstration - will be replaced with real data
  const recentActivities = [
    {
      id: 1,
      type: 'profile_update',
      message: 'Profile information updated',
      time: '2 hours ago',
      icon: User
    },
    {
      id: 2,
      type: 'account_created',
      message: 'Welcome to Verisona AI!',
      time: new Date(user.createdAt).toLocaleDateString(),
      icon: Sparkles
    }
  ];

  const upcomingTasks = [
    {
      id: 1,
      title: 'Complete Profile Setup',
      description: 'Add your academic preferences and career goals',
      priority: 'high',
      completed: user.profileCompleted
    },
    {
      id: 2,
      title: 'Take Personality Assessment',
      description: 'Complete our AI-powered questionnaire',
      priority: 'medium',
      completed: false
    },
    {
      id: 3,
      title: 'Review College Matches',
      description: 'Explore colleges that align with your profile',
      priority: 'low',
      completed: false
    }
  ];

  return (
    <div className="flex-1 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <Sparkles className="h-8 w-8 text-primary" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary/20 rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome{user.firstName ? `, ${user.firstName}` : ''}!
              </h1>
              <p className="text-muted-foreground">
                Ready to discover your authentic voice for college applications?
              </p>
            </div>
          </div>
        </div>

        {/* Profile Completion Alert */}
        {!user.profileCompleted && (
          <Card className="mb-8 border-secondary/20 bg-secondary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-secondary">
                <User className="h-5 w-5" />
                Complete Your Profile
              </CardTitle>
              <CardDescription>
                Help us personalize your experience by completing your student profile.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="rounded-full">
                <a href="/profile">
                  Complete Profile
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Progress Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Profile Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{profileProgress}%</div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${profileProgress}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-secondary" />
                Assessments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{questionnairesCompleted}</div>
              <p className="text-xs text-muted-foreground mt-1">Completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{reportsGenerated}</div>
              <p className="text-xs text-muted-foreground mt-1">Generated</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Award className="h-4 w-4 text-secondary" />
                Journey Stage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold text-secondary">
                {profileProgress < 50 ? 'Getting Started' : 
                 profileProgress < 100 ? 'In Progress' : 'Ready to Explore'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
          {/* Left Column - Tasks and Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Your Next Steps
                </CardTitle>
                <CardDescription>
                  Complete these tasks to maximize your Verisona AI experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingTasks.map((task) => {
                    const Icon = task.completed ? CheckCircle : 
                      task.priority === 'high' ? AlertCircle : Clock;
                    const priorityColor = task.priority === 'high' ? 'text-red-500' : 
                      task.priority === 'medium' ? 'text-yellow-500' : 'text-blue-500';
                    
                    return (
                      <div key={task.id} className={`flex items-start gap-3 p-3 rounded-lg border ${
                        task.completed ? 'bg-primary/5 border-primary/20' : 'bg-muted/30 border-muted'
                      }`}>
                        <Icon className={`h-5 w-5 mt-0.5 ${
                          task.completed ? 'text-primary' : priorityColor
                        }`} />
                        <div className="flex-1">
                          <h4 className={`font-medium ${
                            task.completed ? 'text-muted-foreground line-through' : 'text-foreground'
                          }`}>
                            {task.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {task.description}
                          </p>
                        </div>
                        {!task.completed && (
                          <Button size="sm" variant="outline" className="rounded-full">
                            Start
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Jump into key features to accelerate your college prep journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button asChild className="h-auto p-4 flex-col items-start rounded-xl">
                    <a href="/questionnaire">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="h-5 w-5" />
                        <span className="font-semibold">Start Assessment</span>
                      </div>
                      <p className="text-xs opacity-90">Discover your authentic self with AI questionnaires</p>
                    </a>
                  </Button>
                  
                  <Button asChild variant="outline" className="h-auto p-4 flex-col items-start rounded-xl">
                    <a href="/reports">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-5 w-5" />
                        <span className="font-semibold">View Insights</span>
                      </div>
                      <p className="text-xs opacity-70">Access your personalized reports</p>
                    </a>
                  </Button>
                  
                  <Button asChild variant="outline" className="h-auto p-4 flex-col items-start rounded-xl">
                    <a href="/colleges">
                      <div className="flex items-center gap-2 mb-2">
                        <GraduationCap className="h-5 w-5" />
                        <span className="font-semibold">Find Colleges</span>
                      </div>
                      <p className="text-xs opacity-70">Discover your perfect matches</p>
                    </a>
                  </Button>
                  
                  <Button asChild variant="outline" className="h-auto p-4 flex-col items-start rounded-xl">
                    <a href="/profile">
                      <div className="flex items-center gap-2 mb-2">
                        <Settings className="h-5 w-5" />
                        <span className="font-semibold">Update Profile</span>
                      </div>
                      <p className="text-xs opacity-70">Manage your information</p>
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => {
                    const Icon = activity.icon;
                    return (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-primary/10">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {activity.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Support Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Need Help?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button asChild variant="ghost" className="w-full justify-start h-auto p-3">
                    <a href="/help">
                      <div className="text-left">
                        <p className="font-medium text-sm">Getting Started Guide</p>
                        <p className="text-xs text-muted-foreground">Learn how to use Verisona AI</p>
                      </div>
                    </a>
                  </Button>
                  
                  <Button asChild variant="ghost" className="w-full justify-start h-auto p-3">
                    <a href="/contact">
                      <div className="text-left">
                        <p className="font-medium text-sm">Contact Support</p>
                        <p className="text-xs text-muted-foreground">Get help from our team</p>
                      </div>
                    </a>
                  </Button>
                  
                  <Button asChild variant="ghost" className="w-full justify-start h-auto p-3">
                    <a href="/resources">
                      <div className="text-left">
                        <p className="font-medium text-sm">College Resources</p>
                        <p className="text-xs text-muted-foreground">Tips and guides for success</p>
                      </div>
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Equity Program Eligibility */}
            {user.equityEligible && (
              <Card className="border-secondary/20 bg-secondary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-secondary">
                    <Award className="h-5 w-5" />
                    Equity Program
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    You're eligible for our equity support program with additional resources and guidance.
                  </p>
                  <Button asChild size="sm" className="rounded-full">
                    <a href="/equity-program">
                      Learn More
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Account Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Account Overview</span>
              <Button asChild variant="outline" size="sm" className="rounded-full">
                <a href="/profile">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </a>
              </Button>
            </CardTitle>
            <CardDescription>
              Your personal information and account settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Personal Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="text-foreground font-medium">{user.name || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="text-foreground font-medium">{user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Member Since:</span>
                    <span className="text-foreground font-medium">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Academic Info
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Graduation Year:</span>
                    <span className="text-foreground font-medium">{user.graduationYear || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">School:</span>
                    <span className="text-foreground font-medium">{user.schoolName || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Profile Status:</span>
                    <span className={`font-medium flex items-center gap-1 ${
                      user.profileCompleted ? 'text-primary' : 'text-secondary'
                    }`}>
                      {user.profileCompleted ? (
                        <><CheckCircle className="h-3 w-3" />Complete</>
                      ) : (
                        <><AlertCircle className="h-3 w-3" />Incomplete</>
                      )}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Program Access
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account Type:</span>
                    <span className="text-foreground font-medium">Student</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Equity Program:</span>
                    <span className={`font-medium flex items-center gap-1 ${
                      user.equityEligible ? 'text-secondary' : 'text-muted-foreground'
                    }`}>
                      {user.equityEligible ? (
                        <><CheckCircle className="h-3 w-3" />Eligible</>
                      ) : (
                        <span>Standard</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Active:</span>
                    <span className="text-foreground font-medium">Today</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}