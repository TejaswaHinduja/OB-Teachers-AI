
import React, { useState, useEffect } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { FileText, Award, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AIFeedback, generateAIFeedback } from '@/services/aiService';
import { FeedbackDisplay } from '@/components/FeedbackDisplay';
import { ApiKeyPrompt } from '@/components/ApiKeyPrompt';

export function StudentDashboard() {
  const [submissions, setSubmissions] = useState<File[]>([]);
  const [feedbacks, setFeedbacks] = useState<AIFeedback[]>([]);
  const [submitting, setSubmitting] = useState(false);
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

  const handleSubmitAssignment = async (files: File[]) => {
    if (files.length === 0) return;
    
    // Check if API key is set
    if (!openaiApiKey && !(window as any).OPENAI_API_KEY) {
      toast.error('Please set your OpenAI API key first');
      return;
    }
    
    setSubmitting(true);
    setSubmissions(prev => [...prev, ...files]);
    
    try {
      toast.info("Submitting assignment...");
      
      // Generate AI feedback for each file
      const feedbackPromises = files.map(file => generateAIFeedback(file));
      const newFeedbacks = await Promise.all(feedbackPromises);
      
      setFeedbacks(prev => [...newFeedbacks, ...prev]);
      toast.success('Assignment submitted and automatically graded');
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast.error('Error submitting assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const getAverageGrade = () => {
    if (feedbacks.length === 0) return 'N/A';
    const total = feedbacks.reduce((sum, feedback) => sum + feedback.score, 0);
    return Math.round(total / feedbacks.length);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Student Dashboard</h1>
      
      {!openaiApiKey && <ApiKeyPrompt onApiKeySet={handleApiKeySet} />}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="flex items-center p-6">
            <FileText className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <h2 className="font-semibold">Submitted</h2>
              <p className="text-2xl font-bold">{submissions.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Award className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <h2 className="font-semibold">Average Grade</h2>
              <p className="text-2xl font-bold">{getAverageGrade()}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Clock className="h-8 w-8 text-orange-500" />
            <div className="ml-4">
              <h2 className="font-semibold">Pending</h2>
              <p className="text-2xl font-bold">{submissions.length - feedbacks.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-xl font-semibold">Submit Assignment</h2>
        </CardHeader>
        <CardContent>
          {submitting ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin mr-2" />
              <p>Processing your submission...</p>
            </div>
          ) : (
            <FileUpload onFileSelect={handleSubmitAssignment} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Assignment Feedback</h2>
        </CardHeader>
        <CardContent>
          {feedbacks.length > 0 ? (
            <div className="space-y-6">
              {feedbacks.map((feedback) => (
                <FeedbackDisplay key={feedback.id} feedback={feedback} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Award className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p>No feedback available yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
