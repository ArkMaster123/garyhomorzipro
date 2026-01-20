'use client';

import { memo, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '../ui/tooltip';
import { PencilEditIcon, SparklesIcon, PaperclipIcon } from '../icons';
import { generateUUID } from '@/lib/utils';
import type { ChatMessage } from '@/lib/types';
import type { UseChatHelpers } from '@ai-sdk/react';

interface ImageGenerationPartProps {
  toolCallId: string;
  state: 'input-available' | 'output-available';
  input?: { text_prompt?: string; style?: string };
  output?: {
    success?: boolean;
    error?: string;
    text_prompt?: string;
    images?: Array<{ url: string }>;
  };
  setMessages: UseChatHelpers<ChatMessage>['setMessages'];
}

function PureImageGenerationPart({
  toolCallId,
  state,
  input,
  output,
  setMessages,
}: ImageGenerationPartProps) {
  const [editingImage, setEditingImage] = useState<{
    toolCallId: string;
    currentPrompt: string;
  } | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [referenceImage, setReferenceImage] = useState<File | null>(null);

  const handleCloseEditor = useCallback(() => {
    setEditingImage(null);
    setEditPrompt('');
    setReferenceImage(null);
  }, []);

  const handleOpenEditor = useCallback((prompt: string) => {
    setEditingImage({ toolCallId, currentPrompt: prompt });
    setEditPrompt(prompt);
  }, [toolCallId]);

  const handleRegenerate = useCallback(async () => {
    if (!editPrompt.trim()) return;

    try {
      const messageParts: Array<{ type: 'text'; text: string } | { type: 'file'; url: string; name: string; mediaType: string }> = [
        {
          type: 'text' as const,
          text: `Please regenerate the image with this prompt: ${editPrompt}`,
        },
      ];

      if (referenceImage) {
        const formData = new FormData();
        formData.append('file', referenceImage);

        const response = await fetch('/api/files/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          const { url, pathname, contentType } = data;

          messageParts.push({
            type: 'file' as const,
            url,
            name: pathname,
            mediaType: contentType,
          });
        } else {
          const { error } = await response.json();
          toast.error(`Upload failed: ${error}`);
          return;
        }
      }

      const newMessage: ChatMessage = {
        id: generateUUID(),
        role: 'user',
        parts: messageParts,
        metadata: {
          createdAt: new Date().toISOString(),
        },
      };

      setMessages((prev) => [...prev, newMessage]);
      handleCloseEditor();
      toast.success(
        referenceImage
          ? 'Image regeneration with reference started!'
          : 'Image regeneration started!'
      );
    } catch (error) {
      console.error('Failed to start image regeneration:', error);
      toast.error('Failed to start image regeneration');
    }
  }, [editPrompt, referenceImage, setMessages, handleCloseEditor]);

  // Loading state
  if (state === 'input-available') {
    return (
      <div className="flex flex-col gap-2 p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="animate-spin">
            <SparklesIcon size={16} />
          </div>
          Generating image: &quot;{input?.text_prompt}&quot;
          {input?.style && ` (Style: ${input.style})`}
        </div>
      </div>
    );
  }

  // Error state
  if (output?.error) {
    return (
      <div className="text-red-500 p-3 border border-red-200 rounded-lg bg-red-50">
        <div className="font-medium">Image generation failed</div>
        <div className="text-sm">{String(output.error)}</div>
      </div>
    );
  }

  // Success state with images
  if (output?.success && output.images && output.images.length > 0) {
    return (
      <div className="flex flex-col gap-3">
        <div className="text-sm text-muted-foreground">
          Generated image for: &quot;{output.text_prompt}&quot;
        </div>
        {output.images.map((image, imageIndex) => (
          <div
            key={`${toolCallId}-${imageIndex}`}
            className="relative border rounded-lg overflow-hidden bg-white/5 backdrop-blur-sm group"
          >
            <img
              src={image.url}
              alt={output.text_prompt || 'Generated image'}
              className="w-full max-w-md h-auto rounded-lg"
              style={{ maxHeight: '400px', objectFit: 'contain' }}
            />

            {/* Image edit button - appears on hover */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="py-1 px-2 h-8 w-8 bg-black/50 hover:bg-black/70 text-white border-0"
                      variant="outline"
                      onClick={() => handleOpenEditor(output.text_prompt || '')}
                      aria-label="Edit image"
                    >
                      <PencilEditIcon size={14} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit image</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        ))}

        {/* Image Edit Dialog */}
        {editingImage && (
          <ImageEditDialog
            currentPrompt={editingImage.currentPrompt}
            editPrompt={editPrompt}
            setEditPrompt={setEditPrompt}
            referenceImage={referenceImage}
            setReferenceImage={setReferenceImage}
            onClose={handleCloseEditor}
            onRegenerate={handleRegenerate}
          />
        )}
      </div>
    );
  }

  // No image generated
  return (
    <div className="text-yellow-600 p-3 border border-yellow-200 rounded-lg bg-yellow-50">
      No image was generated. Please try again.
    </div>
  );
}

export const ImageGenerationPart = memo(PureImageGenerationPart);

// Extracted Image Edit Dialog component
interface ImageEditDialogProps {
  currentPrompt: string;
  editPrompt: string;
  setEditPrompt: (value: string) => void;
  referenceImage: File | null;
  setReferenceImage: (file: File | null) => void;
  onClose: () => void;
  onRegenerate: () => void;
}

function PureImageEditDialog({
  currentPrompt,
  editPrompt,
  setEditPrompt,
  referenceImage,
  setReferenceImage,
  onClose,
  onRegenerate,
}: ImageEditDialogProps) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-edit-title"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <div className="bg-background border rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 id="image-edit-title" className="text-lg font-semibold mb-4">
          Edit Image
        </h3>
        <div className="space-y-4">
          {/* Current Image Display */}
          <div className="text-sm text-muted-foreground mb-2">
            Current image prompt: &quot;{currentPrompt}&quot;
          </div>

          {/* New Prompt Input */}
          <div>
            <label htmlFor="edit-prompt" className="block text-sm font-medium mb-2">
              New Image Prompt
            </label>
            <textarea
              id="edit-prompt"
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              className="w-full p-3 border rounded-md resize-none"
              rows={3}
              placeholder="Describe the new image you want to generate..."
            />
          </div>

          {/* Image Upload Section */}
          <div>
            <label htmlFor="image-upload" className="block text-sm font-medium mb-2">
              Or Upload Reference Image (Optional)
            </label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="image-upload"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setReferenceImage(file);
                    toast.success('Reference image uploaded!');
                  }
                }}
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <div className="text-muted-foreground">
                  <PaperclipIcon size={20} />
                </div>
                <span className="text-sm text-muted-foreground">
                  Click to upload an image or drag and drop
                </span>
              </label>
            </div>

            {/* Reference Image Preview */}
            {referenceImage && (
              <div className="mt-3 p-3 border rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Reference Image:</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReferenceImage(null)}
                    className="h-6 px-2 text-xs"
                  >
                    Remove
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <img
                    src={URL.createObjectURL(referenceImage)}
                    alt="Reference"
                    className="w-16 h-16 object-cover rounded border"
                  />
                  <div className="text-xs text-muted-foreground">
                    <div>{referenceImage.name}</div>
                    <div>
                      {(referenceImage.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onRegenerate} disabled={!editPrompt.trim()}>
              Regenerate
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const ImageEditDialog = memo(PureImageEditDialog);
