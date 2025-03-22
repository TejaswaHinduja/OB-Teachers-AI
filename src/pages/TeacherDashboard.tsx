
import React, { useState, useEffect } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Users, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AIFeedback, generateAIFeedback } from '@/services/aiService';
import { FeedbackDisplay } from '@/components/FeedbackDisplay';
import { ApiKeyPrompt } from '@/components/ApiKeyPrompt';

export function TeacherDashboard() {
  const [assignments, setAssignments] = useState<File[]>([]);
  const [feedbacks, setFeedbacks] = useState<AIFeedback[]>([]);
  const [gradingInProgress, setGradingInProgress] = useState<{[key: string]: boolean}>({});
  const [openaiApiKey, setOpenaiApiKey] = useState<string>('');
  
  // Check for saved API key on component mount
  useEffect(() => {
    const savedKey = localStorage.getItem('openai_api_key');
    if (savedKey) {
      setOpenaiApiKey(savedKey);
    }
  }, []);

  // Save API key to localStorage when it changes
  const handleApiKeySet = (apiKey: string) => {
    setOpenaiApiKey(apiKey);
    localStorage.setItem('openai_api_key', apiKey);
    
    // Update global API key in window object for the aiService to access
    (window as any).OPENAI_API_KEY = apiKey;
  };

  const handleFileSelect = (files: File[]) => {
    setAssignments(prev => [...prev, ...files]);
    toast.success(`${files.length} file(s) uploaded successfully`);
  };

  const handleGradeAssignment = async (file: File, index: number) => {
    const fileId = `${file.name}-${index}`;
    
    // Check if API key is set
    if (!openaiApiKey && !(window as any).OPENAI_API_KEY) {
      toast.error('Please set your OpenAI API key first');
      return;
    }
    
    // Check if already grading
    if (gradingInProgress[fileId]) return;
    
    // Set grading in progress
    setGradingInProgress(prev => ({ ...prev, [fileId]: true }));
    
    try {
      toast.info(`AI is analyzing ${file.name}...`);
      
      // Generate AI feedback
      const feedback = await generateAIFeedback(file);
      
      // Add feedback to the list
      setFeedbacks(prev => [feedback, ...prev]);
      
      toast.success(`AI feedback generated for ${file.name}`);
    } catch (error) {
      console.error('Error generating feedback:', error);
      toast.error(`Failed to generate feedback for ${file.name}`);
    } finally {
      // Clear grading status
      setGradingInProgress(prev => {
        const newState = { ...prev };
        delete newState[fileId];
        return newState;
      });
    }
  };

  const getGradedCount = () => {
    return feedbacks.length;
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Teacher Dashboard</h1>
      
      {!openaiApiKey && <ApiKeyPrompt onApiKeySet={handleApiKeySet} />}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="flex items-center p-6">
            <FileText className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <h2 className="font-semibold">Total Assignments</h2>
              <p className="text-2xl font-bold">{assignments.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <h2 className="font-semibold">Students</h2>
              <p className="text-2xl font-bold">0</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <CheckCircle className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <h2 className="font-semibold">Graded</h2>
              <p className="text-2xl font-bold">{getGradedCount()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-xl font-semibold">Upload Assignment</h2>
        </CardHeader>
        <CardContent>
          <FileUpload onFileSelect={handleFileSelect} />
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-xl font-semibold">Recent Assignments</h2>
        </CardHeader>
        <CardContent>
          {assignments.length > 0 ? (
            <div className="space-y-4">
              {assignments.map((file, index) => {
                const fileId = `${file.name}-${index}`;
                const isGrading = gradingInProgress[fileId];
                
                return (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-500" />
                      <span className="ml-2 text-sm font-medium">{file.name}</span>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => handleGradeAssignment(file, index)}
                      disabled={isGrading || !openaiApiKey}
                    >
                      {isGrading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Grading...
                        </>
                      ) : (
                        'Grade with AI'
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No assignments uploaded yet</p>
          )}
        </CardContent>
      </Card>

      {feedbacks.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">AI-Generated Feedback</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {feedbacks.map((feedback) => (
                <FeedbackDisplay key={feedback.id} feedback={feedback} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
