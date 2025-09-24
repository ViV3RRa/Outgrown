import { useState } from 'react';
import { api, DANISH_SHOE_SIZES, DANISH_SIZES, calculateSizeFromAge, getChildSizes, shouldUseBodyOrUndertoj, type User, type Child } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { LogOut, User as UserIcon, Baby, Edit, Plus, Check, X } from 'lucide-react';
import { ChildManagementModal } from './ChildManagementModal';
import { toast } from 'sonner';

interface ProfileScreenProps {
  user: User;
  children: Child[];
  onLogout: () => void;
  onChildrenUpdated: (children: Child[]) => void;
}

interface ChildCardProps {
  child: Child;
  onUpdate: (child: Child) => void;
  onDelete: (childId: string) => void;
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

function ChildCard({ child, onUpdate }: ChildCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [childData, setChildData] = useState({
    name: child.name,
    birthDate: child.birthDate,
    gender: child.gender,
    sizeOffset: child.sizeOffset,
    currentShoeSize: child.currentShoeSize,
    bodySwitchSize: child.bodySwitchSize
  });
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const updatedChild = await api.updateChild(child.id, childData);
      onUpdate(updatedChild);
      setIsEditing(false);
      toast.success(`${updatedChild.name}s oplysninger er opdateret`);
    } catch (error) {
      console.error('Fejl ved opdatering af barn:', error);
      toast.error('Kunne ikke opdatere barnets oplysninger');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setChildData({
      name: child.name,
      birthDate: child.birthDate,
      gender: child.gender,
      sizeOffset: child.sizeOffset,
      currentShoeSize: child.currentShoeSize,
      bodySwitchSize: child.bodySwitchSize
    });
    setIsEditing(false);
  };

  // Calculate current and next sizes
  const { currentSize } = getChildSizes(child);
  const calculatedCurrentSize = calculateSizeFromAge(childData.birthDate, childData.sizeOffset);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Baby className="w-5 h-5" />
          {isEditing ? (
            <Input
              value={childData.name}
              onChange={(e) => setChildData({ ...childData, name: e.target.value })}
              className="w-32"
            />
          ) : (
            child.name
          )}
        </CardTitle>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                disabled={isLoading}
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
              >
                <X className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor={`birthDate-${child.id}`}>Fødselsdato</Label>
              <Input
                id={`birthDate-${child.id}`}
                type="date"
                value={childData.birthDate}
                onChange={(e) => setChildData({ ...childData, birthDate: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor={`gender-${child.id}`}>Køn</Label>
              <Select 
                value={childData.gender} 
                onValueChange={(value: "dreng" | "pige" | "unisex") => setChildData({ ...childData, gender: value })}
              >
                <SelectTrigger>
                  <SelectValue />
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
            
            <div>
              <Label htmlFor={`sizeOffset-${child.id}`}>Størrelse offset</Label>
              <Select 
                value={childData.sizeOffset.toString()} 
                onValueChange={(value: string) => setChildData({ ...childData, sizeOffset: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SIZE_OFFSET_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Beregnet størrelse: Str. {calculatedCurrentSize}
              </p>
            </div>

            <div>
              <Label htmlFor={`bodySwitchSize-${child.id}`}>Body skiftes til undertøj ved størrelse</Label>
              <Select 
                value={childData.bodySwitchSize} 
                onValueChange={(value: string) => setChildData({ ...childData, bodySwitchSize: value })}
              >
                <SelectTrigger>
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
              <p className="text-xs text-muted-foreground mt-1">
                Ved str. {childData.bodySwitchSize} skiftes fra body til undertøj
              </p>
            </div>

            <div>
              <Label htmlFor={`currentShoeSize-${child.id}`}>Nuværende skostørrelse</Label>
              <Select 
                value={childData.currentShoeSize} 
                onValueChange={(value: string) => setChildData({ ...childData, currentShoeSize: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DANISH_SHOE_SIZES.map((size) => (
                    <SelectItem key={size} value={size}>
                      Str. {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <Label className="text-sm text-muted-foreground">Alder</Label>
              <p className="font-medium">{calculateAge(child.birthDate)}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Fødselsdato</Label>
              <p className="font-medium">
                {new Date(child.birthDate).toLocaleDateString('da-DK')}
              </p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Køn</Label>
              <p className="font-medium">
                {GENDER_OPTIONS.find(g => g.value === child.gender)?.label || 'Ukendt'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Tøjstørrelse</Label>
                <p className="font-medium">Str. {currentSize}</p>
                {child.sizeOffset !== 0 && (
                  <p className="text-xs text-muted-foreground">
                    {child.sizeOffset > 0 ? '+' : ''}{child.sizeOffset} offset
                  </p>
                )}
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Skostørrelse</Label>
                <p className="font-medium">Str. {child.currentShoeSize}</p>
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Undertøj</Label>
              <p className="font-medium">
                Bruger {shouldUseBodyOrUndertoj(child)} 
                <span className="text-xs text-muted-foreground ml-2">
                  (skifter ved str. {child.bodySwitchSize})
                </span>
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ProfileScreen({ user, children, onLogout, onChildrenUpdated }: ProfileScreenProps) {
  const [isManagementModalOpen, setIsManagementModalOpen] = useState(false);

  const handleChildUpdate = (updatedChild: Child) => {
    const updatedChildren = children.map(child => 
      child.id === updatedChild.id ? updatedChild : child
    );
    onChildrenUpdated(updatedChildren);
  };

  const handleChildDelete = async (childId: string) => {
    try {
      await api.deleteChild(childId);
      const updatedChildren = children.filter(child => child.id !== childId);
      onChildrenUpdated(updatedChildren);
      toast.success('Barn er slettet');
    } catch (error) {
      console.error('Fejl ved sletning af barn:', error);
      toast.error('Kunne ikke slette barn');
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      onLogout();
    } catch (error) {
      console.error('Fejl ved logout:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            Min profil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <Label className="text-sm text-muted-foreground">Navn</Label>
              <p className="font-medium">{user.name}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Email</Label>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Medlem siden</Label>
              <p className="font-medium">
                {new Date(user.createdAt).toLocaleDateString('da-DK')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Baby className="w-5 h-5" />
          Mine børn ({children.length})
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsManagementModalOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Tilføj barn
        </Button>
      </div>

      {children.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Baby className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Du har ikke tilføjet nogen børn endnu</p>
            <Button onClick={() => setIsManagementModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Tilføj dit første barn
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {children.map((child) => (
            <ChildCard
              key={child.id}
              child={child}
              onUpdate={handleChildUpdate}
              onDelete={handleChildDelete}
            />
          ))}
        </div>
      )}

      <ChildManagementModal 
        children={children}
        onChildrenUpdate={onChildrenUpdated}
        isOpen={isManagementModalOpen}
        onClose={() => setIsManagementModalOpen(false)}
      />

      <Card className="border-destructive/20">
        <CardContent className="pt-6">
          <Button 
            variant="destructive" 
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log ud
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}