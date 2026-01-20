'use client';

import { memo } from 'react';
import { Weather } from '../weather';
import { DocumentToolCall, DocumentToolResult } from '../document';
import { DocumentPreview } from '../document-preview';
import { SparklesIcon } from '../icons';

// Weather Tool Part
interface WeatherToolPartProps {
  toolCallId: string;
  state: 'input-available' | 'output-available';
  output?: any;
}

function PureWeatherToolPart({ toolCallId, state, output }: WeatherToolPartProps) {
  if (state === 'input-available') {
    return (
      <div className="skeleton">
        <Weather />
      </div>
    );
  }

  if (state === 'output-available') {
    return <Weather weatherAtLocation={output} />;
  }

  return null;
}

export const WeatherToolPart = memo(PureWeatherToolPart);

// Create Document Tool Part
interface CreateDocumentToolPartProps {
  toolCallId: string;
  state: 'input-available' | 'output-available';
  input?: any;
  output?: any;
  isReadonly: boolean;
}

function PureCreateDocumentToolPart({
  toolCallId,
  state,
  input,
  output,
  isReadonly,
}: CreateDocumentToolPartProps) {
  if (state === 'input-available') {
    return <DocumentPreview isReadonly={isReadonly} args={input} />;
  }

  if (state === 'output-available') {
    if (output && 'error' in output) {
      return (
        <div className="text-red-500 p-2 border rounded">
          Error: {String(output.error)}
        </div>
      );
    }

    return <DocumentPreview isReadonly={isReadonly} result={output} />;
  }

  return null;
}

export const CreateDocumentToolPart = memo(PureCreateDocumentToolPart);

// Update Document Tool Part
interface UpdateDocumentToolPartProps {
  toolCallId: string;
  state: 'input-available' | 'output-available';
  input?: any;
  output?: any;
  isReadonly: boolean;
}

function PureUpdateDocumentToolPart({
  toolCallId,
  state,
  input,
  output,
  isReadonly,
}: UpdateDocumentToolPartProps) {
  if (state === 'input-available') {
    return <DocumentToolCall type="update" args={input} isReadonly={isReadonly} />;
  }

  if (state === 'output-available') {
    if (output && 'error' in output) {
      return (
        <div className="text-red-500 p-2 border rounded">
          Error: {String(output.error)}
        </div>
      );
    }

    return (
      <DocumentToolResult type="update" result={output} isReadonly={isReadonly} />
    );
  }

  return null;
}

export const UpdateDocumentToolPart = memo(PureUpdateDocumentToolPart);

// Request Suggestions Tool Part
interface RequestSuggestionsToolPartProps {
  toolCallId: string;
  state: 'input-available' | 'output-available';
  input?: any;
  output?: any;
  isReadonly: boolean;
}

function PureRequestSuggestionsToolPart({
  toolCallId,
  state,
  input,
  output,
  isReadonly,
}: RequestSuggestionsToolPartProps) {
  if (state === 'input-available') {
    return (
      <DocumentToolCall
        type="request-suggestions"
        args={input}
        isReadonly={isReadonly}
      />
    );
  }

  if (state === 'output-available') {
    if (output && 'error' in output) {
      return (
        <div className="text-red-500 p-2 border rounded">
          Error: {String(output.error)}
        </div>
      );
    }

    return (
      <DocumentToolResult
        type="request-suggestions"
        result={output}
        isReadonly={isReadonly}
      />
    );
  }

  return null;
}

export const RequestSuggestionsToolPart = memo(PureRequestSuggestionsToolPart);

// Enhanced Web Search Tool Part
interface EnhancedWebSearchToolPartProps {
  toolCallId: string;
  state: 'input-available' | 'output-available';
  input?: any;
  output?: any;
}

function PureEnhancedWebSearchToolPart({
  toolCallId,
  state,
  input,
  output,
}: EnhancedWebSearchToolPartProps) {
  if (state === 'input-available') {
    return (
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2">
        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 text-xs font-medium">
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          Searching for current information...
        </div>
      </div>
    );
  }

  if (state === 'output-available') {
    if (output?.error) {
      return (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-2">
          <div className="text-xs text-red-600 dark:text-red-400">
            Search error: {output.error}
          </div>
        </div>
      );
    }

    // Don't display sources here - they'll appear after the response
    return null;
  }

  return null;
}

export const EnhancedWebSearchToolPart = memo(PureEnhancedWebSearchToolPart);
