import { Artifact } from '@/components/create-artifact';
import { CopyIcon, RedoIcon, UndoIcon } from '@/components/icons';
import { ImageEditor } from '@/components/image-editor';
import { toast } from 'sonner';

export const imageArtifact = new Artifact({
  kind: 'image',
  description: 'Useful for image generation',
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === 'data-imageDelta') {
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: streamPart.data,
        isVisible: true,
        status: 'streaming',
      }));
    }
  },
  content: ImageEditor,
  actions: [
    {
      icon: <UndoIcon size={18} />,
      description: 'View Previous version',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('prev');
      },
      isDisabled: ({ currentVersionIndex }) => {
        if (currentVersionIndex === 0) {
          return true;
        }

        return false;
      },
    },
    {
      icon: <RedoIcon size={18} />,
      description: 'View Next version',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('next');
      },
      isDisabled: ({ isCurrentVersion }) => {
        if (isCurrentVersion) {
          return true;
        }

        return false;
      },
    },
    {
      icon: <CopyIcon size={18} />,
      description: 'Copy image to clipboard',
      onClick: ({ content }) => {
        if (content.startsWith('data:')) {
          // Handle base64 data
          const img = new Image();
          img.src = content;

          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
              if (blob) {
                navigator.clipboard.write([
                  new ClipboardItem({ 'image/png': blob }),
                ]);
              }
            }, 'image/png');
          };
        } else {
          // Handle URL - fetch the image first
          fetch(content)
            .then(response => response.blob())
            .then(blob => {
              navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob }),
              ]);
            })
            .catch(error => {
              console.error('Failed to copy image from URL:', error);
              toast.error('Failed to copy image');
            });
        }

        toast.success('Copied image to clipboard!');
      },
    },
  ],
  toolbar: [],
});
