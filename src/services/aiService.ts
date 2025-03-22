
import { toast } from 'sonner';
import * as pdfjs from 'pdfjs-dist';

// Set up PDF.js worker
const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.entry');
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// Types for AI feedback
export interface AIFeedback {
  id: string;
  fileName: string;
  score: number;
  feedback: string;
  strengths: string[];
  areasForImprovement: string[];
  timestamp: Date;
  summary?: string; // Add summary field
}

// Extract text from PDF files
export const extractPdfText = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const textItems = content.items.map((item: any) => item.str);
      fullText += textItems.join(' ') + '\n';
    }
    
    return fullText;
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

// Generate text summary
const generateSummary = (text: string): string => {
  // Limit text length for processing
  const truncatedText = text.substring(0, 5000);
  
  // For demonstration, create a simple summary based on first few paragraphs
  // In a real app, you would use an AI API here
  const paragraphs = truncatedText.split('\n').filter(p => p.trim().length > 0);
  const firstFewParagraphs = paragraphs.slice(0, 3).join('\n');
  
  // Create a summary that extracts main points
  const sentences = firstFewParagraphs.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const topSentences = sentences.slice(0, 5).join('. ');
  
  return topSentences + (sentences.length > 5 ? '...' : '');
};

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
  let summary = '';
  
  if (file.name.endsWith('.pdf')) {
    try {
      // Extract text from PDF
      const pdfText = await extractPdfText(file);
      
      // Generate summary from text
      summary = generateSummary(pdfText);
      
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
    } catch (error) {
      console.error('Error processing PDF:', error);
      toast.error('Error extracting text from PDF');
      
      feedbackText = "We were unable to fully process this PDF. Please ensure it contains selectable text and try again.";
      strengths = ["Document was successfully uploaded"];
      improvements = ["Try uploading a PDF with selectable text rather than scanned images"];
    }
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
    summary: summary || undefined,
  };
};
