import { Button } from '@/components/ui/button';

export const Footer = () => {
  return (
    <footer className="text-muted-foreground absolute bottom-2 ml-4 flex items-center justify-center text-center text-sm">
      © {new Date().getFullYear()} By{' '}
      <Button variant="link" className="ml-1 p-0" asChild>
        <a href="https://github.com/heydayle">Devaloka aka Heyday</a>
      </Button>
    </footer>
  );
};
