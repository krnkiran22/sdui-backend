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
      console.log(`Calling Groq using model: llama-3.3-70b-versatile ${jsonMode ? '(JSON Mode)' : ''}`);
      const response = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
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

Analyze the command. Determine if the user wants to:
1. Build a COMPLETELY NEW FULL PAGE or a FULL WEBSITE/TEMPLATE from scratch (Keywords: "full", "website", "template", "landing page", "html code", "full code"). For these, return the action "generate_full_html". This is the HIGHEST PRIORITY.
2. Perform a specific modification (insert, update, delete, move) on existing sections.

Response format:
{
  "action": "insert" | "update" | "delete" | "move" | "generate_full_html",
  "component": {
    "type": "ComponentType",
    "props": {...},
    "position": "append" | "prepend" | number
  },
  "prompt": "Full description for HTML generation if action is generate_full_html"
}

VALID COMPONENT TYPES (only use these for insert/update): 
HeroBanner, TextBlock, Container, AboutSection, Statistics, FacultyGrid, FAQAccordion, ContactForm, DynamicSection, Button, RawHTML.
CRITICAL: If the user says "full", "website", or "html page", DO NOT use "insert". USE "generate_full_html".

Only respond with valid JSON, no explanations.`;

      const responseText = await this.getChatCompletion(prompt, true);
      console.log('AI Raw Response:', responseText);
      const jsonOperation = JSON.parse(responseText);

      // Validation: If it seems like a full page request, convert it to generate_full_html
      const lowerCommand = command.toLowerCase();
      const isFullPageRequest = lowerCommand.match(/full|website|template|landing|college|university|hospital|school/);
      
      console.log('Is Full Page Request:', !!isFullPageRequest);

      if (isFullPageRequest && jsonOperation.action !== 'generate_full_html') {
          console.log('Overriding action to generate_full_html');
          jsonOperation.action = 'generate_full_html';
          jsonOperation.prompt = command;
      }

      // If it's an insert with an unknown type, convert it to generate_full_html
      if (jsonOperation.action === 'insert' && !['HeroBanner', 'TextBlock', 'Container', 'AboutSection', 'Statistics', 'FacultyGrid', 'FAQAccordion', 'ContactForm', 'DynamicSection', 'Button', 'RawHTML'].includes(jsonOperation.component?.type)) {
          console.log('Unknown component type, reverting to generate_full_html');
          jsonOperation.action = 'generate_full_html';
          jsonOperation.prompt = command;
      }

      console.log('Final AI Operation:', JSON.stringify(jsonOperation, null, 2));

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

You can use these existing types: HeroBanner, TextBlock, Container, AboutSection, Statistics, FacultyGrid, FAQAccordion, ContactForm, DynamicSection, Button, RawHTML.
If the component requested doesn't fit the others, use "RawHTML" and put the full HTML/Tailwind code in the "html" prop.
Only return valid JSON. Do not include markdown code blocks or explanations.`;

      console.log(`Generating component with Groq using model: llama-3.3-70b-versatile`);
      const response = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
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
    } catch (error: any) {
      console.error('Groq component generation error:', error?.response?.data || error);
      return {
        success: false,
        error: error?.response?.data?.error?.message || error.message || 'Failed to generate component using Groq',
      };
    }
  }

  // Generate a full page HTML using Tailwind CSS
  async generateFullPageHTML(prompt: string, context: { pages: { name: string, slug: string }[] }): Promise<{
    success: boolean;
    html?: string;
    error?: string;
  }> {
    if (!this.groq && !this.anthropic) {
      throw new AppError('AI service not configured', 503, 'AI_NOT_CONFIGURED');
    }

    try {
      const pageLinks = context.pages.map(p => `<a href="/${p.slug}">${p.name}</a>`).join(', ');

      const systemPrompt = `You are a world-class frontend developer and UI/UX designer. Your task is to generate a complete, stunning, production-ready HTML landing page.

STRICT OUTPUT RULES:
1. Return a COMPLETE, SELF-CONTAINED HTML document starting with <!DOCTYPE html> and including <html>, <head>, and <body> tags.
2. Do NOT wrap your response in markdown code blocks. Output raw HTML only.
3. Do NOT include any explanations, comments outside the HTML, or apologies.

TECHNICAL REQUIREMENTS:
- Include Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
- Include Google Fonts (Inter) via: <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;900&display=swap" rel="stylesheet">
- Add this Tailwind config in a <script> right after the CDN script to enable Inter font:
  <script>tailwind.config = { theme: { extend: { fontFamily: { sans: ['Inter', 'sans-serif'] } } } }</script>
- For subtle scroll animations, add a simple IntersectionObserver in a <script> at the bottom.
- ALL images MUST use picsum.photos with a descriptive seed. Format:
    https://picsum.photos/seed/{SEED}/{WIDTH}/{HEIGHT}
  Use descriptive seed words matching the content, for example:
    - Hero background:    https://picsum.photos/seed/campus/1400/800
    - Faculty photo:      https://picsum.photos/seed/professor/400/400
    - Feature card image: https://picsum.photos/seed/technology/600/400
    - Team member:        https://picsum.photos/seed/team1/300/300
    - Testimonial avatar: https://picsum.photos/seed/student/80/80
    - About section:      https://picsum.photos/seed/building/800/500
  NEVER use Unsplash or any other image service. ONLY picsum.photos.
  Add onerror="this.src='https://picsum.photos/seed/fallback/400/300'" to every <img> tag.
- Navigation links available: ${pageLinks || '<a href="/">Home</a>'}

DESIGN STANDARDS (MANDATORY - make it stunning):
- Use ONE of these modern color schemes (choose the most appropriate for the request):
  - Deep Slate & Blue (slate-950, blue-600)
  - Dark Charcoal & Emerald (neutral-950, emerald-600)
  - Midnight Navy & Indigo (indigo-950, indigo-600)
  - Pure Black & Gold (black, amber-500)
- Hero section: full-screen height (min-h-screen), centered content, large headline (text-5xl to text-7xl), subtitle, CTA buttons.
- Navigation bar: sticky, glassmorphism effect (backdrop-blur, bg-white/5), light border.
- Contrast: Ensure HIGH CONTRAST. Never use text colors (like purple text) that blend into the background (like a purple gradient). Use white or very light gray for text on dark backgrounds.
- Image Quality: Do NOT use heavy overlays that wash out or hide the images. If an image needs an overlay for text legibility, use a very subtle linear gradient at the bottom or a slight darkening (bg-black/20).
- Use gradient text ONLY for emphasis on 2-3 words, not entire sentences: bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent.
- Feature/stat cards: rounded-2xl, shadow-xl, border border-white/5, with hover:scale-[1.02] transition.
- Typography: Large, bold font-black headings. Use 'Inter' font (force sans).
- Section spacing: Use generous padding (py-24 or py-32) to let the design breathe.
- Include at minimum: Navbar, Hero, Features/Services (3-6 cards), Stats section, Testimonials with avatars, CTA Banner, Detailed Footer.

USER REQUEST: ${prompt}`;

      let responseText: string;

      if (this.anthropic) {
        const message = await this.anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 8000,
          messages: [{ role: 'user', content: systemPrompt }],
        });
        responseText = message.content[0].type === 'text' ? message.content[0].text : '';
      } else if (this.groq) {
        const response = await this.groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: systemPrompt }],
          max_tokens: 8000,
        });
      responseText = response.choices[0].message.content || '';
      } else {
        throw new AppError('AI service not configured', 503, 'AI_NOT_CONFIGURED');
      }

      const cleanHtml = this.extractHTML(responseText);

      return {
        success: true,
        html: cleanHtml,
      };
    } catch (error: any) {
      console.error('HTML generation error:', error?.response?.data || error);
      return {
        success: false,
        error: error?.response?.data?.error?.message || error.message || 'Failed to generate page HTML',
      };
    }
  }

  // Iteratively modify existing HTML based on user request
  async modifyFullPageHTML(
    prompt: string,
    currentHtml: string,
    context?: { pages?: { name: string; slug: string }[]; currentSlug?: string }
  ): Promise<{
    success: boolean;
    html?: string;
    error?: string;
  }> {
    if (!this.groq && !this.anthropic) {
      throw new AppError('AI service not configured', 503, 'AI_NOT_CONFIGURED');
    }

    try {
      // Build page navigation context for cross-page linking
      let pageLinksContext = '';
      if (context?.pages && context.pages.length > 0) {
        const currentIndex = context?.currentSlug
          ? context.pages.findIndex((p) => p.slug === context.currentSlug)
          : -1;
        const nextPage = currentIndex >= 0 && currentIndex < context.pages.length - 1
          ? context.pages[currentIndex + 1]
          : null;
        const prevPage = currentIndex > 0
          ? context.pages[currentIndex - 1]
          : null;

        const pageList = context.pages
          .map((p, i) => `  ${i + 1}. "${p.name}" → URL: /${p.slug}${context.currentSlug === p.slug ? ' (CURRENT PAGE)' : ''}`)
          .join('\n');

        pageLinksContext = `
PAGE NAVIGATION CONTEXT:
The following pages exist in this web app. Use their URLs when the user asks to redirect or link between pages:
${pageList}
${nextPage ? `- "next page" means: /${nextPage.slug} (${nextPage.name})` : ''}
${prevPage ? `- "previous page" means: /${prevPage.slug} (${prevPage.name})` : ''}
When adding redirect buttons or links, always use the actual page URL paths listed above.
`;
      }

      const systemPrompt = `You are a world-class frontend developer. Your task is to MODIFY an existing HTML landing page based on the user's instructions.

STRICT OUTPUT RULES:
1. Return the FULL, COMPLETE updated HTML document. Do NOT return just the snippets.
2. Do NOT wrap your response in markdown code blocks. Output raw HTML only.
3. Keep the overall design system and Tailwind CSS configuration intact unless asked otherwise.
4. Do NOT include any explanations or apologies. Just the updated code.
${pageLinksContext}
USER INSTRUCTION: ${prompt}

CURRENT HTML CODE:
${currentHtml}`;

      let responseText: string;

      if (this.anthropic) {
        const message = await this.anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 8000,
          messages: [{ role: 'user', content: systemPrompt }],
        });
        responseText = message.content[0].type === 'text' ? message.content[0].text : '';
      } else if (this.groq) {
        const response = await this.groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: systemPrompt }],
          max_tokens: 8000,
        });
        responseText = response.choices[0].message.content || '';
      } else {
        throw new AppError('AI service not configured', 503, 'AI_NOT_CONFIGURED');
      }

      const cleanHtml = this.extractHTML(responseText);

      return {
        success: true,
        html: cleanHtml,
      };
    } catch (error: any) {
      console.error('HTML modification error:', error);
      return {
        success: false,
        error: error.message || 'Failed to modify page HTML',
      };
    }
  }

  // Helper to robustly extract HTML from AI response
  private extractHTML(responseText: string): string {
    let cleanHtml = responseText;

    // 1. Strip markdown code fences anywhere in the string (multiline)
    cleanHtml = cleanHtml.replace(/```html\s*/gi, '').replace(/```\s*/gi, '');

    // 2. Find where the actual HTML document starts
    const doctypeIdx = cleanHtml.toLowerCase().indexOf('<!doctype');
    const htmlTagIdx = cleanHtml.toLowerCase().indexOf('<html');

    if (doctypeIdx !== -1) {
      cleanHtml = cleanHtml.slice(doctypeIdx);
    } else if (htmlTagIdx !== -1) {
      cleanHtml = cleanHtml.slice(htmlTagIdx);
    }

    // 3. Trim any trailing whitespace / leftover text after </html>
    const closingIdx = cleanHtml.toLowerCase().lastIndexOf('</html>');
    if (closingIdx !== -1) {
      cleanHtml = cleanHtml.slice(0, closingIdx + 7);
    }

    cleanHtml = cleanHtml.trim();

    // 4. Safety net: if we still don't have a valid document, wrap what we have
    if (!cleanHtml.toLowerCase().includes('<!doctype') && !cleanHtml.toLowerCase().startsWith('<html')) {
      cleanHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap" rel="stylesheet">
  <style>body { font-family: 'Inter', sans-serif; margin: 0; }</style>
</head>
<body>
${cleanHtml}
</body>
</html>`;
    }

    return cleanHtml;
  }
}

export default new AIService();
