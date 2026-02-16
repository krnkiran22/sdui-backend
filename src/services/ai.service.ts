import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import env from '../config/env';
import { AppError } from '../middleware/error.middleware';
import { PageJSON } from '../types/page.types';

export class AIService {
  private anthropic: Anthropic | null = null;
  private groq: OpenAI | null = null;

  constructor() {
    if (env.anthropicApiKey) {
      this.anthropic = new Anthropic({
        apiKey: env.anthropicApiKey,
      });
    }

    if (env.groqApiKey) {
      this.groq = new OpenAI({
        apiKey: env.groqApiKey,
        baseURL: 'https://api.groq.com/openai/v1',
      });
    }

    if (!this.anthropic && !this.groq) {
      console.warn('⚠️ No AI API keys configured. AI features will be disabled.');
    }
  }

  private async getChatCompletion(prompt: string, jsonMode: boolean = false): Promise<string> {
    if (this.anthropic) {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: jsonMode ? 2000 : 1000,
        messages: [{ role: 'user', content: prompt }],
      });
      return message.content[0].type === 'text' ? message.content[0].text : '';
    } else if (this.groq) {
      console.log(`Calling Groq using model: openai/gpt-oss-20b ${jsonMode ? '(JSON Mode)' : ''}`);
      const response = await this.groq.chat.completions.create({
        model: 'openai/gpt-oss-20b',
        messages: [{ role: 'user', content: prompt }],
        response_format: jsonMode ? { type: 'json_object' } : undefined,
      });
      return response.choices[0].message.content || '';
    }
    throw new AppError('AI service not configured', 503, 'AI_NOT_CONFIGURED');
  }

  // Process natural language command
  async processCommand(command: string, context: any): Promise<{
    success: boolean;
    operation?: any;
    error?: string;
  }> {
    try {
      const prompt = `You are an AI assistant for a website builder.
    
User command: "${command}"

Current page context:
${JSON.stringify(context, null, 2)}

Analyze the command and generate a JSON operation to execute it.

Response format:
{
  "action": "insert" | "update" | "delete" | "move",
  "component": {
    "type": "ComponentType",
    "props": {...},
    "position": "append" | "prepend" | number
  }
}

Only respond with valid JSON, no explanations.`;

      const responseText = await this.getChatCompletion(prompt, true);
      const jsonOperation = JSON.parse(responseText);

      return {
        success: true,
        operation: jsonOperation,
      };
    } catch (error) {
      console.error('AI command processing error:', error);
      return {
        success: false,
        error: 'Failed to process command',
      };
    }
  }

  // Generate content
  async generateContent(type: string, params: any): Promise<{
    success: boolean;
    content?: string;
    error?: string;
  }> {
    try {
      let prompt = '';

      switch (type) {
        case 'department':
          prompt = `Write a professional 200-word description for the ${params.departmentName} department at ${params.collegeName}.
        
Include:
- Overview of the department
- Programs offered: ${params.programs.join(', ')}
- Key focus areas
- Career opportunities

Write in a professional, inspiring tone suitable for a college website.`;
          break;

        case 'event':
          prompt = `Write a 100-word description for this event:
        
Event Name: ${params.eventName}
Date: ${params.eventDate}
Type: ${params.eventType}

Include key highlights and who should attend.`;
          break;

        case 'course':
          prompt = `Write a 150-word description for this course:
        
Course Name: ${params.courseName}
Level: ${params.level}
Duration: ${params.duration}

Include course objectives, key topics, and expected outcomes.`;
          break;

        case 'faculty':
          prompt = `Write a 150-word professional biography for:
        
Name: ${params.name}
Position: ${params.position}
Department: ${params.department}
Specialization: ${params.specialization}

Include education, research interests, and achievements.`;
          break;

        default:
          prompt = `Generate professional content for: ${JSON.stringify(params)}`;
      }

      const content = await this.getChatCompletion(prompt);

      return {
        success: true,
        content,
      };
    } catch (error) {
      console.error('Content generation error:', error);
      return {
        success: false,
        error: 'Failed to generate content',
      };
    }
  }

  // Suggest improvements
  async suggestImprovements(pageJSON: PageJSON): Promise<{
    success: boolean;
    suggestions?: any[];
    error?: string;
  }> {
    try {
      const prompt = `Analyze this website page structure and suggest improvements:

${JSON.stringify(pageJSON, null, 2)}

Check for:
1. Missing important sections (About, Contact, etc.)
2. Accessibility issues
3. SEO optimization
4. Design best practices
5. Educational institution requirements (AICTE/UGC compliance)

Respond with JSON array of suggestions:
[
  {
    "priority": "critical" | "important" | "recommended",
    "category": "accessibility" | "seo" | "design" | "compliance",
    "issue": "Description of the issue",
    "suggestion": "How to fix it",
    "autoFix": true/false
  }
]

Only respond with valid JSON array.`;

      const responseText = await this.getChatCompletion(prompt, true);
      const suggestions = JSON.parse(responseText);

      return {
        success: true,
        suggestions,
      };
    } catch (error) {
      console.error('Suggestion generation error:', error);
      return {
        success: false,
        error: 'Failed to generate suggestions',
      };
    }
  }

  // Validate design
  async validateDesign(pageJSON: PageJSON): Promise<{
    success: boolean;
    isValid?: boolean;
    issues?: any[];
    error?: string;
  }> {
    try {
      const prompt = `Validate this website page for compliance and best practices:

${JSON.stringify(pageJSON, null, 2)}

Check for:
1. WCAG 2.1 accessibility compliance
2. SEO requirements (meta tags, headings, etc.)
3. Educational institution compliance
4. Mobile responsiveness considerations
5. Performance issues

Respond with JSON:
{
  "isValid": true/false,
  "issues": [
    {
      "severity": "error" | "warning" | "info",
      "category": "accessibility" | "seo" | "compliance" | "performance",
      "message": "Issue description"
    }
  ]
}

Only respond with valid JSON.`;

      const responseText = await this.getChatCompletion(prompt, true);
      const validation = JSON.parse(responseText);

      return {
        success: true,
        isValid: validation.isValid,
        issues: validation.issues,
      };
    } catch (error) {
      console.error('Design validation error:', error);
      return {
        success: false,
        error: 'Failed to validate design',
      };
    }
  }

  // Generate a new component using Groq
  async generateComponent(prompt: string): Promise<{
    success: boolean;
    component?: {
      name: string;
      description: string;
      type: string;
      props: any;
      jsxCode: string;
    };
    error?: string;
  }> {
    if (!this.groq) {
      throw new AppError('Groq AI service not configured', 503, 'AI_NOT_CONFIGURED');
    }

    try {
      const systemPrompt = `You are an expert React and Craft.js developer.
Generate a new reusable component based on the user's request.
The component should be compatible with Craft.js.

Response MUST be a JSON object with this exact structure:
{
  "name": "Readable Name",
  "description": "Short description of what it does",
  "type": "Button",
  "props": {
    "title": "...",
    "subtitle": "...",
    "content": "...",
    "backgroundColor": "...",
    "textColor": "...",
    "alignment": "left|center|right"
  },
  "jsxCode": "..."
}

You can use these existing types: HeroBanner, TextBlock, Container, AboutSection, Statistics, FacultyGrid, FAQAccordion, ContactForm, DynamicSection, Button.
Only return valid JSON. Do not include markdown code blocks or explanations.`;

      console.log(`Generating component with Groq using model: openai/gpt-oss-20b`);
      const response = await this.groq.chat.completions.create({
        model: 'openai/gpt-oss-20b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' }
      });

      const responseText = response.choices[0].message.content || '{}';
      const componentData = JSON.parse(responseText);

      return {
        success: true,
        component: componentData,
      };
    } catch (error) {
      console.error('Groq component generation error:', error);
      return {
        success: false,
        error: 'Failed to generate component using Groq',
      };
    }
  }
}

export default new AIService();
