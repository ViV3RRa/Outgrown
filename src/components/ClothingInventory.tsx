import { useState } from 'react';
import type { ClothingItem, Child } from '../services/api';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Heart, Filter, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { categoryIcons } from './icons/index';
import { AddClothingForm } from './AddClothingForm';
import { ClothingDetailView } from './ClothingDetailView';

interface ClothingInventoryProps {
  items: ClothingItem[];
  onDeleteItem: (id: string) => void;
  children: Child[];
  onAddClothing: (item: ClothingItem) => void;
  onUpdateClothing: (item: ClothingItem) => void;
}

const categoryLabels = {
  sokker: 'Sokker',
  trøjer: 'Trøjer',
  bukser: 'Bukser',
  kjoler: 'Kjoler',
  jakker: 'Jakker',
  undertøj: 'Undertøj',
  sko: 'Sko',
  body: "Body",
  tilbehør: 'Tilbehør'
};

const seasonLabels = {
  forår: 'Forår',
  sommer: 'Sommer',
  efterår: 'Efterår',
  vinter: 'Vinter',
  helår: 'Helår'
};

const categoryColors = {
  sokker: '#8b5cf6',
  trøjer: '#06b6d4',
  bukser: '#10b981',
  kjoler: '#f59e0b',
  jakker: '#ef4444',
  undertøj: '#ec4899',
  sko: '#84cc16',
  tilbehør: '#6366f1'
};

export function ClothingInventory({ items, onDeleteItem, children, onAddClothing, onUpdateClothing }: ClothingInventoryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('alle');
  const [selectedSeason, setSelectedSeason] = useState<string>('alle');
  const [selectedSize, setSelectedSize] = useState<string>('alle');
  const [selectedChild, setSelectedChild] = useState<string>('alle');
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);

  // Only show items that must not be discarded (special items)
  const specialItems = items.filter(item => item.doNotDiscard);

  const filteredItems = specialItems.filter(item => {
    if (selectedCategory !== 'alle' && item.category !== selectedCategory) return false;
    if (selectedSeason !== 'alle' && item.season !== selectedSeason) return false;
    if (selectedSize !== 'alle' && item.size !== selectedSize) return false;
    if (selectedChild !== 'alle' && item.childId !== selectedChild) return false;
    return true;
  });

  const uniqueSizes = [...new Set(specialItems.map(item => item.size))].sort((a, b) => 
    parseInt(a) - parseInt(b)
  );

  const handleAddClothing = (item: ClothingItem) => {
    onAddClothing(item);
    setIsAddSheetOpen(false);
  };

  const handleDetailView = (item: ClothingItem) => {
    setSelectedItem(item);
    setIsDetailViewOpen(true);
  };

  return (
    <div className="space-y-4 relative">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filtre:</span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-6">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="text-xs">
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alle">Alle kategorier</SelectItem>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedSeason} onValueChange={setSelectedSeason}>
          <SelectTrigger className="text-xs">
            <SelectValue placeholder="Sæson" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alle">Alle sæsoner</SelectItem>
            {Object.entries(seasonLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedSize} onValueChange={setSelectedSize}>
          <SelectTrigger className="text-xs">
            <SelectValue placeholder="Størrelse" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alle">Alle størrelser</SelectItem>
            {uniqueSizes.map((size) => (
              <SelectItem key={size} value={size}>Str. {size}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedChild} onValueChange={setSelectedChild}>
          <SelectTrigger className="text-xs">
            <SelectValue placeholder="Barn" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alle">Alle børn</SelectItem>
            {children.map((child) => (
              <SelectItem key={child.id} value={child.id}>{child.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="text-sm text-muted-foreground mb-4">
        Viser {filteredItems.length} af {specialItems.length} særlige tøjstykker
      </div>

      <div className="grid grid-cols-2 gap-3">
        {filteredItems.map((item) => (
          <Card 
            key={item.id} 
            className="overflow-hidden hover:shadow-lg transition-all duration-200 border-primary/10 cursor-pointer"
            onClick={() => handleDetailView(item)}
          >
            <div className="aspect-square relative">
              {item.imageUrl ? (
                <ImageWithFallback
                  src={item.imageUrl}
                  alt={item.comment || 'Tøjstykke'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/20 flex items-center justify-center">
                  <span className="text-4xl">👕</span>
                </div>
              )}
              
              <div className="absolute top-2 right-2 bg-white/90 rounded-full p-1">
                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              </div>
            </div>
            
            <CardContent className="p-3">
              <h4 className="font-medium text-sm mb-2 line-clamp-2">
                {item.comment || `${categoryLabels[item.category]} - Str. ${item.size}`}
              </h4>
              
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                  Str. {item.size}
                </Badge>
                <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-700 flex items-center gap-1">
                  {(() => {
                    const IconComponent = categoryIcons[item.category as keyof typeof categoryIcons];
                    return (
                      <IconComponent
                        className="w-3 h-3"
                        color={categoryColors[item.category as keyof typeof categoryColors]}
                      />
                    );
                  })()}
                  {categoryLabels[item.category]}
                </Badge>
                <Badge variant="outline" className="text-xs border-amber-200 text-amber-700">
                  {seasonLabels[item.season]}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-2">Intet særligt tøj fundet</p>
          <p className="text-sm text-muted-foreground">
            Særligt tøj er tøj der ikke må kasseres. Tilføj nyt tøj og marker det som "Må ikke kasseres"
          </p>
        </div>
      )}

      {/* Floating Action Button */}
      <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
        <SheetTrigger asChild>
          <Button
            className="fixed bottom-24 right-6 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90 z-50"
            size="icon"
            aria-label="Tilføj nyt særligt tøj"
          >
            <Plus className="w-6 h-6 text-primary-foreground" />
          </Button>
        </SheetTrigger>
        <SheetContent 
          side="bottom" 
          className="h-[95vh] rounded-t-2xl p-0 border-t-0 bg-gradient-to-b from-background via-background/98 to-background/95 backdrop-blur-sm [&>button]:hidden"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Tilføj særligt tøj</SheetTitle>
            <SheetDescription>
              Udfyld formularen for at tilføje nyt særligt tøj til garderoben
            </SheetDescription>
          </SheetHeader>
          <AddClothingForm
            children={children}
            onSuccess={handleAddClothing}
            onCancel={() => setIsAddSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Detail View */}
      <Sheet open={isDetailViewOpen} onOpenChange={setIsDetailViewOpen}>
        <SheetContent 
          side="bottom" 
          className="h-[95vh] rounded-t-2xl p-0 border-t-0 bg-gradient-to-b from-background via-background/98 to-background/95 backdrop-blur-sm [&>button]:hidden"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Detaljer</SheetTitle>
            <SheetDescription>
              Se detaljer om det valgte tøj
            </SheetDescription>
          </SheetHeader>
          {selectedItem && (
            <ClothingDetailView
              item={selectedItem}
              children={children}
              onClose={() => setIsDetailViewOpen(false)}
              onUpdate={onUpdateClothing}
              onDelete={onDeleteItem}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}