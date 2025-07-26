'use client';

import { User } from '@/lib/db/schema';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Bell, ChevronDown, Settings, LogOut, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { signOut } from '@/app/(login)/actions';

interface AdminHeaderProps {
  user: User;
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const userInitials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : user.email[0].toUpperCase();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Logo/Brand */}
        <div className="flex items-center gap-3">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">VA</span>
              </div>
              <div>
                <h1 className="font-bold text-lg text-foreground">Verisona AI</h1>
                <p className="text-xs text-muted-foreground -mt-1">Admin Panel</p>
              </div>
            </div>
          </Link>
          <Badge variant="outline" className="ml-2">
            Beta
          </Badge>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 h-9">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="text-sm font-medium">{user.name || 'Admin'}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  User Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => signOut()}
                className="flex items-center gap-2 text-red-600 focus:text-red-600"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}