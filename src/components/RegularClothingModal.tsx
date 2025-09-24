import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Plus, Minus, X } from 'lucide-react';
import { categoryIcons } from './icons/index';

interface RegularClothingModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  size: string;
  currentCount: number;
  onUpdateCount: (category: string, size: string, count: number) => void;
}

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

export function RegularClothingModal({ 
  isOpen, 
  onClose, 
  category, 
  size, 
  currentCount, 
  onUpdateCount 
}: RegularClothingModalProps) {
  const [count, setCount] = useState(currentCount);

  if (!isOpen) return null;

  const handleIncrement = () => {
    const newCount = count + 1;
    setCount(newCount);
    onUpdateCount(category, size, newCount);
  };

  const handleDecrement = () => {
    if (count > 0) {
      const newCount = count - 1;
      setCount(newCount);
      onUpdateCount(category, size, newCount);
    }
  };

  const IconComponent = categoryIcons[category as keyof typeof categoryIcons];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
      <div className="w-full bg-card rounded-t-xl animate-in slide-in-from-bottom-32 duration-300">
        <Card className="border-0 shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <IconComponent
                  className="w-6 h-6 flex-shrink-0"
                  color={categoryColors[category as keyof typeof categoryColors]}
                />
                <div>
                  <div className="text-lg">
                    {categoryLabels[category as keyof typeof categoryLabels]}
                  </div>
                  <Badge variant="secondary" className="mt-1">
                    Str. {size}
                  </Badge>
                </div>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pb-6">
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-2">
                Antal stykker almindeligt tøj
              </div>
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleDecrement}
                  disabled={count === 0}
                  className="h-12 w-12 rounded-full p-0"
                >
                  <Minus className="h-5 w-5" />
                </Button>
                
                <div className="w-20 text-center">
                  <div className="text-3xl font-bold text-primary">
                    {count}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    stykker
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleIncrement}
                  className="h-12 w-12 rounded-full p-0"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>Dette er almindeligt tøj som ikke bliver registreret med detaljer.</p>
              <p>Kun tøj der <strong>ikke må kasseres</strong> oprettes som separate elementer.</p>
            </div>

            <Button 
              onClick={onClose}
              className="w-full"
              size="lg"
            >
              Færdig
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}