import { type Page, type Locator, expect } from '@playwright/test';

export class SSOPage {
  private readonly newConnectionButton: Locator;
  private readonly metadataUrlField: Locator;
  private readonly saveButton: Locator;
  private readonly deleteButton: Locator;
  private readonly confirmButton: Locator;
  private readonly xmlField: Locator;

  constructor(
    public readonly page: Page,
    public readonly teamSlug: string
  ) {
    this.newConnectionButton = page.getByRole('button', {
      name: 'New Connection',
    });
    this.metadataUrlField = page.getByPlaceholder(
      'Paste the Metadata URL here'
    );
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.deleteButton = page.getByRole('button', { name: 'Delete' });
    this.confirmButton = page.getByRole('button', { name: 'Confirm' });
    this.xmlField = page.getByPlaceholder('Paste the raw XML here');
  }

  async goto() {
    await this.page.goto(`/teams/${this.teamSlug}/sso`);
    await this.page.waitForURL(`/teams/${this.teamSlug}/sso`);
    await this.page.waitForSelector('text=Manage SSO Connections');
  }

  async createSSOConnection(metadataUrl: string) {
    await this.newConnectionButton.click();
    await this.fillSSOConnectionForm(metadataUrl);
    await this.saveButton.click();
    await expect(
      this.page.getByRole('cell', {
        name: 'saml.example.com',
      })
    ).toBeVisible();
  }

  async openEditSSOConnectionView() {
    await this.page.waitForSelector('text=saml.example.com');
    await this.page.getByLabel('Edit').click();
    await this.page.waitForSelector('text=Edit SSO Connection');
  }

  async deleteSSOConnection() {
    await this.deleteButton.click();
    await this.page.waitForSelector(
      'text=Are you sure you want to delete the Connection? This action cannot be undone and will permanently delete the Connection.'
    );
    await this.confirmButton.click();
    await this.page.waitForSelector('text=Manage SSO Connections');
  }

  async fillSSOConnectionForm(metadataUrl: string) {
    if (process.env.JACKSON_URL) {
      // fetch the data from metadata url
      const response = await fetch(metadataUrl);
      const data = await response.text();
      await this.xmlField.fill(data);
    } else {
      await this.metadataUrlField.fill(metadataUrl);
    }
  }
}
