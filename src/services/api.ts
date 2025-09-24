// Mock PocketBase API service
// This will be replaced with actual PocketBase integration later

export interface ClothingItem {
  id: string;
  comment?: string; // Changed from name to comment and made optional
  category: 'sokker' | 'trøjer' | 'bukser' | 'kjoler' | 'jakker' | 'undertøj' | 'body' | 'sko' | 'tilbehør';
  size: string;
  gender?: 'dreng' | 'pige' | 'unisex';
  season: 'forår' | 'sommer' | 'efterår' | 'vinter' | 'helår';
  doNotDiscard: boolean;
  imageUrl?: string;
  imageUrls?: string[]; // Support multiple images
  userId: string;
  childId?: string; // Made optional - special clothing can exist without child assignment
  createdAt: string;
  updatedAt: string;
}

// New interface for regular clothing (count-based)
export interface RegularClothing {
  id: string;
  category: 'sokker' | 'trøjer' | 'bukser' | 'kjoler' | 'jakker' | 'undertøj' | 'body' | 'sko' | 'tilbehør';
  size: string;
  count: number;
  userId: string;
  childId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Child {
  id: string;
  name: string;
  birthDate: string;
  gender: 'dreng' | 'pige' | 'unisex'; // Add gender field
  sizeOffset: number; // Changed from currentSize to sizeOffset (-2, -1, 0, +1, +2, etc.)
  currentShoeSize: string; // Keep shoe size manual
  bodySwitchSize: string; // Size where child switches from body to undertøj
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Danish clothing sizes progression
export const DANISH_SIZES = [
  '50', '56', '62', '68', '74', '80', '86', '92', '98', '104', 
  '110', '116', '122', '128', '134', '140', '146', '152', '158', '164', '170', '176'
];

// Danish shoe sizes progression
export const DANISH_SHOE_SIZES = [
  '18', '19', '20', '21', '22', '23', '24', '25', '26'
];

// Size calculation based on age curve from Danish standards
export const AGE_TO_SIZE_MAPPING = [
  { ageInMonths: 0, size: '56' },      // Newborn
  { ageInMonths: 3, size: '62' },      // 3 months
  { ageInMonths: 6, size: '68' },      // 6 months
  { ageInMonths: 9, size: '74' },      // 9 months
  { ageInMonths: 12, size: '80' },     // 1 year
  { ageInMonths: 18, size: '86' },     // 1.5 years
  { ageInMonths: 24, size: '92' },     // 2 years
  { ageInMonths: 36, size: '98' },     // 3 years
  { ageInMonths: 48, size: '104' },    // 4 years
  { ageInMonths: 60, size: '110' },    // 5 years
  { ageInMonths: 72, size: '116' },    // 6 years
  { ageInMonths: 84, size: '122' },    // 7 years
  { ageInMonths: 96, size: '128' },    // 8 years
  { ageInMonths: 108, size: '134' },   // 9 years
  { ageInMonths: 120, size: '140' },   // 10 years
  { ageInMonths: 132, size: '146' },   // 11 years
  { ageInMonths: 144, size: '152' },   // 12 years
];

// Function to calculate size based on age and offset
export function calculateSizeFromAge(birthDate: string, sizeOffset: number = 0): string {
  const birth = new Date(birthDate);
  const today = new Date();
  const ageInMonths = (today.getFullYear() - birth.getFullYear()) * 12 + 
                     (today.getMonth() - birth.getMonth());

  // Find the appropriate size for the age
  let baseSize = '56'; // Default to newborn
  
  for (let i = AGE_TO_SIZE_MAPPING.length - 1; i >= 0; i--) {
    if (ageInMonths >= AGE_TO_SIZE_MAPPING[i].ageInMonths) {
      baseSize = AGE_TO_SIZE_MAPPING[i].size;
      break;
    }
  }

  // Apply offset
  const baseSizeIndex = DANISH_SIZES.indexOf(baseSize);
  const targetIndex = Math.max(0, Math.min(DANISH_SIZES.length - 1, baseSizeIndex + sizeOffset));
  
  return DANISH_SIZES[targetIndex];
}

// Function to get current and next size for a child
export function getChildSizes(child: Child): { currentSize: string; nextSize: string | null } {
  const currentSize = calculateSizeFromAge(child.birthDate, child.sizeOffset);
  const currentSizeIndex = DANISH_SIZES.indexOf(currentSize);
  const nextSize = currentSizeIndex < DANISH_SIZES.length - 1 ? DANISH_SIZES[currentSizeIndex + 1] : null;
  
  return { currentSize, nextSize };
}

// Function to determine if child should use body or undertøj
export function shouldUseBodyOrUndertoj(child: Child, targetSize?: string): 'body' | 'undertøj' {
  const sizeToCheck = targetSize || calculateSizeFromAge(child.birthDate, child.sizeOffset);
  const bodySwitchIndex = DANISH_SIZES.indexOf(child.bodySwitchSize);
  const currentSizeIndex = DANISH_SIZES.indexOf(sizeToCheck);
  
  return currentSizeIndex < bodySwitchIndex ? 'body' : 'undertøj';
}

// Function to get available categories for a child based on their gender and age
export function getAvailableCategoriesForChild(child: Child, targetSize?: string): string[] {
  const baseCategories = ['sokker', 'trøjer', 'bukser', 'jakker', 'sko', 'tilbehør'];
  
  // Add body or undertøj based on age/size
  const bodyOrUndertoj = shouldUseBodyOrUndertoj(child, targetSize);
  baseCategories.push(bodyOrUndertoj);
  
  // Add kjoler only for girls
  if (child.gender === 'pige') {
    baseCategories.push('kjoler');
  }
  
  return baseCategories;
}

// Mock data
const mockUsers: User[] = [
  {
    id: 'user1',
    email: 'test@example.com',
    name: 'Test Bruger',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const mockChildren: Child[] = [
  {
    id: 'child1',
    name: 'Emma',
    birthDate: '2020-03-15',
    gender: 'pige',
    sizeOffset: 0,
    currentShoeSize: '18',
    bodySwitchSize: '104',
    userId: 'user1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'child2',
    name: 'Oliver',
    birthDate: '2018-08-22',
    gender: 'dreng',
    sizeOffset: 0,
    currentShoeSize: '20',
    bodySwitchSize: '104',
    userId: 'user1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

let mockClothingItems: ClothingItem[] = [
  {
    id: 'item1',
    comment: 'Blå striktrøje',
    category: 'trøjer',
    size: '104',
    gender: 'unisex',
    season: 'vinter',
    doNotDiscard: true, // Make this special
    userId: 'user1',
    childId: 'child1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item2',
    comment: 'Røde sokker',
    category: 'sokker',
    size: '104',
    season: 'helår',
    doNotDiscard: false,
    userId: 'user1',
    childId: 'child1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item3',
    comment: 'Vinterfrakke',
    category: 'jakker',
    size: '110',
    season: 'vinter',
    doNotDiscard: true,
    userId: 'user1',
    childId: 'child1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item4',
    comment: 'Grønne bukser',
    category: 'bukser',
    size: '104',
    season: 'helår',
    doNotDiscard: false,
    userId: 'user1',
    childId: 'child1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item5',
    comment: 'Hvide underbukser',
    category: 'undertøj',
    size: '104',
    season: 'helår',
    doNotDiscard: false,
    userId: 'user1',
    childId: 'child1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item6',
    comment: 'Blå undertøj',
    category: 'undertøj',
    size: '104',
    season: 'helår',
    doNotDiscard: true, // Make this special
    userId: 'user1',
    childId: 'child1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item7',
    comment: 'Rosa kjole',
    category: 'kjoler',
    size: '110',
    season: 'sommer',
    doNotDiscard: true,
    userId: 'user1',
    childId: 'child2', // Assign to Oliver
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item8',
    comment: 'Gul t-shirt',
    category: 'trøjer',
    size: '110',
    season: 'sommer',
    doNotDiscard: true, // Make this special
    userId: 'user1',
    childId: 'child2', // Assign to Oliver
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item9',
    comment: 'Uassigneret jakke',
    category: 'jakker',
    size: '116',
    season: 'vinter',
    doNotDiscard: true,
    userId: 'user1',
    childId: undefined, // Not assigned to any child
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Add some shoe items
  {
    id: 'shoe1',
    comment: 'Røde sneakers',
    category: 'sko',
    size: '18',
    season: 'helår',
    doNotDiscard: true,
    userId: 'user1',
    childId: 'child1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'shoe2',
    comment: 'Vinterstøvler',
    category: 'sko',
    size: '19',
    season: 'vinter',
    doNotDiscard: true,
    userId: 'user1',
    childId: 'child1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'shoe3',
    comment: 'Blå gymnasticsko',
    category: 'sko',
    size: '20',
    season: 'helår',
    doNotDiscard: true,
    userId: 'user1',
    childId: 'child2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'shoe4',
    comment: 'Sommersandaler',
    category: 'sko',
    size: '21',
    season: 'sommer',
    doNotDiscard: true,
    userId: 'user1',
    childId: 'child2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Add some body items for younger children
  {
    id: 'body1',
    comment: 'Hvid body',
    category: 'body',
    size: '80',
    season: 'helår',
    doNotDiscard: false,
    userId: 'user1',
    childId: 'child1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'body2',
    comment: 'Stribet body',
    category: 'body',
    size: '86',
    season: 'helår',
    doNotDiscard: true,
    userId: 'user1',
    childId: 'child1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

let mockRegularClothing: RegularClothing[] = [
  {
    id: 'regular1',
    category: 'sokker',
    size: '104',
    count: 5,
    userId: 'user1',
    childId: 'child1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'regular2',
    category: 'trøjer',
    size: '104',
    count: 3,
    userId: 'user1',
    childId: 'child1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'regular3',
    category: 'bukser',
    size: '110',
    count: 2,
    userId: 'user1',
    childId: 'child1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'regular4',
    category: 'sokker',
    size: '122',
    count: 8,
    userId: 'user1',
    childId: 'child2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'regular5',
    category: 'trøjer',
    size: '122',
    count: 4,
    userId: 'user1',
    childId: 'child2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'regular6',
    category: 'bukser',
    size: '128',
    count: 1,
    userId: 'user1',
    childId: 'child2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Add some shoe regular clothing
  {
    id: 'regular7',
    category: 'sko',
    size: '18',
    count: 2,
    userId: 'user1',
    childId: 'child1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'regular8',
    category: 'sko',
    size: '19',
    count: 1,
    userId: 'user1',
    childId: 'child1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'regular9',
    category: 'sko',
    size: '20',
    count: 3,
    userId: 'user1',
    childId: 'child2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'regular10',
    category: 'sko',
    size: '21',
    count: 2,
    userId: 'user1',
    childId: 'child2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Add some body regular clothing for younger children
  {
    id: 'regular11',
    category: 'body',
    size: '80',
    count: 6,
    userId: 'user1',
    childId: 'child1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'regular12',
    category: 'body',
    size: '86',
    count: 4,
    userId: 'user1',
    childId: 'child1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

// Current user simulation
let currentUser: User | null = mockUsers[0];

// API functions
export const api = {
  // Authentication
  async login(email: string, password: string): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = mockUsers.find(u => u.email === email);
    if (!user || password !== 'password') {
      throw new Error('Ugyldige loginoplysninger');
    }
    
    currentUser = user;
    return user;
  },

  async logout(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    currentUser = null;
  },

  async getCurrentUser(): Promise<User | null> {
    return currentUser;
  },

  // Children
  async getChildren(): Promise<Child[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockChildren.filter(child => child.userId === currentUser?.id);
  },

  async createChild(childData: Omit<Child, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Child> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newChild: Child = {
      ...childData,
      id: `child${Date.now()}`,
      userId: currentUser!.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockChildren.push(newChild);
    return newChild;
  },

  async updateChild(id: string, updates: Partial<Child>): Promise<Child> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const index = mockChildren.findIndex(child => child.id === id);
    if (index === -1) throw new Error('Barn ikke fundet');
    
    mockChildren[index] = {
      ...mockChildren[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    return mockChildren[index];
  },

  async deleteChild(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = mockChildren.findIndex(child => child.id === id);
    if (index === -1) throw new Error('Barn ikke fundet');
    
    // Delete all clothing items associated with this child
    mockClothingItems = mockClothingItems.filter(item => item.childId !== id);
    mockRegularClothing = mockRegularClothing.filter(item => item.childId !== id);
    
    // Remove the child
    mockChildren.splice(index, 1);
  },

  // Clothing items
  async getClothingItems(childId?: string): Promise<ClothingItem[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let items = mockClothingItems.filter(item => item.userId === currentUser?.id);
    if (childId) {
      items = items.filter(item => item.childId === childId);
    }
    
    return items;
  },

  async createClothingItem(itemData: Omit<ClothingItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<ClothingItem> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newItem: ClothingItem = {
      ...itemData,
      id: `item${Date.now()}`,
      userId: currentUser!.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockClothingItems.push(newItem);
    return newItem;
  },

  async updateClothingItem(id: string, updates: Partial<ClothingItem>): Promise<ClothingItem> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const index = mockClothingItems.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Tøj ikke fundet');
    
    mockClothingItems[index] = {
      ...mockClothingItems[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    return mockClothingItems[index];
  },

  async deleteClothingItem(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = mockClothingItems.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Tøj ikke fundet');
    
    mockClothingItems.splice(index, 1);
  },

  // Regular clothing functions
  async getRegularClothing(childId?: string): Promise<RegularClothing[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let items = mockRegularClothing.filter(item => item.userId === currentUser?.id);
    if (childId) {
      items = items.filter(item => item.childId === childId);
    }
    
    return items;
  },

  async updateRegularClothing(childId: string, category: string, size: string, count: number): Promise<RegularClothing> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const existingIndex = mockRegularClothing.findIndex(
      item => item.childId === childId && item.category === category && item.size === size && item.userId === currentUser?.id
    );
    
    if (existingIndex !== -1) {
      // Update existing
      if (count === 0) {
        // Remove if count is 0
        mockRegularClothing.splice(existingIndex, 1);
        return mockRegularClothing[existingIndex]; // This will be undefined, but that's okay
      } else {
        mockRegularClothing[existingIndex] = {
          ...mockRegularClothing[existingIndex],
          count,
          updatedAt: new Date().toISOString(),
        };
        return mockRegularClothing[existingIndex];
      }
    } else if (count > 0) {
      // Create new
      const newItem: RegularClothing = {
        id: `regular${Date.now()}`,
        category: category as RegularClothing['category'],
        size,
        count,
        userId: currentUser!.id,
        childId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      mockRegularClothing.push(newItem);
      return newItem;
    }
    
    // Should not reach here, but return a dummy item
    return {} as RegularClothing;
  },

  // File upload simulation
  async uploadImage(file: File): Promise<string> {
    console.log('Uploading file:', file.name);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In real implementation, this would upload to PocketBase storage
    // For now, return a mock URL
    return `https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=400&h=400&fit=crop`;
  }
};