
import { toast } from "@/components/ui/sonner";

// Types for AI feedback
export interface AIFeedback {
  id: string;
  fileName: string;
  score: number;
  feedback: string;
  strengths: string[];
  areasForImprovement: string[];
  timestamp: Date;
}

// Mock AI service for demonstration
// In a real application, this would connect to an actual AI API
export const generateAIFeedback = async (file: File): Promise<AIFeedback> => {
  // Simulating API call with a delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // For demo purposes, generate random feedback
  const score = Math.floor(Math.random() * 41) + 60; // 60-100 score
  const id = Math.random().toString(36).substring(2, 9);
  
  // Generate feedback based on file type
  let feedbackText = '';
  let strengths = [];
  let improvements = [];
  
  if (file.name.endsWith('.pdf')) {
    feedbackText = "This document demonstrates good structure and organization. The arguments are well-presented, though some citations could be improved.";
    strengths = [
      "Well-structured document with clear sections",
      "Good use of evidence to support arguments",
      "Proper formatting and presentation"
    ];
    improvements = [
      "Consider adding more recent references",
      "Some paragraphs could be more concise",
      "Expand on the conclusion to reinforce key points"
    ];
  } else if (file.name.match(/\.(jpg|jpeg|png)$/i)) {
    feedbackText = "The visual presentation is clear, with good use of color and contrast. The layout could be improved for better information hierarchy.";
    strengths = [
      "Clear visual elements",
      "Good use of color palette",
      "Effective communication of main concept"
    ];
    improvements = [
      "Consider adjusting the layout for better balance",
      "Text elements could be more readable",
      "Add more context to support the visual elements"
    ];
  } else {
    feedbackText = "This submission has been reviewed and shows good effort. There are some areas that could be improved for clarity and completeness.";
    strengths = [
      "Good overall effort",
      "Clear attempt to address the assignment requirements",
      "Logical organization of ideas"
    ];
    improvements = [
      "More detailed explanations would strengthen the work",
      "Consider adding more examples to illustrate key points",
      "Review for consistency throughout the submission"
    ];
  }
  
  return {
    id,
    fileName: file.name,
    score,
    feedback: feedbackText,
    strengths,
    areasForImprovement: improvements,
    timestamp: new Date(),
  };
};
