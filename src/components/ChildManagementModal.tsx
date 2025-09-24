import { useState } from 'react';
import { api, DANISH_SHOE_SIZES, DANISH_SIZES, calculateSizeFromAge, type Child } from '../services/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Plus, Baby, Edit2, Trash2, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface ChildManagementModalProps {
  children: Child[];
  onChildrenUpdate: (children: Child[]) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

interface EditingChild extends Partial<Child> {
  name: string;
  birthDate: string;
  gender: 'dreng' | 'pige' | 'unisex';
  sizeOffset: number;
  currentShoeSize: string;
  bodySwitchSize: string;
}

// Generate offset options (-3 to +3)
const SIZE_OFFSET_OPTIONS = [
  { value: -3, label: '-3 (3 størrelser mindre)' },
  { value: -2, label: '-2 (2 størrelser mindre)' },
  { value: -1, label: '-1 (1 størrelse mindre)' },
  { value: 0, label: '0 (følger alderskurve)' },
  { value: 1, label: '+1 (1 størrelse større)' },
  { value: 2, label: '+2 (2 størrelser større)' },
  { value: 3, label: '+3 (3 størrelser større)' },
];

const GENDER_OPTIONS = [
  { value: 'dreng', label: 'Dreng' },
  { value: 'pige', label: 'Pige' },
  { value: 'unisex', label: 'Unisex' },
];

export function ChildManagementModal({ children, onChildrenUpdate, isOpen, onClose }: ChildManagementModalProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<EditingChild | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Use external isOpen if provided, otherwise use internal state
  const modalIsOpen = isOpen !== undefined ? isOpen : internalIsOpen;
  const setModalOpen = (open: boolean) => {
    if (onClose && !open) {
      onClose();
    } else if (isOpen === undefined) {
      setInternalIsOpen(open);
    }
  };

  const startEditing = (child: Child) => {
    setEditingChild(child);
    setIsCreating(false);
  };

  const startCreating = () => {
    setEditingChild({
      name: '',
      birthDate: '',
      gender: 'unisex',
      sizeOffset: 0,
      currentShoeSize: '20',
      bodySwitchSize: '104'
    });
    setIsCreating(true);
  };

  const cancelEditing = () => {
    setEditingChild(null);
    setIsCreating(false);
  };

  const saveChild = async () => {
    if (!editingChild || !editingChild.name || !editingChild.birthDate || !editingChild.gender || editingChild.sizeOffset === undefined || !editingChild.currentShoeSize || !editingChild.bodySwitchSize) {
      toast.error('Udfyld venligst alle felter');
      return;
    }

    setIsLoading(true);
    try {
      let updatedChildren;
      
      if (isCreating) {
        const newChild = await api.createChild({
          name: editingChild.name,
          birthDate: editingChild.birthDate,
          gender: editingChild.gender,
          sizeOffset: editingChild.sizeOffset,
          currentShoeSize: editingChild.currentShoeSize,
          bodySwitchSize: editingChild.bodySwitchSize
        });
        updatedChildren = [...children, newChild];
        toast.success(`${newChild.name} tilføjet`);
      } else {
        const updatedChild = await api.updateChild(editingChild.id!, {
          name: editingChild.name,
          birthDate: editingChild.birthDate,
          gender: editingChild.gender,
          sizeOffset: editingChild.sizeOffset,
          currentShoeSize: editingChild.currentShoeSize,
          bodySwitchSize: editingChild.bodySwitchSize
        });
        updatedChildren = children.map(child => 
          child.id === updatedChild.id ? updatedChild : child
        );
        toast.success(`${updatedChild.name}s oplysninger opdateret`);
      }

      onChildrenUpdate(updatedChildren);
      cancelEditing();
    } catch {
      toast.error('Fejl ved gemning af barn');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteChild = async (child: Child) => {
    if (!window.confirm(`Er du sikker på at du vil slette ${child.name}? Dette vil også slette alt tøj tilknyttet til ${child.name}.`)) {
      return;
    }

    setIsLoading(true);
    try {
      await api.deleteChild(child.id);
      const updatedChildren = children.filter(c => c.id !== child.id);
      onChildrenUpdate(updatedChildren);
      toast.success(`${child.name} slettet`);
    } catch {
      toast.error('Fejl ved sletning af barn');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    const ageInMonths = (today.getFullYear() - birth.getFullYear()) * 12 + 
                       (today.getMonth() - birth.getMonth());
    
    if (ageInMonths < 12) {
      return `${ageInMonths} måneder`;
    } else {
      const years = Math.floor(ageInMonths / 12);
      const months = ageInMonths % 12;
      return months > 0 ? `${years} år, ${months} måneder` : `${years} år`;
    }
  };

  return (
    <Dialog open={modalIsOpen} onOpenChange={setModalOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Baby className="w-4 h-4 mr-2" />
          Administrer børn
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Baby className="w-5 h-5" />
            Administrer børn
          </DialogTitle>
          <DialogDescription>
            Opret, rediger eller slet børneprofiler i din konto
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add new child button */}
          {!editingChild && (
            <Button 
              onClick={startCreating}
              className="w-full bg-gradient-to-r from-primary to-primary/90 text-primary-foreground"
              disabled={isLoading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Tilføj nyt barn
            </Button>
          )}

          {/* Editing form */}
          {editingChild && (
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {isCreating ? 'Tilføj nyt barn' : `Rediger ${editingChild.name}`}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="child-name">Navn</Label>
                  <Input
                    id="child-name"
                    value={editingChild.name}
                    onChange={(e) => setEditingChild({ ...editingChild, name: e.target.value })}
                    placeholder="Barnets navn"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="child-birthdate">Fødselsdato</Label>
                  <Input
                    id="child-birthdate"
                    type="date"
                    value={editingChild.birthDate}
                    onChange={(e) => setEditingChild({ ...editingChild, birthDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="child-gender">Køn</Label>
                  <Select 
                    value={editingChild.gender} 
                    onValueChange={(value: "dreng" | "pige" | "unisex") => setEditingChild({ ...editingChild, gender: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Vælg køn" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDER_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="child-size-offset">Størrelsesjustering</Label>
                  <Select 
                    value={editingChild.sizeOffset.toString()} 
                    onValueChange={(value: string) => setEditingChild({ ...editingChild, sizeOffset: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Vælg størrelsesjustering" />
                    </SelectTrigger>
                    <SelectContent>
                      {SIZE_OFFSET_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Beregnet størrelse: Str. {editingChild.birthDate ? calculateSizeFromAge(editingChild.birthDate, editingChild.sizeOffset) : '?'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="child-shoe-size">Nuværende sko størrelse</Label>
                  <Select 
                    value={editingChild.currentShoeSize} 
                    onValueChange={(value: string) => setEditingChild({ ...editingChild, currentShoeSize: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Vælg skostørrelse" />
                    </SelectTrigger>
                    <SelectContent>
                      {DANISH_SHOE_SIZES.map((size) => (
                        <SelectItem key={size} value={size}>
                          Sko. {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="child-body-switch">Body skiftes til undertøj ved størrelse</Label>
                  <Select 
                    value={editingChild.bodySwitchSize} 
                    onValueChange={(value: string) => setEditingChild({ ...editingChild, bodySwitchSize: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Vælg størrelse" />
                    </SelectTrigger>
                    <SelectContent>
                      {DANISH_SIZES.map((size) => (
                        <SelectItem key={size} value={size}>
                          Str. {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Ved str. {editingChild.bodySwitchSize} skiftes fra body til undertøj
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={cancelEditing}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Annuller
                  </Button>
                  <Button 
                    onClick={saveChild}
                    disabled={isLoading || !editingChild.name || !editingChild.birthDate || !editingChild.gender || editingChild.sizeOffset === undefined || !editingChild.currentShoeSize || !editingChild.bodySwitchSize}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-1"></div>
                    ) : (
                      <Save className="w-4 h-4 mr-1" />
                    )}
                    Gem
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Children list */}
          {!editingChild && (
            <div className="space-y-3">
              {children.map((child) => (
                <Card key={child.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{child.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {calculateAge(child.birthDate)}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="secondary">
                            Str. {calculateSizeFromAge(child.birthDate, child.sizeOffset)}
                          </Badge>
                          <Badge variant="outline">
                            Sko {child.currentShoeSize}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditing(child)}
                          disabled={isLoading}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteChild(child)}
                          disabled={isLoading || children.length <= 1}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {children.length === 0 && !editingChild && (
            <div className="text-center py-6 text-muted-foreground">
              <Baby className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Ingen børn registreret</p>
              <p className="text-sm">Tilføj dit første barn for at komme i gang</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}