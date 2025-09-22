'use client';

import { experimental_useObject as useObject } from '@ai-sdk/react';
import {
  InlineCitation,
  InlineCitationText,
  InlineCitationCard,
  InlineCitationCardTrigger,
  InlineCitationCardBody,
  InlineCitationCarousel,
  InlineCitationCarouselContent,
  InlineCitationCarouselItem,
  InlineCitationCarouselHeader,
  InlineCitationCarouselIndex,
  InlineCitationCarouselPrev,
  InlineCitationCarouselNext,
  InlineCitationSource,
  InlineCitationQuote,
} from '@/components/ai-elements/inline-citation';
import { Button } from '@/components/ui/button';
import { citationSchema } from '@/lib/schemas/citation';

export default function Page() {
  const { object, submit, isLoading } = useObject({
    api: '/api/citation',
    schema: citationSchema,
  });

  const handleSubmit = (topic: string) => {
    submit({ prompt: topic });
  };

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex gap-2 mb-6">
        <Button
          onClick={() => handleSubmit('artificial intelligence')}
          disabled={isLoading}
          variant="outline"
        >
          Generate AI Content
        </Button>
        <Button
          onClick={() => handleSubmit('climate change')}
          disabled={isLoading}
          variant="outline"
        >
          Generate Climate Content
        </Button>
      </div>

      {isLoading && !object && (
        <div className="text-muted-foreground">
          Generating content with citations...
        </div>
      )}

      {object?.content && (
        <div className="prose prose-sm max-w-none">
          {/* Content with inline citations */}
          <div className="leading-relaxed">
            {object.content.split(/(\[\d+\])/).map((part: string, index: number) => {
              const citationMatch = part.match(/\[(\d+)\]/);
              if (citationMatch) {
                return (
                  <span 
                    key={index} 
                    className="text-blue-600 dark:text-blue-400 font-medium cursor-pointer hover:underline"
                  >
                    {part}
                  </span>
                );
              }
              return <span key={index}>{part}</span>;
            })}
          </div>
          
          {/* Single combined citation card at the bottom */}
          {object.citations && object.citations.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sources:</span>
                <InlineCitation>
                  <InlineCitationCard>
                    <InlineCitationCardTrigger 
                      sources={object.citations.map((c: any) => c.url)} 
                    />
                    <InlineCitationCardBody>
                      <InlineCitationCarousel>
                        <InlineCitationCarouselHeader>
                          <InlineCitationCarouselPrev />
                          <InlineCitationCarouselNext />
                          <InlineCitationCarouselIndex />
                        </InlineCitationCarouselHeader>
                        <InlineCitationCarouselContent>
                          {object.citations.map((citation: any) => (
                            <InlineCitationCarouselItem key={citation.number}>
                              <InlineCitationSource
                                title={citation.title}
                                url={citation.url}
                                description={citation.description}
                              />
                              {citation.quote && (
                                <InlineCitationQuote>
                                  {citation.quote}
                                </InlineCitationQuote>
                              )}
                            </InlineCitationCarouselItem>
                          ))}
                        </InlineCitationCarouselContent>
                      </InlineCitationCarousel>
                    </InlineCitationCardBody>
                  </InlineCitationCard>
                </InlineCitation>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}


