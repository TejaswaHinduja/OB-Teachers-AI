
import React from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { AIFeedback } from '../services/aiService';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';

interface FeedbackDisplayProps {
  feedback: AIFeedback;
}

export function FeedbackDisplay({ feedback }: FeedbackDisplayProps) {
  // Determine score color based on the grade
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <h3 className="text-lg font-bold">{feedback.fileName}</h3>
          <p className="text-sm text-gray-500">
            {feedback.timestamp.toLocaleDateString()} at {feedback.timestamp.toLocaleTimeString()}
          </p>
        </div>
        <div>
          <Badge variant="outline" className={`text-lg font-bold ${getScoreColor(feedback.score)}`}>
            Score: {feedback.score}/100
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-gray-700">{feedback.feedback}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-green-700 flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Strengths
            </h4>
            <ul className="list-disc pl-5 space-y-1">
              {feedback.strengths.map((strength, index) => (
                <li key={index} className="text-sm">{strength}</li>
              ))}
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold text-amber-700 flex items-center">
              <XCircle className="h-4 w-4 mr-2" />
              Areas for Improvement
            </h4>
            <ul className="list-disc pl-5 space-y-1">
              {feedback.areasForImprovement.map((area, index) => (
                <li key={index} className="text-sm">{area}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
