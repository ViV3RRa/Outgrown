import { useState, useEffect } from 'react';
import { AuthScreen } from './components/AuthScreen';
import {
  BottomNavigation,
  type NavigationTab
} from './components/BottomNavigation';
import { OverviewScreen } from './components/OverviewScreen';
import { ClothingInventory } from './components/ClothingInventory';
import { ProfileScreen } from './components/ProfileScreen';
import { api } from './services/api';
import type { User, Child, ClothingItem } from './services/api';
import { toast, Toaster } from 'sonner';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [allClothingItems, setAllClothingItems] = useState<ClothingItem[]>([]);
  const [activeTab, setActiveTab] = useState<NavigationTab>('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user && children.length > 0) {
      loadAllClothingItems();
    }
  }, [user, children]);

  const checkAuth = async () => {
    try {
      const currentUser = await api.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        const allChildren = await api.getChildren();
        setChildren(allChildren);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllClothingItems = async () => {
    try {
      // Load clothing items for all children
      const allItems: ClothingItem[] = [];
      for (const child of children) {
        const items = await api.getClothingItems(child.id);
        allItems.push(...items);
      }
      setAllClothingItems(allItems);
    } catch (error) {
      console.error('Failed to load clothing items:', error);
      toast.error('Kunne ikke indlæse tøj');
    }
  };

  const handleAuthSuccess = (user: User) => {
    setUser(user);
    // Load children
    api.getChildren().then((allChildren) => {
      setChildren(allChildren);
    });
    toast.success(`Velkommen, ${user.name}!`);
  };

  const handleLogout = () => {
    setUser(null);
    setChildren([]);
    setAllClothingItems([]);
    setActiveTab('overview');
    toast.success('Du er nu logget ud');
  };

  const handleAddClothing = (item: ClothingItem) => {
    setAllClothingItems((prev) => [...prev, item]);
    toast.success('Tøj tilføjet!');
  };

  const handleUpdateClothing = (updatedItem: ClothingItem) => {
    setAllClothingItems((prev) =>
      prev.map((item) =>
        item.id === updatedItem.id ? updatedItem : item,
      ),
    );
    toast.success('Tøj opdateret!');
  };

  const handleDeleteClothing = async (id: string) => {
    try {
      await api.deleteClothingItem(id);
      setAllClothingItems((prev) =>
        prev.filter((item) => item.id !== id),
      );
      toast.success('Tøj slettet');
    } catch {
      toast.error('Kunne ikke slette tøj');
    }
  };

  const handleChildrenUpdated = (updatedChildren: Child[]) => {
    setChildren(updatedChildren);
    // Reload all clothing items when children are updated
    loadAllClothingItems();
  };

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-pulse text-4xl mb-4'>👕</div>
          <p>Indlæser...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewScreen
            children={children}
            allClothingItems={allClothingItems}
          />
        );
      case 'special':
        return (
          <ClothingInventory
            items={allClothingItems}
            onDeleteItem={handleDeleteClothing}
            onAddClothing={handleAddClothing}
            onUpdateClothing={handleUpdateClothing}
            children={children}
          />
        );
      case 'profile':
        return (
          <ProfileScreen
            user={user}
            children={children}
            onLogout={handleLogout}
            onChildrenUpdated={handleChildrenUpdated}
          />
        );
      default:
        return (
          <OverviewScreen
            children={children}
            allClothingItems={allClothingItems}
          />
        );
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 pb-20'>
      <main className='container mx-auto px-4 py-6 max-w-md'>
        {renderActiveScreen()}
      </main>

      <BottomNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <Toaster />
    </div>
  );
}