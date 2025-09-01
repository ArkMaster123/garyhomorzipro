'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Mail, Eye, Edit, Save, X, Plus, Loader2, Settings, BarChart3, Send, Database, Upload, FileText, Brain, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

interface EmailTemplate {
  id: string;
  name: string;
  type: 'welcome' | 'followUp';
  subject: string;
  htmlContent: string;
  dayNumber?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EmailSettings {
  welcomeEmailEnabled: boolean;
  followUpEmailsEnabled: boolean;
  day3Enabled: boolean;
  day7Enabled: boolean;
  day14Enabled: boolean;
  maxEmailsPerDay: number;
}

interface EmailStats {
  totalSent: number;
  welcomeSent: number;
  followUpSent: number;
  last7Days: { date: string; count: number }[];
  byType: { type: string; count: number }[];
}

interface KnowledgeBaseEntry {
  id: string;
  personaId: string;
  title: string;
  content: string;
  contentType: 'pdf' | 'text' | 'markdown';
  fileUrl?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface CostEstimate {
  modelId: string;
  modelName: string;
  costPerToken: number;
  estimatedTokens: number;
  estimatedCost: number;
  processingTime: string;
}

interface ChunkingSettings {
  strategy: 'fixed-size' | 'semantic' | 'sentence' | 'paragraph';
  chunkSize: number;
  overlap: number;
  maxChunks: number;
}

interface EmbeddingSettings {
  model: string;
  dimensions?: number;
  encodingFormat: 'float' | 'base64';
  normalize: boolean;
}

export default function AdminPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [previewData, setPreviewData] = useState({
    userName: 'John Doe',
    ideaTitle: 'FitMentor AI',
  });

  // Email settings state
  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    welcomeEmailEnabled: true,
    followUpEmailsEnabled: true,
    day3Enabled: true,
    day7Enabled: true,
    day14Enabled: true,
    maxEmailsPerDay: 100,
  });

  // Real email statistics (will be loaded from database)
  const [emailStats, setEmailStats] = useState<EmailStats>({
    totalSent: 0,
    welcomeSent: 0,
    followUpSent: 0,
    last7Days: [],
    byType: [],
  });

  // Knowledge Base state
  const [knowledgeBaseEntries, setKnowledgeBaseEntries] = useState<KnowledgeBaseEntry[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<'gary_hormozi' | 'rory_sutherland'>('gary_hormozi');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [costEstimate, setCostEstimate] = useState<CostEstimate | null>(null);
  const [selectedEmbeddingModel, setSelectedEmbeddingModel] = useState('openai:text-embedding-3-small');
  
  // Advanced settings
  const [chunkingSettings, setChunkingSettings] = useState<ChunkingSettings>({
    strategy: 'semantic', // Better default for PDFs
    chunkSize: 1200, // Slightly larger for better context
    overlap: 300, // More overlap for better continuity
    maxChunks: 50,
  });
  
  const [embeddingSettings, setEmbeddingSettings] = useState<EmbeddingSettings>({
    model: 'openai:text-embedding-3-small',
    dimensions: 1536,
    encodingFormat: 'float',
    normalize: true,
  });
  
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [deletingEntry, setDeletingEntry] = useState<string | null>(null);

  // Smart defaults based on content type
  const getSmartDefaults = (contentType: string, fileType?: string) => {
    const isPDF = contentType === 'pdf' || fileType === 'application/pdf';
    
    if (isPDF) {
      return {
        strategy: 'semantic' as const,
        chunkSize: 1200,
        overlap: 300,
        maxChunks: 50,
        model: 'openai:text-embedding-3-small',
        dimensions: 1536,
        encodingFormat: 'float' as const,
        normalize: true,
      };
    }
    
    // Default for text/markdown
    return {
      strategy: 'sentence' as const,
      chunkSize: 800,
      overlap: 200,
      maxChunks: 50,
      model: 'openai:text-embedding-3-small',
      dimensions: 1536,
      encodingFormat: 'float' as const,
      normalize: true,
    };
  };

  // Load templates from API
  useEffect(() => {
    loadTemplates();
    loadEmailStats();
    loadKnowledgeBase();
  }, []);

  useEffect(() => {
    loadKnowledgeBase();
  }, [selectedPersona]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/email-templates');
      const result = await response.json();
      
      if (result.success) {
        setTemplates(result.data);
      } else {
        toast({
          type: "error",
          description: "Failed to load email templates.",
        });
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        type: "error",
        description: "Failed to load email templates.",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadEmailStats = async () => {
    try {
      // TODO: Replace with real API call when email tracking is implemented
      // For now, show empty state
      setEmailStats({
        totalSent: 0,
        welcomeSent: 0,
        followUpSent: 0,
        last7Days: [],
        byType: [],
      });
    } catch (error) {
      console.error('Error loading email stats:', error);
    }
  };

  const loadKnowledgeBase = async () => {
    try {
      const response = await fetch(`/api/admin/knowledge-base?personaId=${selectedPersona}`);
      const result = await response.json();
      
      if (result.success) {
        setKnowledgeBaseEntries(result.data);
      } else {
        toast({
          type: "error",
          description: "Failed to load knowledge base entries.",
          
        });
      }
    } catch (error) {
      console.error('Error loading knowledge base:', error);
      toast({
        type: "error",
        description: "Failed to load knowledge base entries.",
        
      });
    }
  };

  const handleFileUpload = async (file: File, title: string, textContent?: string) => {
    try {
      setUploadingFile(true);
      const formData = new FormData();
      
      if (file) {
        formData.append('file', file);
        formData.append('contentType', file.type === 'application/pdf' ? 'pdf' : 'text');
      } else if (textContent) {
        formData.append('textContent', textContent);
        formData.append('contentType', 'text');
      }
      
      formData.append('personaId', selectedPersona);
      formData.append('title', title);
      formData.append('embeddingModel', selectedEmbeddingModel);
      
      // Add advanced settings
      formData.append('chunkingStrategy', chunkingSettings.strategy);
      formData.append('chunkSize', chunkingSettings.chunkSize.toString());
      formData.append('overlap', chunkingSettings.overlap.toString());
      formData.append('maxChunks', chunkingSettings.maxChunks.toString());
      formData.append('embeddingDimensions', embeddingSettings.dimensions?.toString() || '');
      formData.append('encodingFormat', embeddingSettings.encodingFormat);
      formData.append('normalizeEmbeddings', embeddingSettings.normalize.toString());

      const response = await fetch('/api/admin/knowledge-base/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          type: "success",
          description: `Knowledge base entry created with ${result.data.chunksCreated} chunks. Estimated cost: $${result.data.actualCost.toFixed(4)}`,
        });
        loadKnowledgeBase(); // Reload the list
      } else {
        toast({
          type: "error",
          description: result.error || "Failed to upload file.",
          
        });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        type: "error",
        description: "Failed to upload file.",
        
      });
    } finally {
      setUploadingFile(false);
    }
  };

  const estimateUploadCost = async (file?: File, textContent?: string) => {
    try {
      const formData = new FormData();
      
      if (file) {
        formData.append('file', file);
        formData.append('contentType', file.type === 'application/pdf' ? 'pdf' : 'text');
      } else if (textContent) {
        formData.append('textContent', textContent);
        formData.append('contentType', 'text');
      }
      
      formData.append('personaId', selectedPersona);
      formData.append('title', 'Cost Estimate');
      formData.append('embeddingModel', selectedEmbeddingModel);
      formData.append('estimateOnly', 'true');

      const response = await fetch('/api/admin/knowledge-base/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        const estimate = result.data.costEstimates.find((c: CostEstimate) => c.modelId === selectedEmbeddingModel);
        setCostEstimate(estimate || null);
      }
    } catch (error) {
      console.error('Error estimating cost:', error);
    }
  };

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate({ ...template });
  };

  const handleSave = async (template: EmailTemplate) => {
    try {
      setSaving(true);
      const response = await fetch('/api/admin/email-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template),
      });

      const result = await response.json();
      
      if (result.success) {
        setTemplates(templates.map(t => t.id === template.id ? result.data : t));
        setEditingTemplate(null);
        toast({
          type: "success",
          description: "Email template has been updated successfully.",
        });
      } else {
        toast({
          type: "error",
          description: result.error || "Failed to save template. Please try again.",
          
        });
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        type: "error",
        description: "Failed to save template. Please try again.",
        
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = (template: EmailTemplate) => {
    setPreviewTemplate(template);
  };

  const handleSettingChange = (setting: keyof EmailSettings, value: boolean | number) => {
    setEmailSettings(prev => ({
      ...prev,
      [setting]: value
    }));
    
    toast({
      type: "success",
      description: `Email setting "${setting}" has been updated.`,
    });
  };

  const handleVectorSearch = async () => {
    try {
      const queryInput = document.getElementById('search-query') as HTMLInputElement;
      const searchTypeInput = document.getElementById('search-type') as HTMLSelectElement;
      const limitInput = document.getElementById('search-limit') as HTMLInputElement;
      const thresholdInput = document.getElementById('search-threshold') as HTMLInputElement;
      const embeddingModelInput = document.getElementById('search-embedding-model') as HTMLSelectElement;
      const resultsContainer = document.getElementById('search-results') as HTMLDivElement;

      const query = queryInput?.value?.trim();
      if (!query) {
        toast({
          type: "error",
          description: "Please enter a search query.",
          
        });
        return;
      }

      // Show loading state
      resultsContainer.innerHTML = '<div class="flex items-center justify-center py-8"><Loader2 class="w-6 h-6 animate-spin mr-2" />Searching...</div>';

      const searchParams = {
        query,
        personaId: selectedPersona,
        searchType: searchTypeInput?.value || 'chunks',
        limit: parseInt(limitInput?.value || '5'),
        threshold: parseFloat(thresholdInput?.value || '0.7'),
        embeddingModel: embeddingModelInput?.value || 'openai:text-embedding-3-small',
      };

      const response = await fetch('/api/admin/knowledge-base/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchParams),
      });

      const result = await response.json();
      
      if (result.success) {
        displaySearchResults(result.data, resultsContainer);
      } else {
        resultsContainer.innerHTML = `<div class="text-center py-8 text-red-500">Error: ${result.error}</div>`;
        toast({
          type: "error",
          description: result.error || "Search failed.",
          
        });
      }
    } catch (error) {
      console.error('Error performing vector search:', error);
      const resultsContainer = document.getElementById('search-results') as HTMLDivElement;
      resultsContainer.innerHTML = '<div class="text-center py-8 text-red-500">Search failed. Please try again.</div>';
      toast({
        type: "error",
        description: "Search failed. Please try again.",
        
      });
    }
  };

  const displaySearchResults = (data: any, container: HTMLElement) => {
    const { results, query, searchType, totalResults, threshold } = data;
    
    if (results.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8 text-muted-foreground">
          <Search class="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No results found for "${query}"</p>
          <p class="text-sm">Try lowering the similarity threshold or using different keywords.</p>
        </div>
      `;
      return;
    }

    const resultsHtml = results.map((result: any, index: number) => {
      const similarity = (result.similarity * 100).toFixed(1);
      const content = result.content || result.text || '';
      const title = result.title || result.sourceTitle || 'Untitled';
      
      return `
        <div class="border rounded-lg p-4 bg-muted/30">
          <div class="flex items-start justify-between mb-2">
            <h4 class="font-semibold">${title}</h4>
            <Badge variant="secondary">${similarity}% match</Badge>
          </div>
          <p class="text-sm text-muted-foreground mb-2">
            ${searchType === 'chunks' ? `Chunk ${result.chunkIndex + 1}` : 'Full Document'}
          </p>
          <div class="text-sm bg-background p-3 rounded border">
            ${content.length > 300 ? content.substring(0, 300) + '...' : content}
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="font-medium">Search Results (${totalResults} found)</h3>
          <div class="text-sm text-muted-foreground">
            Threshold: ${(threshold * 100).toFixed(0)}%
          </div>
        </div>
        ${resultsHtml}
      </div>
    `;
  };

  const renderPreview = (template: EmailTemplate) => {
    const processedContent = template.htmlContent
      .replace(/{userName}/g, previewData.userName)
      .replace(/{ideaTitle}/g, previewData.ideaTitle);
    
    const processedSubject = template.subject
      .replace(/{userName}/g, previewData.userName)
      .replace(/{ideaTitle}/g, previewData.ideaTitle);

    return (
      <div className="space-y-4">
        <div>
          <Label>Subject</Label>
          <div className="p-3 bg-muted rounded-md font-medium">{processedSubject}</div>
        </div>
        <div>
          <Label>Preview</Label>
          <div 
            className="p-4 bg-white border rounded-md text-black"
            style={{ color: 'black' }}
            dangerouslySetInnerHTML={{ __html: processedContent }}
          />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading email templates...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your application settings and content</p>
        </div>
      </div>

      <Tabs defaultValue="emails" className="space-y-4">
        <TabsList>
          <TabsTrigger value="emails" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email Templates
          </TabsTrigger>
          <TabsTrigger value="knowledge-base" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Knowledge Base
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Email Settings
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="emails" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Idea Generator Email Templates</CardTitle>
              <CardDescription>
                Manage email templates for the idea generator. These emails are sent to users who generate business ideas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {templates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No email templates found.</p>
                  <p className="text-sm">Templates will appear here once they are created.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {templates.map((template) => (
                    <div key={template.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div>
                            <h3 className="font-semibold">{template.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={template.type === 'welcome' ? 'default' : 'secondary'}>
                                {template.type === 'welcome' ? 'Welcome' : 'Follow-up'}
                              </Badge>
                              {template.dayNumber && (
                                <Badge variant="outline">Day {template.dayNumber}</Badge>
                              )}
                              <Badge variant={template.isActive ? 'default' : 'secondary'}>
                                {template.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePreview(template)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(template)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                      </div>

                      {editingTemplate?.id === template.id && (
                        <div className="border-t pt-4 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="name">Template Name</Label>
                              <Input
                                id="name"
                                value={editingTemplate.name}
                                onChange={(e) => setEditingTemplate({
                                  ...editingTemplate,
                                  name: e.target.value
                                })}
                              />
                            </div>
                            <div>
                              <Label htmlFor="subject">Subject Line</Label>
                              <Input
                                id="subject"
                                value={editingTemplate.subject}
                                onChange={(e) => setEditingTemplate({
                                  ...editingTemplate,
                                  subject: e.target.value
                                })}
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="htmlContent">HTML Content</Label>
                            <Textarea
                              id="htmlContent"
                              value={editingTemplate.htmlContent}
                              onChange={(e) => setEditingTemplate({
                                ...editingTemplate,
                                htmlContent: e.target.value
                              })}
                              rows={10}
                              className="font-mono text-sm"
                            />
                            <p className="text-sm text-muted-foreground mt-2">
                              Use {'{userName}'} and {'{ideaTitle}'} as placeholders for dynamic content.
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <Button
                              onClick={() => handleSave(editingTemplate)}
                              disabled={saving}
                              className="flex items-center gap-2"
                            >
                              {saving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Save className="w-4 h-4" />
                              )}
                              {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setEditingTemplate(null)}
                              disabled={saving}
                              className="flex items-center gap-2"
                            >
                              <X className="w-4 h-4" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge-base" className="space-y-4">
          <div className="space-y-6">
            {/* Persona Selector */}
            <Card>
              <CardHeader>
                <CardTitle>AI Persona Knowledge Base</CardTitle>
                <CardDescription>
                  Upload and manage knowledge base content for Gary Hormozi and Rory Sutherland personas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                  <Label>Select Persona:</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={selectedPersona === 'gary_hormozi' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedPersona('gary_hormozi')}
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      Gary Hormozi
                    </Button>
                    <Button
                      variant={selectedPersona === 'rory_sutherland' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedPersona('rory_sutherland')}
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      Rory Sutherland
                    </Button>
                  </div>
                </div>

                {/* Upload Section */}
                <div className="border rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold">Upload New Content</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Embedding Model</Label>
                      <select
                        value={selectedEmbeddingModel}
                        onChange={(e) => setSelectedEmbeddingModel(e.target.value)}
                        className="w-full mt-1 p-2 border rounded"
                      >
                        <option value="openai:text-embedding-3-small">OpenAI Small ($0.02/M tokens)</option>
                        <option value="openai:text-embedding-3-large">OpenAI Large ($0.13/M tokens)</option>
                        <option value="openai:text-embedding-ada-002">OpenAI Ada-002 ($0.10/M tokens)</option>
                        <option value="google:text-embedding-004">Google Text ($0.03/M tokens)</option>
                      </select>
                    </div>
                    <div>
                      <Label>Title</Label>
                      <Input
                        placeholder="Enter content title"
                        id="knowledge-title"
                      />
                    </div>
                  </div>

                  {/* Advanced Settings Toggle */}
                  <div className="flex items-center justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      {showAdvancedSettings ? 'Hide' : 'Show'} Advanced Settings
                    </Button>
                  </div>

                  {/* Advanced Settings Panel */}
                  {showAdvancedSettings && (
                    <div className="border rounded-lg p-4 space-y-4 bg-muted/50">
                      <h4 className="font-medium">Advanced Configuration</h4>
                      
                      {/* Chunking Strategy */}
                      <div className="space-y-3">
                        <Label>Chunking Strategy</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm">Strategy</Label>
                            <select
                              value={chunkingSettings.strategy}
                              onChange={(e) => setChunkingSettings({
                                ...chunkingSettings,
                                strategy: e.target.value as any
                              })}
                              className="w-full mt-1 p-2 border rounded text-sm"
                            >
                              <option value="fixed-size">Fixed Size</option>
                              <option value="semantic">Semantic</option>
                              <option value="sentence">Sentence</option>
                              <option value="paragraph">Paragraph</option>
                            </select>
                          </div>
                          <div>
                            <Label className="text-sm">Max Chunks</Label>
                            <Input
                              type="number"
                              value={chunkingSettings.maxChunks}
                              onChange={(e) => setChunkingSettings({
                                ...chunkingSettings,
                                maxChunks: parseInt(e.target.value) || 50
                              })}
                              className="mt-1 text-sm"
                              min="1"
                              max="1000"
                            />
                          </div>
                        </div>
                        
                        {chunkingSettings.strategy === 'fixed-size' && (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm">Chunk Size (chars)</Label>
                              <Input
                                type="number"
                                value={chunkingSettings.chunkSize}
                                onChange={(e) => setChunkingSettings({
                                  ...chunkingSettings,
                                  chunkSize: parseInt(e.target.value) || 1000
                                })}
                                className="mt-1 text-sm"
                                min="100"
                                max="4000"
                              />
                            </div>
                            <div>
                              <Label className="text-sm">Overlap (chars)</Label>
                              <Input
                                type="number"
                                value={chunkingSettings.overlap}
                                onChange={(e) => setChunkingSettings({
                                  ...chunkingSettings,
                                  overlap: parseInt(e.target.value) || 200
                                })}
                                className="mt-1 text-sm"
                                min="0"
                                max="1000"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Embedding Settings */}
                      <div className="space-y-3">
                        <Label>Embedding Configuration</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm">Dimensions</Label>
                            <select
                              value={embeddingSettings.dimensions || ''}
                              onChange={(e) => setEmbeddingSettings({
                                ...embeddingSettings,
                                dimensions: e.target.value ? parseInt(e.target.value) : undefined
                              })}
                              className="w-full mt-1 p-2 border rounded text-sm"
                            >
                              <option value="">Default (1536/3072)</option>
                              <option value="256">256 (Fast)</option>
                              <option value="512">512 (Balanced)</option>
                              <option value="1024">1024 (High Quality)</option>
                              <option value="1536">1536 (Full Quality)</option>
                              <option value="3072">3072 (Large Model)</option>
                            </select>
                          </div>
                          <div>
                            <Label className="text-sm">Encoding Format</Label>
                            <select
                              value={embeddingSettings.encodingFormat}
                              onChange={(e) => setEmbeddingSettings({
                                ...embeddingSettings,
                                encodingFormat: e.target.value as 'float' | 'base64'
                              })}
                              className="w-full mt-1 p-2 border rounded text-sm"
                            >
                              <option value="float">Float (Default)</option>
                              <option value="base64">Base64 (Compact)</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="normalize-embeddings"
                            checked={embeddingSettings.normalize}
                            onCheckedChange={(checked) => setEmbeddingSettings({
                              ...embeddingSettings,
                              normalize: checked
                            })}
                          />
                          <Label htmlFor="normalize-embeddings" className="text-sm">
                            Normalize embeddings (recommended for similarity search)
                          </Label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* File Upload */}
                  <div className="space-y-2">
                    <Label>Upload File (PDF or Text)</Label>
                    <Input
                      type="file"
                      accept=".pdf,.txt,.md"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          await estimateUploadCost(file);
                        }
                      }}
                      id="knowledge-file"
                    />
                    <p className="text-sm text-muted-foreground">
                      Supports PDF, TXT, and Markdown files
                    </p>
                  </div>

                  {/* Or Text Input */}
                  <div className="space-y-2">
                    <Label>Or Enter Text Directly</Label>
                    <Textarea
                      placeholder="Paste your knowledge base content here..."
                      rows={6}
                      id="knowledge-text"
                      onChange={async (e) => {
                        const text = e.target.value;
                        if (text.trim().length > 100) {
                          await estimateUploadCost(undefined, text);
                        }
                      }}
                    />
                  </div>

                  {/* Cost Estimate */}
                  {costEstimate && (
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Cost Estimate</h4>
                      <div className="text-sm space-y-1">
                        <p><strong>Model:</strong> {costEstimate.modelName}</p>
                        <p><strong>Estimated Tokens:</strong> {costEstimate.estimatedTokens.toLocaleString()}</p>
                        <p><strong>Estimated Cost:</strong> ${costEstimate.estimatedCost.toFixed(4)}</p>
                        <p><strong>Processing Time:</strong> {costEstimate.processingTime}</p>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={async () => {
                      const titleInput = document.getElementById('knowledge-title') as HTMLInputElement;
                      const fileInput = document.getElementById('knowledge-file') as HTMLInputElement;
                      const textInput = document.getElementById('knowledge-text') as HTMLTextAreaElement;
                      
                      const title = titleInput?.value;
                      const file = fileInput?.files?.[0];
                      const text = textInput?.value;

                      if (!title) {
                        toast({
                          type: "error",
                          description: "Please enter a title.",
                          
                        });
                        return;
                      }

                      if (!file && !text?.trim()) {
                        toast({
                          type: "error", 
                          description: "Please upload a file or enter text content.",
                          
                        });
                        return;
                      }

                      await handleFileUpload(file!, title, text);
                      
                      // Clear form
                      titleInput.value = '';
                      fileInput.value = '';
                      textInput.value = '';
                      setCostEstimate(null);
                    }}
                    disabled={uploadingFile}
                    className="w-full"
                  >
                    {uploadingFile ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing & Creating Embeddings...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload & Process
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Knowledge Base Entries */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedPersona === 'gary_hormozi' ? 'Gary Hormozi' : 'Rory Sutherland'} Knowledge Base
                </CardTitle>
                <CardDescription>
                  Manage knowledge base entries for the selected persona
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    Loading knowledge base entries...
                  </div>
                ) : knowledgeBaseEntries.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No knowledge base entries found for {selectedPersona === 'gary_hormozi' ? 'Gary Hormozi' : 'Rory Sutherland'}.</p>
                    <p className="text-sm">Upload some content above to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {knowledgeBaseEntries.map((entry) => (
                      <div key={entry.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{entry.title}</h3>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">
                                {entry.contentType.toUpperCase()}
                              </Badge>
                              <Badge variant="secondary">
                                {entry.content.length.toLocaleString()} chars
                              </Badge>
                              {entry.metadata?.chunkCount && (
                                <Badge variant="secondary">
                                  {entry.metadata.chunkCount} chunks
                                </Badge>
                              )}
                              {entry.metadata?.actualCost && (
                                <Badge variant="secondary">
                                  ${entry.metadata.actualCost.toFixed(4)} cost
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                              Created: {new Date(entry.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2 break-words">
                              {entry.content.length > 150 ? entry.content.substring(0, 150) + '...' : entry.content}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {entry.fileUrl && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(entry.fileUrl, '_blank')}
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                View File
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              disabled={deletingEntry === entry.id}
                              onClick={async () => {
                                if (window.confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
                                  setDeletingEntry(entry.id);
                                  try {
                                    const response = await fetch(`/api/admin/knowledge-base/${entry.id}`, {
                                      method: 'DELETE',
                                    });
                                    const result = await response.json();
                                    if (result.success) {
                                      toast({
                                        type: "success",
                                        description: "Knowledge base entry deleted successfully.",
                                      });
                                      loadKnowledgeBase();
                                    } else {
                                      toast({
                                        type: "error",
                                        description: result.error || "Failed to delete entry.",
                                        
                                      });
                                    }
                                  } catch (error) {
                                    console.error('Delete error:', error);
                                    toast({
                                      type: "error",
                                      description: "Failed to delete entry. Please try again.",
                                      
                                    });
                                  } finally {
                                    setDeletingEntry(null);
                                  }
                                }
                              }}
                            >
                              {deletingEntry === entry.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <X className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Vector Search Interface */}
            <Card>
              <CardHeader>
                <CardTitle>Vector Similarity Search</CardTitle>
                <CardDescription>
                  Search through knowledge base using semantic similarity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Search Query</Label>
                      <Input
                        placeholder="Enter your search query..."
                        id="search-query"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleVectorSearch();
                          }
                        }}
                      />
                    </div>
                    <div>
                      <Label>Search Type</Label>
                      <select
                        id="search-type"
                        className="w-full mt-1 p-2 border rounded"
                        defaultValue="chunks"
                      >
                        <option value="chunks">Chunks (Granular)</option>
                        <option value="documents">Documents (Full)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Results Limit</Label>
                      <Input
                        type="number"
                        id="search-limit"
                        defaultValue="5"
                        min="1"
                        max="20"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Similarity Threshold</Label>
                      <Input
                        type="number"
                        id="search-threshold"
                        defaultValue="0.7"
                        min="0"
                        max="1"
                        step="0.1"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Embedding Model</Label>
                      <select
                        id="search-embedding-model"
                        className="w-full mt-1 p-2 border rounded"
                        defaultValue="openai:text-embedding-3-small"
                      >
                        <option value="openai:text-embedding-3-small">OpenAI Small</option>
                        <option value="openai:text-embedding-3-large">OpenAI Large</option>
                        <option value="openai:text-embedding-ada-002">OpenAI Ada-002</option>
                        <option value="google:text-embedding-004">Google Text</option>
                      </select>
                    </div>
                  </div>

                  <Button
                    onClick={handleVectorSearch}
                    className="w-full"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Search Knowledge Base
                  </Button>

                  {/* Search Results */}
                  <div id="search-results" className="space-y-4">
                    {/* Results will be populated here */}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>
                Configure which emails are sent and when. Disable emails you don't want to send.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Welcome Email</Label>
                    <p className="text-sm text-muted-foreground">Send welcome email immediately after idea generation</p>
                  </div>
                  <Switch
                    checked={emailSettings.welcomeEmailEnabled}
                    onCheckedChange={(checked) => handleSettingChange('welcomeEmailEnabled', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Follow-up Emails</Label>
                      <p className="text-sm text-muted-foreground">Enable all follow-up email sequences</p>
                    </div>
                    <Switch
                      checked={emailSettings.followUpEmailsEnabled}
                      onCheckedChange={(checked) => handleSettingChange('followUpEmailsEnabled', checked)}
                    />
                  </div>
                  
                  {emailSettings.followUpEmailsEnabled && (
                    <div className="ml-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm">Day 3 Follow-up</Label>
                          <p className="text-xs text-muted-foreground">Check-in email after 3 days</p>
                        </div>
                        <Switch
                          checked={emailSettings.day3Enabled}
                          onCheckedChange={(checked) => handleSettingChange('day3Enabled', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm">Day 7 Follow-up</Label>
                          <p className="text-xs text-muted-foreground">Progress check after 1 week</p>
                        </div>
                        <Switch
                          checked={emailSettings.day7Enabled}
                          onCheckedChange={(checked) => handleSettingChange('day7Enabled', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm">Day 14 Follow-up</Label>
                          <p className="text-xs text-muted-foreground">Final push after 2 weeks</p>
                        </div>
                        <Switch
                          checked={emailSettings.day14Enabled}
                          onCheckedChange={(checked) => handleSettingChange('day14Enabled', checked)}
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Daily Email Limit</Label>
                    <p className="text-sm text-muted-foreground">Maximum emails sent per day</p>
                  </div>
                  <Input
                    type="number"
                    value={emailSettings.maxEmailsPerDay}
                    onChange={(e) => handleSettingChange('maxEmailsPerDay', parseInt(e.target.value) || 100)}
                    className="w-24"
                    min="1"
                    max="1000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Emails Sent</CardTitle>
                <Send className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{emailStats.totalSent.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {emailStats.totalSent === 0 ? 'No emails sent yet' : 'Tracked from database'}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Welcome Emails</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{emailStats.welcomeSent.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {emailStats.totalSent === 0 ? 'No data yet' : `${Math.round((emailStats.welcomeSent / emailStats.totalSent) * 100)}% of total`}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Follow-up Emails</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{emailStats.followUpSent.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {emailStats.totalSent === 0 ? 'No data yet' : `${Math.round((emailStats.followUpSent / emailStats.totalSent) * 100)}% of total`}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Emails Sent Last 7 Days</CardTitle>
                <CardDescription>Daily email volume</CardDescription>
              </CardHeader>
              <CardContent>
                {emailStats.last7Days.length === 0 ? (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No email data available</p>
                      <p className="text-sm">Email tracking will appear here once emails are sent</p>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={emailStats.last7Days}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Emails by Type</CardTitle>
                <CardDescription>Breakdown of email types sent</CardDescription>
              </CardHeader>
              <CardContent>
                {emailStats.byType.length === 0 ? (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    <div className="text-center">
                      <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No email data available</p>
                      <p className="text-sm">Email tracking will appear here once emails are sent</p>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={emailStats.byType}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Email Tracking Setup</CardTitle>
              <CardDescription>To track real email statistics, implement email logging</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Next Steps for Real Analytics:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Create email_logs table in database</li>
                    <li>• Log email sends in transporter.ts</li>
                    <li>• Create API endpoint for email statistics</li>
                    <li>• Implement daily/weekly aggregation</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Email Preview</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewTemplate(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Preview User Name</Label>
                  <Input
                    value={previewData.userName}
                    onChange={(e) => setPreviewData({
                      ...previewData,
                      userName: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label>Preview Idea Title</Label>
                  <Input
                    value={previewData.ideaTitle}
                    onChange={(e) => setPreviewData({
                      ...previewData,
                      ideaTitle: e.target.value
                    })}
                  />
                </div>
              </div>
              <Separator />
              {renderPreview(previewTemplate)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
