import { Version, IVersion } from '../models/Version.model';
import { Page } from '../models/Page.model';
import { AppError } from '../middleware/error.middleware';

export class VersionService {
  // Get version history for a page
  async getVersionHistory(pageId: string): Promise<IVersion[]> {
    return Version.find({ pageId })
      .sort({ versionNumber: -1 })
      .populate('createdBy', 'name email');
  }

  // Get specific version
  async getVersion(pageId: string, versionNumber: number): Promise<IVersion> {
    const version = await Version.findOne({ pageId, versionNumber })
      .populate('createdBy', 'name email');

    if (!version) {
      throw new AppError('Version not found', 404, 'VERSION_NOT_FOUND');
    }

    return version;
  }

  // Restore a version
  async restoreVersion(
    pageId: string,
    versionNumber: number,
    userId: string
  ): Promise<void> {
    // Get the version to restore
    const version = await this.getVersion(pageId, versionNumber);

    // Update page with version's jsonConfig
    const page = await Page.findById(pageId);

    if (!page) {
      throw new AppError('Page not found', 404, 'PAGE_NOT_FOUND');
    }

    page.jsonConfig = version.jsonConfig;
    page.updatedBy = userId as any;
    await page.save();

    // Create new version entry for the restoration
    const latestVersion = await Version.findOne({ pageId })
      .sort({ versionNumber: -1 });

    const newVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

    await Version.create({
      pageId,
      versionNumber: newVersionNumber,
      jsonConfig: version.jsonConfig,
      changes: `Restored version ${versionNumber}`,
      createdBy: userId,
    });
  }
}

export default new VersionService();
