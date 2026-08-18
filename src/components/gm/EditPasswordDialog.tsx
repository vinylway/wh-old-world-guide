import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useCodexOverrides } from '@/hooks/useCodexOverrides';

interface EditPasswordDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const EditPasswordDialog = ({ open, onOpenChange }: EditPasswordDialogProps) => {
  const { unlock, isUnlocking, loginError } = useCodexOverrides();
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await unlock(password);
    if (ok) {
      setPassword('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm bg-card parchment-panel ornate-frame">
        <DialogHeader>
          <DialogTitle className="text-center font-display text-xl text-gradient-gold flex items-center justify-center gap-2">
            <Icon name="Lock" size={20} className="text-gold" />
            Режим редактирования
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <Input
            type="password"
            autoFocus
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {loginError && (
            <p className="text-sm text-destructive text-center">{loginError}</p>
          )}
          <Button type="submit" disabled={isUnlocking || !password} className="w-full">
            {isUnlocking ? 'Проверяем…' : 'Войти'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPasswordDialog;