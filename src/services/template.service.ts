import { Template, ITemplate } from '../models/Template.model';
import { AppError } from '../middleware/error.middleware';
import { PageJSON } from '../types/page.types';

export class TemplateService {
  // Get all templates
  async getAllTemplates(category?: string): Promise<ITemplate[]> {
    const filter: any = { isPublic: true };

    if (category) {
      filter.category = category;
    }

    return Template.find(filter).sort({ createdAt: -1 });
  }

  // Get template by ID
  async getTemplateById(templateId: string): Promise<ITemplate> {
    const template = await Template.findById(templateId);

    if (!template) {
      throw new AppError('Template not found', 404, 'TEMPLATE_NOT_FOUND');
    }

    return template;
  }

  // Create template
  async createTemplate(data: {
    name: string;
    description: string;
    category: string;
    thumbnail: string;
    jsonConfig: PageJSON;
    isPublic: boolean;
    userId?: string;
  }): Promise<ITemplate> {
    const template = await Template.create({
      name: data.name,
      description: data.description,
      category: data.category,
      thumbnail: data.thumbnail,
      jsonConfig: data.jsonConfig,
      isPublic: data.isPublic,
      createdBy: data.userId,
    });

    return template;
  }

  // Apply template to page (returns jsonConfig)
  async applyTemplate(templateId: string): Promise<PageJSON> {
    const template = await this.getTemplateById(templateId);
    return template.jsonConfig;
  }
}

export default new TemplateService();
