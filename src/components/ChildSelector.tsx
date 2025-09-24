import type { Child } from '../services/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent } from './ui/card';
import { Baby } from 'lucide-react';

interface ChildSelectorProps {
  children: Child[];
  selectedChild: Child | null;
  onChildSelect: (child: Child) => void;
}

export function ChildSelector({ children, selectedChild, onChildSelect }: ChildSelectorProps) {
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
  //     return months > 0 ? `${years} år, ${months} mnd` : `${years} år`;
  //   }
  // };

  if (children.length <= 1) {
    return null; // Don't show selector if only one or no children
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/10">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/30 flex items-center justify-center">
            <Baby className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <Select 
              value={selectedChild?.id ?? ''} 
              onValueChange={(childId: string) => {
                const child = children.find(c => c.id === childId);
                if (child) onChildSelect(child);
              }}
            >
              <SelectTrigger className="bg-background/80 border-border/50">
                <SelectValue placeholder="Vælg et barn" />
              </SelectTrigger>
              <SelectContent>
                {children.map((child) => (
                  <SelectItem key={child.id} value={child.id}>
                    <div className="flex items-center">
                        <span className="font-medium">{child.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}