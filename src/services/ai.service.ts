import Anthropic from '@anthropic-ai/sdk';
import env from '../config/env';
import { AppError } from '../middleware/error.middleware';
import { PageJSON } from '../types/page.types';

export class AIService {
  private anthropic: Anthropic | null = null;

  constructor() {
    if (env.anthropicApiKey) {
      this.anthropic = new Anthropic({
        apiKey: env.anthropicApiKey,
      });
    } else {
      console.warn('⚠️ Anthropic API key not configured. AI features will be disabled.');
    }
  }

  // Process natural language command
  async processCommand(command: string, context: any): Promise<{
    success: boolean;
    operation?: any;
    error?: string;
  }> {
    if (!this.anthropic) {
      throw new AppError('AI service not configured', 503, 'AI_NOT_CONFIGURED');
    }

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

      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          { role: 'user', content: prompt }
        ],
      });

      const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

      try {
        const jsonOperation = JSON.parse(responseText);
        return {
          success: true,
          operation: jsonOperation,
        };
      } catch (parseError) {
        return {
          success: false,
          error: 'Failed to parse AI response',
        };
      }
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
    if (!this.anthropic) {
      throw new AppError('AI service not configured', 503, 'AI_NOT_CONFIGURED');
    }

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

      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages: [
          { role: 'user', content: prompt }
        ],
      });

      const content = message.content[0].type === 'text' ? message.content[0].text : '';

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
    if (!this.anthropic) {
      throw new AppError('AI service not configured', 503, 'AI_NOT_CONFIGURED');
    }

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

      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [
          { role: 'user', content: prompt }
        ],
      });

      const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

      try {
        const suggestions = JSON.parse(responseText);
        return {
          success: true,
          suggestions,
        };
      } catch (parseError) {
        return {
          success: false,
          error: 'Failed to parse suggestions',
        };
      }
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
    if (!this.anthropic) {
      throw new AppError('AI service not configured', 503, 'AI_NOT_CONFIGURED');
    }

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

      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        messages: [
          { role: 'user', content: prompt }
        ],
      });

      const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

      try {
        const validation = JSON.parse(responseText);
        return {
          success: true,
          isValid: validation.isValid,
          issues: validation.issues,
        };
      } catch (parseError) {
        return {
          success: false,
          error: 'Failed to parse validation response',
        };
      }
    } catch (error) {
      console.error('Design validation error:', error);
      return {
        success: false,
        error: 'Failed to validate design',
      };
    }
  }
}

export default new AIService();
