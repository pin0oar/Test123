
// Import necessary UI components and hooks
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { Sun, Moon, Globe, User, LogOut, Search, Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Modern header component with search, controls, and user menu
export const ModernHeader = () => {
  // Get language functions and current language state
  const { language, toggleLanguage, t } = useLanguage();
  
  // Get theme functions and current theme state
  const { theme, toggleTheme } = useTheme();
  
  // Get authentication functions and user data
  const { user, signOut } = useAuth();

  // Handle user sign out with async function
  const handleSignOut = async () => {
    await signOut();
  };

  return (
    // Header container with white background, border, and flex layout
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
      
      {/* Left section: Search functionality */}
      <div className="flex items-center space-x-4 flex-1">
        <div className="relative max-w-md w-full">
          {/* Search icon positioned absolutely inside input */}
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          {/* Search input field with left padding to accommodate icon */}
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent"
          />
        </div>
      </div>

      {/* Right section: Action buttons and user menu */}
      <div className="flex items-center space-x-3">
        
        {/* Language toggle button */}
        <Button
          variant="ghost" // Transparent button style
          size="icon"     // Square icon-only button
          onClick={toggleLanguage}
          className="h-9 w-9 text-gray-600 hover:text-gray-900"
        >
          <Globe className="h-4 w-4" />
        </Button>

        {/* Theme toggle button (light/dark mode) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-9 w-9 text-gray-600 hover:text-gray-900"
        >
          {/* Show sun icon in dark mode, moon icon in light mode */}
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Notifications button (placeholder) */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-gray-600 hover:text-gray-900"
        >
          <Bell className="h-4 w-4" />
        </Button>

        {/* User menu - only show if user is logged in */}
        {user && (
          <DropdownMenu>
            {/* Dropdown trigger button with user avatar and name */}
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 px-3 text-gray-600 hover:text-gray-900">
                {/* User avatar - circular emerald background with user icon */}
                <div className="w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center mr-2">
                  <User className="h-3 w-3 text-white" />
                </div>
                {/* Display username (part before @ in email) */}
                <span className="text-sm font-medium">{user.email?.split('@')[0]}</span>
              </Button>
            </DropdownMenuTrigger>
            
            {/* Dropdown menu content */}
            <DropdownMenuContent align="end" className="w-56">
              {/* User email display */}
              <DropdownMenuItem>
                <User className="h-4 w-4 mr-2" />
                {user.email}
              </DropdownMenuItem>
              
              {/* Visual separator line */}
              <DropdownMenuSeparator />
              
              {/* Sign out button in red color */}
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
};
