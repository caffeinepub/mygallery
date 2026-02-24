import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, Download, AlertCircle } from 'lucide-react';

interface ExternalOpenFallbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName: string;
  fileUrl: string;
  onRetryOpen: () => void;
  onDownload: () => void;
}

export default function ExternalOpenFallbackDialog({
  open,
  onOpenChange,
  fileName,
  fileUrl,
  onRetryOpen,
  onDownload,
}: ExternalOpenFallbackDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-warning/10 p-2">
              <AlertCircle className="h-5 w-5 text-warning" />
            </div>
            <DialogTitle>Unable to Open File</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            Your browser blocked opening "{fileName}" in a new window. You can try again or download the file.
          </DialogDescription>
        </DialogHeader>
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
            onClick={() => {
              onDownload();
              onOpenChange(false);
            }}
            className="w-full sm:w-auto"
          >
            <Download className="mr-2 h-4 w-4" />
            Download File
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
