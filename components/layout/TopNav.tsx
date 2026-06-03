import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

export default function TopNav() {
  return (
    <div className="flex items-center justify-between h-12 px-4 border-b">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Menu className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
