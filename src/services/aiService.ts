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
  summary?: string;
}

// Flag to indicate if we're using the free model
let useDefaultModel = false;

export const setUseDefaultModel = (value: boolean) => {
  useDefaultModel = value;
};

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

// Generate text summary using either OpenAI or the free model
export const generateSummary = async (text: string): Promise<string> => {
  // Get API key from window object (set by the dashboard components)
  const apiKey = (window as any).OPENAI_API_KEY || localStorage.getItem('openai_api_key');
  
  // If user opted for free model or no API key is available, use free model
  if (useDefaultModel || !apiKey) {
    return await generateFreeModelSummary(text);
  }
  
  // Otherwise use OpenAI
  try {
    // Truncate text if it's too long for the API
    const maxLength = 15000;
    const truncatedText = text.length > maxLength 
      ? text.substring(0, maxLength) + "..." 
      : text;
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that provides concise and informative summaries of documents."
          },
          {
            role: "user",
            content: `Please provide a comprehensive summary of the following document. Include the main points, key arguments, and any important conclusions: \n\n${truncatedText}`
          }
        ],
        max_tokens: 1000,
        temperature: 0.5
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating summary with OpenAI:', error);
    toast.error(`Failed to generate summary with OpenAI. Falling back to free model.`);
    return await generateFreeModelSummary(text);
  }
};

// Free model summary generation using Hugging Face Inference API
const generateFreeModelSummary = async (text: string): Promise<string> => {
  try {
    // Limit text to a reasonable length for the API
    const maxLength = 10000;
    const truncatedText = text.length > maxLength 
      ? text.substring(0, maxLength) + "..." 
      : text;
    
    // Using Hugging Face's free public API endpoint with a summarization model
    const response = await fetch("https://api-inference.huggingface.co/models/facebook/bart-large-cnn", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: truncatedText,
        parameters: {
          max_length: 1000,
          min_length: 100,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.statusText}`);
    }

    const result = await response.json();
    
    let summary = "";
    
    if (Array.isArray(result) && result.length > 0 && result[0].summary_text) {
      summary = result[0].summary_text;
    } else if (typeof result === 'string') {
      summary = result;
    } else {
      // Fallback to extractive summary when API fails
      return generateFallbackSummary(text);
    }
    
    // Add document stats
    const paragraphs = text.split('\n').filter(p => p.trim().length > 0);
    const wordCount = text.split(/\s+/).length;
    
    return `${summary}\n\nDocument Statistics: ${paragraphs.length} paragraphs, approximately ${wordCount} words.`;
  } catch (error) {
    console.error('Error with free model summary:', error);
    // Fallback to extractive summary
    return generateFallbackSummary(text);
  }
};

// Fallback extractive summary when both APIs fail
const generateFallbackSummary = (text: string): string => {
  // Process a portion of the text
  const maxLength = 10000;
  const truncatedText = text.substring(0, maxLength);
  
  // Split into paragraphs and filter out empty ones
  const paragraphs = truncatedText.split('\n').filter(p => p.trim().length > 0);
  
  // Get more paragraphs for the summary
  const significantParagraphs = paragraphs.slice(0, Math.min(5, paragraphs.length));
  
  // Create a more detailed summary
  let summary = "Document Summary:\n\n";
  
  // Add the first few paragraphs
  summary += significantParagraphs.join('\n\n');
  
  // Add information about document length
  summary += `\n\nThis document contains ${paragraphs.length} paragraphs and approximately ${text.split(/\s+/).length} words.`;
  
  return summary;
};

// Generate AI feedback
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
      
      // Generate summary using real AI API
      summary = await generateSummary(pdfText);
      
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
