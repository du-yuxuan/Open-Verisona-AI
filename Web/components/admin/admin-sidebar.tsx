'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  HelpCircle,
  Database,
  MessageSquare,
  Shield,
  Zap,
  Eye,
  Brain,
  Target,
  Mail,
  Bell,
  Activity
} from 'lucide-react';

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  description?: string;
  children?: SidebarItem[];
}

const sidebarItems: SidebarItem[] = [
  {
    title: 'Overview',
    href: '/admin',
    icon: BarChart3,
    description: 'Platform overview and key metrics'
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
    description: 'User management and analytics',
    children: [
      {
        title: 'All Users',
        href: '/admin/users',
        icon: Users
      },
      {
        title: 'User Analytics',
        href: '/admin/users/analytics',
        icon: BarChart3
      },
      {
        title: 'Equity Reports',
        href: '/admin/users/equity',
        icon: Target
      }
    ]
  },
  {
    title: 'Questionnaires',
    href: '/admin/questionnaires',
    icon: FileText,
    description: 'Questionnaire management and creation',
    children: [
      {
        title: 'All Questionnaires',
        href: '/admin/questionnaires',
        icon: FileText
      },
      {
        title: 'Create New',
        href: '/admin/questionnaires/create',
        icon: FileText
      },
      {
        title: 'Analytics',
        href: '/admin/questionnaires/analytics',
        icon: BarChart3
      },
      {
        title: 'AI Questions',
        href: '/admin/questionnaires/ai-questions',
        icon: Brain,
        badge: 'AI'
      }
    ]
  },
  {
    title: 'Reports',
    href: '/admin/reports',
    icon: Activity,
    description: 'Report management and analytics',
    children: [
      {
        title: 'All Reports',
        href: '/admin/reports',
        icon: Activity
      },
      {
        title: 'Report Analytics',
        href: '/admin/reports/analytics',
        icon: BarChart3
      },
      {
        title: 'AI Processing',
        href: '/admin/reports/ai-processing',
        icon: Brain,
        badge: 'AI'
      }
    ]
  },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    description: 'Platform analytics and insights',
    children: [
      {
        title: 'Dashboard',
        href: '/admin/analytics',
        icon: BarChart3
      },
      {
        title: 'Performance',
        href: '/admin/analytics/performance',
        icon: Zap
      },
      {
        title: 'Accessibility',
        href: '/admin/analytics/accessibility',
        icon: Eye
      },
      {
        title: 'User Behavior',
        href: '/admin/analytics/behavior',
        icon: Activity
      }
    ]
  },
  {
    title: 'Communications',
    href: '/admin/communications',
    icon: Mail,
    description: 'Email templates and notifications',
    children: [
      {
        title: 'Email Templates',
        href: '/admin/communications/templates',
        icon: Mail
      },
      {
        title: 'Notifications',
        href: '/admin/communications/notifications',
        icon: Bell
      },
      {
        title: 'Campaigns',
        href: '/admin/communications/campaigns',
        icon: MessageSquare
      }
    ]
  },
  {
    title: 'System',
    href: '/admin/system',
    icon: Settings,
    description: 'System settings and configuration',
    children: [
      {
        title: 'Settings',
        href: '/admin/system/settings',
        icon: Settings
      },
      {
        title: 'Database',
        href: '/admin/system/database',
        icon: Database
      },
      {
        title: 'Security',
        href: '/admin/system/security',
        icon: Shield
      },
      {
        title: 'Logs',
        href: '/admin/system/logs',
        icon: FileText
      }
    ]
  },
  {
    title: 'Help & Support',
    href: '/admin/support',
    icon: HelpCircle,
    description: 'Help documentation and support tools'
  }
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev => 
      prev.includes(href) 
        ? prev.filter(item => item !== href)
        : [...prev, href]
    );
  };

  React.useEffect(() => {
    // Auto-expand parent items based on current path
    const expandParents = () => {
      const newExpanded: string[] = [];
      sidebarItems.forEach(item => {
        if (item.children) {
          const hasActiveChild = item.children.some(child => 
            pathname.startsWith(child.href) && child.href !== '/admin'
          );
          if (hasActiveChild || pathname.startsWith(item.href)) {
            newExpanded.push(item.href);
          }
        }
      });
      setExpandedItems(newExpanded);
    };

    expandParents();
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  const renderSidebarItem = (item: SidebarItem, level: number = 0) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    const expanded = expandedItems.includes(item.href);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.href}>
        <div
          className={`
            flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer
            ${active 
              ? 'bg-primary text-primary-foreground' 
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }
            ${level > 0 ? 'ml-4 text-sm' : ''}
          `}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.href);
            }
          }}
        >
          <Link 
            href={item.href} 
            className="flex items-center flex-1 min-w-0"
            onClick={(e) => {
              if (hasChildren) {
                e.preventDefault();
              }
            }}
          >
            <Icon className={`h-4 w-4 mr-3 flex-shrink-0 ${level > 0 ? 'h-3 w-3' : ''}`} />
            <span className="truncate">{item.title}</span>
          </Link>
          
          <div className="flex items-center gap-2">
            {item.badge && (
              <Badge variant="secondary" className="text-xs">
                {item.badge}
              </Badge>
            )}
            {hasChildren && (
              <div className={`transition-transform ${expanded ? 'rotate-90' : ''}`}>
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {hasChildren && expanded && (
          <div className="mt-1 space-y-1">
            {item.children?.map(child => renderSidebarItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-64 bg-card border-r border-border h-[calc(100vh-4rem)] overflow-y-auto hidden md:block">
      <div className="p-4">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-1">Admin Panel</h2>
          <p className="text-sm text-muted-foreground">
            Manage your Verisona AI platform
          </p>
        </div>

        <nav className="space-y-2">
          {sidebarItems.map(item => renderSidebarItem(item))}
        </nav>

        {/* Quick Stats Card */}
        <Card className="mt-6 p-4">
          <h3 className="font-medium text-sm mb-3">Quick Stats</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Total Users</span>
              <span className="font-medium">1,234</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Active Sessions</span>
              <span className="font-medium">89</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Questionnaires</span>
              <span className="font-medium">12</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Reports Generated</span>
              <span className="font-medium">567</span>
            </div>
          </div>
        </Card>
      </div>
    </aside>
  );
}