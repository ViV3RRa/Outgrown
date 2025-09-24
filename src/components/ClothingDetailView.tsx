import { useState } from 'react';
import { api, DANISH_SIZES,getChildSizes, type Child, type ClothingItem } from '../services/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { X, Edit2, Trash2, Heart, ChevronLeft, ChevronRight, Save, XCircle, Baby } from 'lucide-react';
import { categoryIcons } from './icons/map';

interface ClothingDetailViewProps {
  item: ClothingItem;
  children: Child[];
  onClose: () => void;
  onUpdate: (item: ClothingItem) => void;
  onDelete: (id: string) => void;
}

const categories = [
  { value: 'sokker', label: 'Sokker' },
  { value: 'trøjer', label: 'Trøjer' },
  { value: 'bukser', label: 'Bukser' },
  { value: 'kjoler', label: 'Kjoler' },
  { value: 'jakker', label: 'Jakker' },
  { value: 'undertøj', label: 'Undertøj' },
  { value: 'body', label: 'Body' },
  { value: 'sko', label: 'Sko' },
  { value: 'tilbehør', label: 'Tilbehør' }
];

const seasons = [
  { value: 'forår', label: 'Forår' },
  { value: 'sommer', label: 'Sommer' },
  { value: 'efterår', label: 'Efterår' },
  { value: 'vinter', label: 'Vinter' },
  { value: 'helår', label: 'Helår' }
];

const genders = [
  { value: 'dreng', label: 'Dreng' },
  { value: 'pige', label: 'Pige' },
  { value: 'unisex', label: 'Unisex' }
];

const categoryColors = {
  sokker: '#8b5cf6',
  trøjer: '#06b6d4',
  bukser: '#10b981',
  kjoler: '#f59e0b',
  jakker: '#ef4444',
  undertøj: '#ec4899',
  body: '#f97316',
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
  body: 'Body',
  sko: 'Sko',
  tilbehør: 'Tilbehør'
};

const seasonLabels = {
  forår: 'Forår',
  sommer: 'Sommer',
  efterår: 'Efterår',
  vinter: 'Vinter',
  helår: 'Helår'
};

export function ClothingDetailView({ item, children, onClose, onUpdate, onDelete }: ClothingDetailViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [editData, setEditData] = useState({
    comment: item.comment || '',
    category: item.category,
    size: item.size,
    gender: item.gender || 'unisex',
    season: item.season,
    doNotDiscard: item.doNotDiscard,
    childId: item.childId || ''
  });

  // Get all available images
  const allImages = item.imageUrls && item.imageUrls.length > 0 
    ? item.imageUrls 
    : item.imageUrl 
    ? [item.imageUrl] 
    : [];

  const handleSave = async () => {
    if (!editData.category || !editData.size) {
      setError('Kategori og størrelse er påkrævet');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const updatedItem = await api.updateClothingItem(item.id, editData);
      onUpdate(updatedItem);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fejl ved opdatering af tøj');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Er du sikker på at du vil slette dette tøjstykke?')) {
      onDelete(item.id);
      onClose();
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const IconComponent = categoryIcons[item.category as keyof typeof categoryIcons];

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-6 border-b border-border/30 bg-gradient-to-r from-primary/5 via-accent/10 to-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/30 flex items-center justify-center shadow-lg">
              {IconComponent ? (
                <IconComponent className="w-6 h-6 text-primary" />
              ) : (
                <span className="w-6 h-6 inline-flex items-center justify-center text-primary">?</span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {categoryLabels[item.category]} - Str. {item.size}
              </h2>
              <p className="text-sm text-muted-foreground">Særligt tøjstykke</p>
            </div>
          </div>
          <div className="flex gap-2">
            {!isEditing && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsEditing(true)}
                className="h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground hover:bg-background/80"
              >
                <Edit2 className="w-5 h-5" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground hover:bg-background/80"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-6">
          {/* Images Section */}
          {allImages.length > 0 && (
            <div className="space-y-4">
              <Label className="text-base font-medium text-foreground">Billeder</Label>
              
              <div className="relative">
                <div className="aspect-square w-full rounded-2xl overflow-hidden bg-gradient-to-br from-primary/5 to-accent/20 border-2 border-primary/20 shadow-lg">
                  <ImageWithFallback
                    src={allImages[currentImageIndex]}
                    alt={`Billede ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {allImages.length > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-background/90 border-border/50 hover:bg-background shadow-lg"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-background/90 border-border/50 hover:bg-background shadow-lg"
                      onClick={nextImage}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                    <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 px-3 py-1.5 bg-background/90 text-foreground text-xs font-medium rounded-lg shadow-lg">
                      {currentImageIndex + 1} af {allImages.length}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Details Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-accent/30 flex items-center justify-center">
                <div className="w-1.5 h-4 bg-primary rounded-full"></div>
              </div>
              <Label className="text-base font-medium text-foreground">Oplysninger</Label>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-comment" className="text-sm font-medium text-foreground">
                    Kommentar
                  </Label>
                  <Input
                    id="edit-comment"
                    value={editData.comment}
                    onChange={(e) => setEditData({ ...editData, comment: e.target.value })}
                    placeholder="F.eks. 'Blå striktrøje'"
                    className="h-12 text-base bg-input-background border-border/50 focus:border-primary/50 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="edit-category" className="text-sm font-medium text-foreground">
                      Kategori <span className="text-primary">*</span>
                    </Label>
                    <Select 
                      value={editData.category} 
                      onValueChange={(value: "sokker" | "trøjer" | "bukser" | "kjoler" | "jakker" | "undertøj" | "body" | "sko" | "tilbehør") => setEditData({ ...editData, category: value })}
                    >
                      <SelectTrigger className="h-12 bg-input-background border-border/50 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => {
                          const IconComponent = categoryIcons[cat.value as keyof typeof categoryIcons];
                          return (
                            <SelectItem key={cat.value} value={cat.value}>
                              <div className="flex items-center gap-2">
                                <IconComponent
                                  className="w-4 h-4"
                                  color={categoryColors[cat.value as keyof typeof categoryColors]}
                                />
                                {cat.label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-size" className="text-sm font-medium text-foreground">
                      Størrelse <span className="text-primary">*</span>
                    </Label>
                    <Select 
                      value={editData.size} 
                      onValueChange={(value: string) => setEditData({ ...editData, size: value })}
                    >
                      <SelectTrigger className="h-12 bg-input-background border-border/50 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DANISH_SIZES.map((size) => (
                          <SelectItem key={size} value={size}>
                            Str. {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="edit-gender" className="text-sm font-medium text-foreground">Køn</Label>
                    <Select 
                      value={editData.gender} 
                      onValueChange={(value: "dreng" | "pige" | "unisex") => setEditData({ ...editData, gender: value })}
                    >
                      <SelectTrigger className="h-12 bg-input-background border-border/50 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {genders.map((gender) => (
                          <SelectItem key={gender.value} value={gender.value}>
                            {gender.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-season" className="text-sm font-medium text-foreground">Sæson</Label>
                    <Select 
                      value={editData.season} 
                      onValueChange={(value: "forår" | "sommer" | "efterår" | "vinter" | "helår") => setEditData({ ...editData, season: value })}
                    >
                      <SelectTrigger className="h-12 bg-input-background border-border/50 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {seasons.map((season) => (
                          <SelectItem key={season.value} value={season.value}>
                            {season.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Child Assignment */}
                <div className="space-y-2">
                  <Label htmlFor="edit-child" className="text-sm font-medium text-foreground">Tildel til barn</Label>
                  <Select 
                    value={editData.childId || "unassigned"} 
                    onValueChange={(value: string) => setEditData({ ...editData, childId: value === "unassigned" ? "" : value })}
                  >
                    <SelectTrigger className="h-12 bg-input-background border-border/50 rounded-xl">
                      <SelectValue placeholder="Vælg barn (valgfrit)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">
                        <div className="flex items-center gap-2">
                          <X className="w-4 h-4 text-muted-foreground" />
                          Ikke tildelt til noget barn
                        </div>
                      </SelectItem>
                      {children.map((child) => {
                        const { currentSize } = getChildSizes(child);
                        return (
                          <SelectItem key={child.id} value={child.id}>
                            <div className="flex items-center gap-2">
                              <Baby className="w-4 h-4 text-primary" />
                              {child.name} (Str. {currentSize})
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Special Toggle */}
                <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200/50 dark:from-red-950/20 dark:to-pink-950/20 dark:border-red-800/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                          <Heart className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">Særligt tøj</p>
                          <p className="text-xs text-muted-foreground">Må ikke kasseres</p>
                        </div>
                      </div>
                      <Switch
                        id="edit-doNotDiscard"
                        checked={editData.doNotDiscard}
                        onCheckedChange={(checked: boolean) => setEditData({ ...editData, doNotDiscard: checked })}
                      />
                    </div>
                  </CardContent>
                </Card>

                {error && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-destructive/10 to-red-50/50 border-2 border-destructive/20 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-destructive/20 flex items-center justify-center">
                        <X className="w-4 h-4 text-destructive" />
                      </div>
                      <p className="text-sm text-destructive font-medium flex-1">{error}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {item.comment && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Kommentar</Label>
                    <p className="text-base text-foreground bg-muted/30 p-3 rounded-xl">{item.comment}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <Badge variant="secondary" className="text-sm bg-primary/10 text-primary px-3 py-2">
                    Str. {item.size}
                  </Badge>
                  <Badge variant="outline" className="text-sm border-emerald-200 text-emerald-700 flex items-center gap-2 px-3 py-2">
                    {IconComponent ? (
                      <IconComponent
                        className="w-4 h-4"
                        color={categoryColors[item.category as keyof typeof categoryColors]}
                      />
                    ) : (
                      <span className="w-4 h-4 inline-block">?</span>
                    )}
                    {categoryLabels[item.category]}
                  </Badge>
                  <Badge variant="outline" className="text-sm border-amber-200 text-amber-700 px-3 py-2">
                    {seasonLabels[item.season]}
                  </Badge>
                  {item.gender && (
                    <Badge variant="outline" className="text-sm border-purple-200 text-purple-700 px-3 py-2">
                      {genders.find(g => g.value === item.gender)?.label}
                    </Badge>
                  )}
                  {item.childId && (
                    <Badge variant="outline" className="text-sm border-blue-200 text-blue-700 flex items-center gap-1 px-3 py-2">
                      <Baby className="w-3 h-3" />
                      {children.find(c => c.id === item.childId)?.name || 'Ukendt barn'}
                    </Badge>
                  )}
                </div>

                {item.doNotDiscard && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200/50 dark:border-red-800/30">
                    <Heart className="w-5 h-5 text-red-600 dark:text-red-400 fill-current" />
                    <p className="text-sm text-red-700 dark:text-red-300 font-medium">Dette tøj må ikke kasseres</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex-shrink-0 p-6 border-t border-border/30 bg-gradient-to-t from-background/95 to-background/80 backdrop-blur-lg shadow-2xl">
        {isEditing ? (
          <div className="flex gap-4">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1 h-12 rounded-2xl font-medium border-border/50 hover:bg-secondary/80 hover:border-border transition-all duration-200"
              onClick={() => {
                setIsEditing(false);
                setError('');
                setEditData({
                  comment: item.comment || '',
                  category: item.category,
                  size: item.size,
                  gender: item.gender || 'unisex',
                  season: item.season,
                  doNotDiscard: item.doNotDiscard,
                  childId: item.childId || ''
                });
              }}
              disabled={isLoading}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Annuller
            </Button>
            <Button 
              onClick={handleSave}
              className="flex-2 h-12 rounded-2xl font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
              disabled={isLoading || !editData.category || !editData.size}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                  Gemmer...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Gem ændringer
                </div>
              )}
            </Button>
          </div>
        ) : (
          <div className="flex gap-4">
            <Button 
              variant="destructive" 
              className="flex-1 h-12 rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Slet
            </Button>
            <Button 
              className="flex-2 h-12 rounded-2xl font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Rediger
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}