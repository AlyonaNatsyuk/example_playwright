import { Page, chromium, BrowserContext } from 'playwright';
import { expect } from '@playwright/test';


export async function acceptSign(page: Page, context?: BrowserContext) {
  if (!context) {
    const browser = await chromium.launch({ headless: false });
    context = await browser.newContext();
  }

    const [metamaskModal] = await Promise.all([
        context.waitForEvent('page'),
        page.getByText('Only sign this message if you fully understand the content and trust the requesting site.')
    ]);

    metamaskModal.focus;

    await metamaskModal.locator('[data-testid="signature-request-scroll-button"]').click()
    await metamaskModal.click('[data-testid="page-container-footer-next"]');

}

export async function acceptActionsOnOffersPage(page: Page, context?: BrowserContext) {
  if (!context) {
    const browser = await chromium.launch({ headless: false });
    context = await browser.newContext();
  }

    const [metamaskModal] = await Promise.all([
        context.waitForEvent('page'),
        page.getByText('No changes predicted for your wallet')
    ]);

    metamaskModal.focus;

    await expect(metamaskModal.locator('[data-testid="page-container-footer-next"]')).toBeEnabled();
    await metamaskModal.click('[data-testid="page-container-footer-next"]');
}

