
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

// Modern header component with cool blue theme and enhanced styling
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
    // Header container with modern styling, subtle border, and smooth transitions
    <header className="bg-background border-b border-border h-16 flex items-center justify-between px-6 transition-colors duration-300">
      
      {/* Left section: Enhanced search functionality */}
      <div className="flex items-center space-x-4 flex-1">
        <div className="relative max-w-md w-full">
          {/* Search icon positioned absolutely inside input with proper positioning */}
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          {/* Enhanced search input field with modern styling and focus states */}
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>

      {/* Right section: Action buttons and user menu with enhanced spacing */}
      <div className="flex items-center space-x-3">
        
        {/* Language toggle button with modern hover effects */}
        <Button
          variant="ghost" // Transparent button style that adapts to theme
          size="icon"     // Square icon-only button
          onClick={toggleLanguage}
          className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200"
        >
          <Globe className="h-4 w-4" />
        </Button>

        {/* Theme toggle button (light/dark mode) with smooth icon transitions */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200"
        >
          {/* Show sun icon in dark mode, moon icon in light mode with transition */}
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Notifications button (placeholder) with modern styling */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200"
        >
          <Bell className="h-4 w-4" />
        </Button>

        {/* User menu - only show if user is logged in */}
        {user && (
          <DropdownMenu>
            {/* Dropdown trigger button with enhanced user avatar and styling */}
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 px-3 text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200">
                {/* User avatar - circular primary background with user icon and subtle shadow */}
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mr-2 shadow-sm">
                  <User className="h-3 w-3 text-primary-foreground" />
                </div>
                {/* Display username (part before @ in email) with proper text styling */}
                <span className="text-sm font-medium">{user.email?.split('@')[0]}</span>
              </Button>
            </DropdownMenuTrigger>
            
            {/* Dropdown menu content with modern styling */}
            <DropdownMenuContent align="end" className="w-56">
              {/* User email display with icon */}
              <DropdownMenuItem>
                <User className="h-4 w-4 mr-2" />
                {user.email}
              </DropdownMenuItem>
              
              {/* Visual separator line */}
              <DropdownMenuSeparator />
              
              {/* Sign out button with destructive styling */}
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
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
