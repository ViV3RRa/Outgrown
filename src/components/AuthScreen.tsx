import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { api, type User } from '../services/api';

interface AuthScreenProps {
  onAuthSuccess: (user: User) => void;
}

export function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const user = await api.login(email, password);
      onAuthSuccess(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login fejlede');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-accent/10">
      <Card className="w-full max-w-md shadow-xl border-primary/20">
        <CardHeader className="text-center bg-gradient-to-r from-primary/10 to-accent/20 rounded-t-lg">
          <CardTitle className="text-2xl text-primary">Tøjstyring</CardTitle>
          <CardDescription className="text-muted-foreground">
            Log ind for at administrere dit barns tøj
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="din@email.dk"
                className="border-primary/20 focus:border-primary"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Adgangskode</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Din adgangskode"
                className="border-primary/20 focus:border-primary"
                required
              />
            </div>

            {error && (
              <div className="text-sm text-destructive text-center p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90" 
              disabled={isLoading}
            >
              {isLoading ? 'Logger ind...' : 'Log ind'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-gradient-to-r from-accent/30 to-secondary/50 rounded-lg border border-primary/10">
            <p className="text-sm text-muted-foreground mb-2 font-medium">Demo login:</p>
            <p className="text-xs text-muted-foreground">Email: test@example.com</p>
            <p className="text-xs text-muted-foreground">Adgangskode: password</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}