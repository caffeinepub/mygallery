import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, Copy, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface LinkOpenFallbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  linkUrl: string;
  onRetryOpen: () => void;
  onCopyLink: () => void;
}

export default function LinkOpenFallbackDialog({
  open,
  onOpenChange,
  linkUrl,
  onRetryOpen,
  onCopyLink,
}: LinkOpenFallbackDialogProps) {
  const handleCopy = async () => {
    await onCopyLink();
    toast.success('Link copied to clipboard');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-warning/10 p-2">
              <AlertCircle className="h-5 w-5 text-warning" />
            </div>
            <DialogTitle>Unable to Open Link</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            Your browser blocked opening this link in a new window. You can try again or copy the link to open it manually.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-md bg-muted p-3 text-sm break-all">
          {linkUrl}
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => {
              onRetryOpen();
              onOpenChange(false);
            }}
            className="w-full sm:w-auto"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button
            onClick={handleCopy}
            className="w-full sm:w-auto"
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
