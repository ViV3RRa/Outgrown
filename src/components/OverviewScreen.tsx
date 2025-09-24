import { useState, useEffect } from 'react';
import { DANISH_SIZES, DANISH_SHOE_SIZES, api, getChildSizes, getAvailableCategoriesForChild, type Child, type ClothingItem, type RegularClothing } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { RotateCcw } from 'lucide-react';
import { categoryIcons } from './icons/index';
import { RegularClothingModal } from './RegularClothingModal';
import { ChildSelector } from './ChildSelector';
import { toast } from 'sonner';

interface OverviewScreenProps {
  children: Child[];
  allClothingItems: ClothingItem[];
}

const categoryLabels = {
  sokker: 'Sokker',
  trøjer: 'Trøjer',
  bukser: 'Bukser',
  kjoler: 'Kjoler',
  jakker: 'Jakker',
  undertøj: 'Undertøj',
  body: 'Body',
  sko: 'Sko',
  tilbehør: 'Tilbehør'
};

export function OverviewScreen({ children, allClothingItems }: OverviewScreenProps) {
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([]);
  const [regularClothing, setRegularClothing] = useState<RegularClothing[]>([]);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    category: string;
    size: string;
  }>({ isOpen: false, category: '', size: '' });
  
  // State for managing the selected next size
  const [selectedNextSize, setSelectedNextSize] = useState<string | null>(null);
  const [isSizeDialogOpen, setIsSizeDialogOpen] = useState(false);
  
  // State for managing the selected next shoe size
  const [selectedNextShoeSize, setSelectedNextShoeSize] = useState<string | null>(null);
  const [isShoeSizeDialogOpen, setIsShoeSizeDialogOpen] = useState(false);

  // Set initial selected child
  useEffect(() => {
    if (children.length > 0 && !selectedChild) {
      setSelectedChild(children[0]);
    }
  }, [children]);

  // Update clothing items when selected child changes
  useEffect(() => {
    if (selectedChild) {
      const childItems = allClothingItems.filter(item => item.childId === selectedChild.id);
      setClothingItems(childItems);
      loadRegularClothing();
    }
  }, [selectedChild, allClothingItems]);

  const handleChildSelect = (child: Child) => {
    setSelectedChild(child);
    // Reset size selections when changing child
    setSelectedNextSize(null);
    setSelectedNextShoeSize(null);
  };

  // Calculate size information based on selected child
  const childSizes = selectedChild ? getChildSizes(selectedChild) : { currentSize: '', nextSize: null };
  const { currentSize, nextSize } = childSizes;
  
  const currentShoeSizeIndex = selectedChild ? DANISH_SHOE_SIZES.indexOf(selectedChild.currentShoeSize) : -1;
  const nextShoeSize = currentShoeSizeIndex < DANISH_SHOE_SIZES.length - 1 ? DANISH_SHOE_SIZES[currentShoeSizeIndex + 1] : null;
  
  // Get the actual size to display (either next size or selected alternative)
  const displayedNextSize = selectedNextSize || nextSize;
  const displayedNextShoeSize = selectedNextShoeSize || nextShoeSize;
  
  // Check if an alternative size is selected
  const isAlternativeSizeSelected = selectedNextSize && selectedNextSize !== nextSize;
  const isAlternativeShoeSizeSelected = selectedNextShoeSize && selectedNextShoeSize !== nextShoeSize;

  const loadRegularClothing = async () => {
    if (!selectedChild) return;
    
    try {
      const items = await api.getRegularClothing(selectedChild.id);
      setRegularClothing(items);
    } catch (error) {
      console.error('Failed to load regular clothing:', error);
    }
  };
  
  // Get available sizes for selection (excluding current size)
  const getAvailableSizes = () => {
    if (!selectedChild) return [];
    return DANISH_SIZES.filter(size => size !== currentSize);
  };

  // Get available shoe sizes for selection (excluding current shoe size)
  const getAvailableShoeSizes = () => {
    if (!selectedChild) return [];
    return DANISH_SHOE_SIZES.filter(size => size !== selectedChild.currentShoeSize);
  };

  // Handle size selection
  const handleSizeSelect = (size: string) => {
    setSelectedNextSize(size);
    setIsSizeDialogOpen(false);
    toast.success(`Størrelse ændret til ${size}`);
  };

  // Handle shoe size selection
  const handleShoeSizeSelect = (size: string) => {
    setSelectedNextShoeSize(size);
    setIsShoeSizeDialogOpen(false);
    toast.success(`Skostørrelse ændret til ${size}`);
  };

  // Reset to next size
  const handleResetSize = () => {
    setSelectedNextSize(null);
    toast.success('Tilbage til næste størrelse');
  };

  // Reset to next shoe size
  const handleResetShoeSize = () => {
    setSelectedNextShoeSize(null);
    toast.success('Tilbage til næste skostørrelse');
  };
  
  // const getItemsForSize = (size: string) => {
  //   return clothingItems.filter(item => item.size === size);
  // };

  const getSpecialCategoryCount = (size: string, category: string) => {
    return clothingItems.filter(item => 
      item.size === size && 
      item.category === category && 
      item.doNotDiscard
    ).length;
  };

  const getRegularCategoryCount = (size: string, category: string) => {
    const regularItem = regularClothing.find(item => 
      item.size === size && item.category === category
    );
    return regularItem ? regularItem.count : 0;
  };

  const getTotalCategoryCount = (size: string, category: string) => {
    return getSpecialCategoryCount(size, category) + getRegularCategoryCount(size, category);
  };

  const handleCategoryClick = (category: string, size: string) => {
    setModalState({
      isOpen: true,
      category,
      size
    });
  };

  const handleUpdateRegularClothing = async (category: string, size: string, count: number) => {
    if (!selectedChild) return;
    
    try {
      await api.updateRegularClothing(selectedChild.id, category, size, count);
      await loadRegularClothing();
      toast.success('Antal opdateret');
    } catch (error) {
      console.error('Failed to update regular clothing:', error);
      toast.error('Kunne ikke opdatere antal');
    }
  };

  const closeModal = () => {
    setModalState({ isOpen: false, category: '', size: '' });
  };

  const renderSizeBreakdown = (size: string, title: string, isPrimary: boolean = false) => {
    if (!selectedChild) return null;
    
    // const items = getItemsForSize(size);
    const isNextSizeSection = title === "Næste størrelse";
    
    // Determine corresponding shoe size
    let correspondingShoeSize: string | null = null;
    let isNextShoeSizeSection = false;
    
    if (title === "Nuværende størrelse") {
      correspondingShoeSize = selectedChild.currentShoeSize;
    } else if (title === "Næste størrelse") {
      correspondingShoeSize = displayedNextShoeSize;
      isNextShoeSizeSection = true;
    }
    
    return (
      <Card className={isPrimary ? 'border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10' : 'border-border bg-gradient-to-br from-card to-secondary/20'}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              {isNextSizeSection ? (
                <button
                  onClick={() => setIsSizeDialogOpen(true)}
                  className="transition-all hover:scale-105"
                >
                  <Badge 
                    variant={isPrimary ? 'default' : 'secondary'} 
                    className={`cursor-pointer ${isPrimary ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'hover:bg-secondary/80'}`}
                  >
                    Str. {size}
                  </Badge>
                </button>
              ) : (
                <Badge variant={isPrimary ? 'default' : 'secondary'} className={isPrimary ? 'bg-primary text-primary-foreground' : ''}>
                  Str. {size}
                </Badge>
              )}
              
              {/* Shoe size badge */}
              {correspondingShoeSize && (
                <>
                  <span className="text-xs text-muted-foreground">•</span>
                  {isNextShoeSizeSection ? (
                    <button
                      onClick={() => setIsShoeSizeDialogOpen(true)}
                      className="transition-all hover:scale-105"
                    >
                      <Badge 
                        variant="outline"
                        className="cursor-pointer hover:bg-secondary/80"
                      >
                        Sko {correspondingShoeSize}
                      </Badge>
                    </button>
                  ) : (
                    <Badge variant="outline">
                      Sko {correspondingShoeSize}
                    </Badge>
                  )}
                </>
              )}
              
              <span className="text-sm text-muted-foreground">{title}</span>
              
              {isAlternativeSizeSelected && isNextSizeSection && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs bg-warning/10 text-warning-foreground border-warning/30">
                    Ændret
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetSize}
                    className="h-6 w-6 p-0 hover:bg-secondary"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              {isAlternativeShoeSizeSelected && isNextShoeSizeSection && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs bg-warning/10 text-warning-foreground border-warning/30">
                    Sko ændret
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetShoeSize}
                    className="h-6 w-6 p-0 hover:bg-secondary"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {getAvailableCategoriesForChild(selectedChild, size).map(category => {
              const totalCount = getTotalCategoryCount(size, category);
              const specialCount = getSpecialCategoryCount(size, category);
              
              // For shoes, also include the corresponding shoe size counts
              let displayCount = totalCount;
              let displaySpecialCount = specialCount;
              
              if (category === 'sko' && correspondingShoeSize) {
                const shoeTotalCount = getTotalCategoryCount(correspondingShoeSize, 'sko');
                const shoeSpecialCount = getSpecialCategoryCount(correspondingShoeSize, 'sko');
                displayCount = shoeTotalCount;
                displaySpecialCount = shoeSpecialCount;
              }
              
              return (
                <div
                  key={category}
                  className="flex items-center justify-between p-3 rounded-lg border transition-all hover:shadow-sm cursor-pointer hover:bg-secondary/50"
                  onClick={() => handleCategoryClick(category, category === 'sko' && correspondingShoeSize ? correspondingShoeSize : size)}
                >
                  <div className="flex items-center gap-3">
                    {(() => {
                      const IconComponent = categoryIcons[category as keyof typeof categoryIcons];
                      return IconComponent ? (
                        <IconComponent
                          className="w-4 h-4 flex-shrink-0"
                          color="#0ea5e9"
                        />
                      ) : (
                        <div className="w-4 h-4 flex-shrink-0 bg-muted rounded" />
                      );
                    })()}
                    <span className="text-sm font-medium">
                      {categoryLabels[category as keyof typeof categoryLabels]}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-primary">
                      {displayCount}
                    </div>
                    {displaySpecialCount > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {displaySpecialCount} særligt
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  // const totalItems = clothingItems.length;
  // const specialItems = clothingItems.filter(item => item.doNotDiscard).length;
  
  // const calculateAge = (birthDate: string) => {
  //   const birth = new Date(birthDate);
  //   const today = new Date();
  //   const ageInMonths = (today.getFullYear() - birth.getFullYear()) * 12 + 
  //                      (today.getMonth() - birth.getMonth());
    
  //   if (ageInMonths < 12) {
  //     return `${ageInMonths} måneder`;
  //   } else {
  //     const years = Math.floor(ageInMonths / 12);
  //     const months = ageInMonths % 12;
  //     return months > 0 ? `${years} år, ${months} måneder` : `${years} år`;
  //   }
  // };

  // If no child is selected, show a message
  if (!selectedChild) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Vælg et barn for at se oversigten</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Child selector */}
      <ChildSelector
        children={children}
        onChildSelect={handleChildSelect}
        selectedChild={selectedChild}
      />

      {/* Current size breakdown */}
      {renderSizeBreakdown(currentSize, "Nuværende størrelse", true)}
      
      {/* Next size breakdown */}
      {displayedNextSize && renderSizeBreakdown(displayedNextSize, "Næste størrelse")}

      {/* Modal for updating regular clothing */}
      <RegularClothingModal
        isOpen={modalState.isOpen}
        category={modalState.category}
        size={modalState.size}
        currentCount={getRegularCategoryCount(modalState.size, modalState.category)}
        onUpdateCount={handleUpdateRegularClothing}
        onClose={closeModal}
      />

      {/* Dialog for selecting alternative size */}
      <Dialog open={isSizeDialogOpen} onOpenChange={setIsSizeDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Vælg størrelse at vise</DialogTitle>
            <DialogDescription>
              Vælg hvilken størrelse du vil se detaljer for. Du kan til enhver tid skifte tilbage til næste størrelse.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
              {getAvailableSizes().map(size => {
                const isNextSize = size === nextSize;
                const isSelected = size === displayedNextSize;
                
                return (
                  <Button
                    key={size}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className={`relative ${isNextSize ? 'border-primary/50' : ''}`}
                    onClick={() => handleSizeSelect(size)}
                  >
                    <div className="text-center">
                      <div>Str. {size}</div>
                      {isNextSize && (
                        <div className="text-xs opacity-75">Næste</div>
                      )}
                    </div>
                  </Button>
                );
              })}
            </div>
            
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsSizeDialogOpen(false)}>
                Annuller
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog for selecting alternative shoe size */}
      <Dialog open={isShoeSizeDialogOpen} onOpenChange={setIsShoeSizeDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Vælg skostørrelse at vise</DialogTitle>
            <DialogDescription>
              Vælg hvilken skostørrelse du vil se detaljer for. Du kan til enhver tid skifte tilbage til næste skostørrelse.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
              {getAvailableShoeSizes().map(size => {
                const isNextSize = size === nextShoeSize;
                const isSelected = size === displayedNextShoeSize;
                
                return (
                  <Button
                    key={size}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className={`relative ${isNextSize ? 'border-primary/50' : ''}`}
                    onClick={() => handleShoeSizeSelect(size)}
                  >
                    <div className="text-center">
                      <div>Str. {size}</div>
                      {isNextSize && (
                        <div className="text-xs opacity-75">Næste</div>
                      )}
                    </div>
                  </Button>
                );
              })}
            </div>
            
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsShoeSizeDialogOpen(false)}>
                Annuller
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}