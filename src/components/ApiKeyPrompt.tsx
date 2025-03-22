
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ApiKeyPromptProps {
  onApiKeySet: (apiKey: string) => void;
  onUseDefaultModel: () => void;
}

export function ApiKeyPrompt({ onApiKeySet, onUseDefaultModel }: ApiKeyPromptProps) {
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      toast.error('Please enter a valid API key');
      return;
    }
    
    // Check if it looks like an OpenAI key (starts with "sk-" and is long enough)
    if (!apiKey.startsWith('sk-') || apiKey.length < 20) {
      toast.warning('The API key format doesn\'t look right. OpenAI keys typically start with "sk-"');
    }
    
    onApiKeySet(apiKey);
    toast.success('API key saved');
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>AI Model Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="free">
          <TabsList className="mb-4">
            <TabsTrigger value="free">Use Free Model</TabsTrigger>
            <TabsTrigger value="openai">Use OpenAI (Your Key)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="free">
            <div className="space-y-4">
              <p className="text-sm text-gray-700">
                Use our provided free AI model for basic summarization. No API key required.
              </p>
              <Button onClick={onUseDefaultModel}>Continue with Free Model</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="openai">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="apiKey" className="text-sm font-medium">
                  Enter your OpenAI API Key
                </label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  Your API key is used only in your browser and is not stored on any server.
                </p>
              </div>
              <Button type="submit">Save API Key</Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
