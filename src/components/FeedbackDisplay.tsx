
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AIFeedback } from '@/services/aiService';
import { FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface FeedbackDisplayProps {
  feedback: AIFeedback;
}

export function FeedbackDisplay({ feedback }: FeedbackDisplayProps) {
  const [showSummary, setShowSummary] = useState(false);

  // Format date to a readable string
  const formattedDate = new Date(feedback.timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Get grade label and color based on score
  const getGradeInfo = (score: number) => {
    if (score >= 90) return { label: 'Excellent', color: 'bg-green-500' };
    if (score >= 80) return { label: 'Good', color: 'bg-blue-500' };
    if (score >= 70) return { label: 'Satisfactory', color: 'bg-yellow-500' };
    if (score >= 60) return { label: 'Needs Improvement', color: 'bg-orange-500' };
    return { label: 'Unsatisfactory', color: 'bg-red-500' };
  };

  const gradeInfo = getGradeInfo(feedback.score);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-gray-500" />
              <span className="font-medium text-gray-900">{feedback.fileName}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-gray-600">
                {formattedDate}
              </Badge>
              <Badge className={`${gradeInfo.color} text-white hover:${gradeInfo.color}`}>
                {feedback.score}/100
              </Badge>
            </div>
          </div>
        </div>
        
        {feedback.summary && (
          <div className="px-4 pt-3">
            <Collapsible open={showSummary} onOpenChange={setShowSummary}>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="p-0 h-auto flex items-center text-blue-600 hover:text-blue-800 hover:bg-transparent"
                >
                  <span className="font-medium">Document Summary</span>
                  {showSummary ? (
                    <ChevronUp className="ml-1 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-1 h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <ScrollArea className="mt-2 p-3 bg-gray-50 rounded-md h-[200px] text-sm text-gray-700">
                  <p className="whitespace-pre-line">
                    {feedback.summary}
                  </p>
                </ScrollArea>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}
        
        <div className="p-4">
          <h3 className="font-semibold mb-2">Feedback</h3>
          <p className="text-gray-700 mb-4">{feedback.feedback}</p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-green-700 mb-2">Strengths</h4>
              <ul className="list-disc pl-5 space-y-1">
                {feedback.strengths.map((strength, index) => (
                  <li key={index} className="text-sm text-gray-600">{strength}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-orange-700 mb-2">Areas for Improvement</h4>
              <ul className="list-disc pl-5 space-y-1">
                {feedback.areasForImprovement.map((area, index) => (
                  <li key={index} className="text-sm text-gray-600">{area}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
