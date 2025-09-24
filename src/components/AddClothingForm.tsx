import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Card, CardContent } from './ui/card';
import { api, DANISH_SIZES, getChildSizes, getAvailableCategoriesForChild, type Child, type ClothingItem } from '../services/api';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Upload, X, Camera, Heart, ShirtIcon, Baby } from 'lucide-react';
import { categoryIcons } from './icons/map';

interface AddClothingFormProps {
  childId?: string; // Made optional - can be unassigned
  children: Child[];
  onSuccess: (item: ClothingItem) => void;
  onCancel: () => void;
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

export function AddClothingForm({ childId, children, onSuccess, onCancel }: AddClothingFormProps) {
  const [formData, setFormData] = useState<{
    comment: string;
    category: "sokker" | "trøjer" | "bukser" | "kjoler" | "jakker" | "undertøj" | "body" | "sko" | "tilbehør" | '';
    size: string;
    gender: 'dreng' | 'pige' | 'unisex';
    season: 'forår' | 'sommer' | 'efterår' | 'vinter' | 'helår';
    doNotDiscard: boolean;
    assignedChildId: string; // Track assigned child
  }>({
    comment: '', // Changed from name to comment
    category: '',
    size: '',
    gender: 'unisex' as const,
    season: 'helår' as const,
    doNotDiscard: false,
    assignedChildId: childId || '' // Track assigned child
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Get available categories based on selected child
  const getAvailableCategories = () => {
    if (!formData.assignedChildId) {
      return categories; // Show all categories if no child selected
    }
    
    const selectedChild = children.find(c => c.id === formData.assignedChildId);
    if (!selectedChild) {
      return categories;
    }
    
    const availableCategories = getAvailableCategoriesForChild(selectedChild, formData.size);
    return categories.filter(cat => availableCategories.includes(cat.value));
  };

  // Handle child selection change
  const handleChildChange = (childId: string) => {
    const newAssignedChildId = childId === "unassigned" ? "" : childId;
    setFormData(prev => {
      const newFormData = { ...prev, assignedChildId: newAssignedChildId };
      
      // Check if current category is still available for new child
      if (newFormData.category) {
        const selectedChild = children.find(c => c.id === newAssignedChildId);
        if (selectedChild) {
          const availableCategories = getAvailableCategoriesForChild(selectedChild, newFormData.size);
          if (!availableCategories.includes(newFormData.category)) {
            newFormData.category = ''; // Reset category if not available
          }
        }
      }
      
      return newFormData;
    });
  };

  // Handle size change
  const handleSizeChange = (size: string) => {
    setFormData(prev => {
      const newFormData = { ...prev, size };
      
      // Check if current category is still available for new size
      if (newFormData.category && newFormData.assignedChildId) {
        const selectedChild = children.find(c => c.id === newFormData.assignedChildId);
        if (selectedChild) {
          const availableCategories = getAvailableCategoriesForChild(selectedChild, size);
          if (!availableCategories.includes(newFormData.category)) {
            newFormData.category = ''; // Reset category if not available
          }
        }
      }
      
      return newFormData;
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setSelectedFiles(prevFiles => [...prevFiles, file]);
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewUrls(prevUrls => [...prevUrls, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      }
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    setPreviewUrls(prevUrls => prevUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category || !formData.size) {
      setError('Udfyld venligst kategori og størrelse');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const imageUrls: string[] = [];
      if (selectedFiles.length > 0) {
        // Upload all images
        for (const file of selectedFiles) {
          const url = await api.uploadImage(file);
          imageUrls.push(url);
        }
      }

      const newItem = await api.createClothingItem({
        comment: formData.comment,
        category: formData.category,
        size: formData.size,
        gender: formData.gender,
        season: formData.season,
        doNotDiscard: formData.doNotDiscard,
        childId: formData.assignedChildId || undefined,
        imageUrl: imageUrls[0] || undefined, // Keep backward compatibility
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined
      });

      onSuccess(newItem);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fejl ved tilføjelse af tøj');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header with improved gradient */}
      <div className="flex-shrink-0 px-6 py-6 border-b border-border/30 bg-gradient-to-r from-primary/5 via-accent/10 to-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/30 flex items-center justify-center shadow-lg">
              <ShirtIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Tilføj særligt tøj</h2>
              <p className="text-sm text-muted-foreground">Registrer nyt tøjstykke i garderoben</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onCancel}
            className="h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground hover:bg-background/80"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload Section with enhanced design */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-accent/30 flex items-center justify-center">
                <Camera className="w-4 h-4 text-primary" />
              </div>
              <Label className="text-base font-medium text-foreground">Billeder</Label>
            </div>
            
            {/* Display existing images */}
            {previewUrls.length > 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square w-full rounded-2xl overflow-hidden bg-gradient-to-br from-primary/5 to-accent/20 border-2 border-primary/20 shadow-lg group-hover:shadow-xl transition-all duration-300">
                        <ImageWithFallback
                          src={url}
                          alt={`Billede ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-3 right-3 h-7 w-7 rounded-xl shadow-lg opacity-90 group-hover:opacity-100 transition-opacity bg-destructive/90 hover:bg-destructive"
                        onClick={() => removeImage(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                      {index === 0 && (
                        <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground text-xs font-medium rounded-lg shadow-lg">
                          Hovedbillede
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add more images with enhanced styling */}
            <div className="space-y-4">
              {/* Camera Option */}
              <div className="relative group">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  id="camera-input"
                />
                <label 
                  htmlFor="camera-input"
                  className="block w-full rounded-2xl border-2 border-dashed border-primary/40 bg-gradient-to-br from-primary/8 to-accent/15 p-6 text-center hover:border-primary/60 hover:from-primary/12 hover:to-accent/20 transition-all duration-300 cursor-pointer group-hover:shadow-lg"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                      <Camera className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      {previewUrls.length > 0 ? 'Tag endnu et billede' : 'Tag billede'}
                    </p>
                    <p className="text-xs text-muted-foreground">Brug kameraet til at tage et nyt foto</p>
                  </div>
                </label>
              </div>

              {/* Gallery Option */}
              <div className="relative group">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  id="gallery-input"
                />
                <label 
                  htmlFor="gallery-input"
                  className="block w-full rounded-2xl border-2 border-dashed border-muted-foreground/40 bg-gradient-to-br from-muted/10 to-secondary/20 p-6 text-center hover:border-muted-foreground/60 hover:from-muted/15 hover:to-secondary/25 transition-all duration-300 cursor-pointer group-hover:shadow-lg"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-muted/20 to-secondary/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                      <Upload className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      {previewUrls.length > 0 ? 'Tilføj flere fra galleri' : 'Vælg fra galleri'}
                    </p>
                    <p className="text-xs text-muted-foreground">Browse dine eksisterende billeder</p>
                  </div>
                </label>
              </div>
            </div>
            
            {previewUrls.length > 0 && (
              <div className="text-xs text-muted-foreground text-center p-3 bg-gradient-to-r from-muted/10 to-secondary/20 rounded-2xl border border-border/30">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                  {previewUrls.length} billede{previewUrls.length !== 1 ? 'r' : ''} tilføjet
                </div>
              </div>
            )}
          </div>

          {/* Required Fields Section with enhanced design */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-accent/30 flex items-center justify-center">
                <div className="w-1.5 h-4 bg-primary rounded-full"></div>
              </div>
              <span className="text-base font-medium text-foreground">Grundoplysninger</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment" className="text-sm font-medium text-foreground">
                Kommentar
              </Label>
              <Input
                id="comment"
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                placeholder="F.eks. 'Blå striktrøje'"
                className="h-12 text-base bg-input-background border-border/50 focus:border-primary/50 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium text-foreground">
                  Kategori <span className="text-primary">*</span>
                </Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value: "sokker" | "trøjer" | "bukser" | "kjoler" | "jakker" | "undertøj" | "body" | "sko" | "tilbehør") => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="h-12 bg-input-background border-border/50 rounded-xl">
                    <SelectValue placeholder="Vælg kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableCategories().map((cat) => {
                      const IconComponent = categoryIcons[cat.value as keyof typeof categoryIcons];
                      return (
                        <SelectItem key={cat.value} value={cat.value}>
                          <div className="flex items-center gap-2">
                            {IconComponent ? (
                              <IconComponent
                                className="w-4 h-4"
                                color={categoryColors[cat.value as keyof typeof categoryColors]}
                              />
                            ) : (
                              <span className="w-4 h-4 inline-block">?</span>
                            )}
                            {cat.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="size" className="text-sm font-medium text-foreground">
                  Størrelse <span className="text-primary">*</span>
                </Label>
                <Select 
                  value={formData.size} 
                  onValueChange={(value: string) => handleSizeChange(value)}
                >
                  <SelectTrigger className="h-12 bg-input-background border-border/50 rounded-xl">
                    <SelectValue placeholder="Str." />
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
          </div>

          {/* Optional Fields Section with enhanced design */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-muted/20 to-secondary/30 flex items-center justify-center">
                <div className="w-1.5 h-4 bg-muted-foreground rounded-full"></div>
              </div>
              <span className="text-base font-medium text-foreground">Valgfri oplysninger</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-sm font-medium text-foreground">Køn</Label>
                <Select 
                  value={formData.gender} 
                  onValueChange={(value: 'unisex') => setFormData({ ...formData, gender: value })}
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
                <Label htmlFor="season" className="text-sm font-medium text-foreground">Sæson</Label>
                <Select 
                  value={formData.season} 
                  onValueChange={(value: "forår" | "sommer" | "efterår" | "vinter" | "helår") => setFormData({ ...formData, season: value })}
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
              <Label htmlFor="child" className="text-sm font-medium text-foreground">Tildel til barn</Label>
              <Select 
                value={formData.assignedChildId || "unassigned"} 
                onValueChange={handleChildChange}
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
                    id="doNotDiscard"
                    checked={formData.doNotDiscard}
                    onCheckedChange={(checked: boolean) => setFormData({ ...formData, doNotDiscard: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

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
        </form>
      </div>

      {/* Footer Actions with improved styling */}
      <div className="flex-shrink-0 p-6 border-t border-border/30 bg-gradient-to-t from-background/95 to-background/80 backdrop-blur-lg shadow-2xl">
        <div className="flex gap-4">
          <Button 
            type="button" 
            variant="outline" 
            className="flex-1 h-12 rounded-2xl font-medium border-border/50 hover:bg-secondary/80 hover:border-border transition-all duration-200"
            onClick={onCancel}
            disabled={isLoading}
          >
            Annuller
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            className="flex-2 h-12 rounded-2xl font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
            disabled={isLoading || !formData.category || !formData.size}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                Tilføjer...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <ShirtIcon className="w-4 h-4" />
                Tilføj tøj
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}