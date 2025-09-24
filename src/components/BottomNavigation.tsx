import { Home, Heart, User } from 'lucide-react';

export type NavigationTab = 'overview' | 'special' | 'profile';

interface BottomNavigationProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

const tabs = [
  { id: 'overview' as const, label: 'Oversigt', icon: Home },
  { id: 'special' as const, label: 'Særligt tøj', icon: Heart },
  { id: 'profile' as const, label: 'Profil', icon: User }
];

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border shadow-lg">
      <div className="flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-3 px-1 transition-all duration-200 ${
                isActive 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-primary scale-110' : ''} transition-all duration-200`} />
              <span className={`text-xs font-medium ${isActive ? 'text-primary' : ''}`}>{tab.label}</span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}