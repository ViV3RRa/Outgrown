import { DANISH_SIZES, type ClothingItem } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { AlertTriangle, CheckCircle, Circle } from 'lucide-react';
import { categoryIcons } from './icons/index';

interface SizeTimelineProps {
  currentSize: string;
  clothingItems: ClothingItem[];
  onSizeClick?: (size: string) => void;
}

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

const categoryLabels = {
  sokker: 'Sokker',
  trøjer: 'Trøjer',
  bukser: 'Bukser',
  kjoler: 'Kjoler',
  jakker: 'Jakker',
  undertøj: 'Undertøj',
  sko: 'Sko',
  tilbehør: 'Tilbehør'
};

// Essential categories that most children need
const essentialCategories = ['trøjer', 'bukser', 'undertøj', 'sokker'];
const allCategories = Object.keys(categoryLabels);

export function SizeTimeline({ currentSize, clothingItems, onSizeClick }: SizeTimelineProps) {
  const currentIndex = DANISH_SIZES.indexOf(currentSize);
  const nextSize = currentIndex < DANISH_SIZES.length - 1 ? DANISH_SIZES[currentIndex + 1] : null;
  
  const getItemsForSize = (size: string) => {
    return clothingItems.filter(item => item.size === size);
  };

  const getCategoryCount = (size: string, category: string) => {
    return clothingItems.filter(item => item.size === size && item.category === category).length;
  };

  // const getCategoryStatus = (size: string, category: string) => {
  //   const count = getCategoryCount(size, category);
  //   if (count === 0) return 'missing';
  //   if (count >= 2) return 'good'; // 2 or more items is considered good
  //   return 'low'; // 1 item is low but not missing
  // };

  const getSizeOverview = (size: string) => {
    const items = getItemsForSize(size);
    const missingEssential = essentialCategories.filter(cat => 
      getCategoryCount(size, cat) === 0
    ).length;
    const lowEssential = essentialCategories.filter(cat => {
      const count = getCategoryCount(size, cat);
      return count === 1;
    }).length;

    return {
      totalItems: items.length,
      missingEssential,
      lowEssential
    };
  };

  const renderSizeCard = (size: string, title: string, isCurrent: boolean) => {
    const overview = getSizeOverview(size);
    
    return (
      <Card 
        key={size} 
        className={`${isCurrent ? 'border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10' : 'border-border bg-gradient-to-br from-card to-secondary/20'} cursor-pointer hover:shadow-lg transition-all duration-200`}
        onClick={() => onSizeClick?.(size)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Badge variant={isCurrent ? 'default' : 'secondary'} className={isCurrent ? 'bg-primary text-primary-foreground' : ''}>
                Str. {size}
              </Badge>
              {title && <span className="text-sm text-muted-foreground font-medium">{title}</span>}
            </CardTitle>
            <div className="text-right">
              <div className={`text-lg font-bold ${isCurrent ? 'text-primary' : 'text-foreground'}`}>{overview.totalItems}</div>
              <div className="text-xs text-muted-foreground">stykker</div>
            </div>
          </div>
          
          {/* Completion indicator */}
          <div className="flex items-center gap-2">
            {overview.missingEssential > 0 ? (
              <>
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <span className="text-sm text-destructive font-medium">
                  Mangler {overview.missingEssential} vigtige kategorier
                </span>
              </>
            ) : overview.lowEssential > 0 ? (
              <>
                <Circle className="w-4 h-4 text-amber-500" />
                <span className="text-sm text-amber-600 font-medium">
                  {overview.lowEssential} kategorier har få stykker
                </span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className="text-sm text-emerald-600 font-medium">
                  Vigtige kategorier dækket
                </span>
              </>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {/* All categories with counts */}
          <div className="grid grid-cols-2 gap-2">
            {allCategories.map(category => {
              const count = getCategoryCount(size, category);
              const isEssential = essentialCategories.includes(category);
              const isEmpty = count === 0;
              
              return (
                <div
                  key={category}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all hover:shadow-sm ${
                    isEmpty && isEssential
                      ? 'border-destructive/30 bg-gradient-to-r from-red-50 to-red-100'
                      : isEmpty
                      ? 'border-muted bg-gradient-to-r from-slate-50 to-slate-100'
                      : count === 1 && isEssential
                      ? 'border-amber-300 bg-gradient-to-r from-amber-50 to-orange-100'
                      : 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {(() => {
                      const IconComponent = categoryIcons[category as keyof typeof categoryIcons];
                      return (
                        <IconComponent
                          className="w-4 h-4 flex-shrink-0"
                          color={categoryColors[category as keyof typeof categoryColors]}
                        />
                      );
                    })()}
                    <span className={`text-sm font-medium ${isEmpty ? 'text-muted-foreground' : 'text-foreground'}`}>
                      {categoryLabels[category as keyof typeof categoryLabels]}
                    </span>
                  </div>
                  <div className={`text-sm font-bold px-2 py-1 rounded-full ${
                    isEmpty && isEssential 
                      ? 'text-destructive bg-red-200' 
                      : isEmpty
                      ? 'text-muted-foreground bg-slate-200'
                      : count === 1 && isEssential 
                      ? 'text-amber-700 bg-amber-200' 
                      : 'text-emerald-700 bg-emerald-200'
                  }`}>
                    {isEmpty ? '-' : count}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3>Størrelsesoverview</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Fokus på nuværende og næste størrelse
        </p>
      </div>

      <div className="space-y-4">
        {/* Current size */}
        {renderSizeCard(currentSize, "Nuværende størrelse", true)}
        
        {/* Next size */}
        {nextSize && renderSizeCard(nextSize, "Næste størrelse", false)}
      </div>

      {/* Quick overview of upcoming sizes */}
      {currentIndex < DANISH_SIZES.length - 3 && (
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="text-base">Kommende størrelser</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {DANISH_SIZES.slice(currentIndex + 2, currentIndex + 5).map((size) => {
                const items = getItemsForSize(size);
                const missingEssential = essentialCategories.filter(cat => 
                  getCategoryCount(size, cat) === 0
                ).length;
                
                return (
                  <div key={size} className="flex justify-between items-center py-2 px-3 bg-card rounded-md border">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">Str. {size}</Badge>
                      {missingEssential > 0 && (
                        <span className="text-xs text-muted-foreground">
                          Mangler {missingEssential} vigtige
                        </span>
                      )}
                    </div>
                    <div className="text-sm">
                      {items.length} stk.
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Card className="bg-muted/20">
        <CardHeader>
          <CardTitle className="text-base">Forklaring</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Vigtige kategorier er dækket (2+ stykker)</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="w-4 h-4 text-orange-500" />
              <span>Få stykker i vigtige kategorier (1 stykke)</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span>Mangler tøj i vigtige kategorier</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-muted rounded-full" />
              <span>'-' betyder ingen tøjstykker i kategorien</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}