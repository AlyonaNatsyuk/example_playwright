import { Page, chromium, BrowserContext } from 'playwright';

export async function loginViaMetamask(page: Page, context?: BrowserContext) {
  if (!context) {
    const browser = await chromium.launch({ headless: false });
    context = await browser.newContext();
  }

    await page.getByRole('button', { name: 'Wallets' }).click();
    await page.getByRole('button', { name: 'Connect to Ethereum' }).click();

    const [metamaskModal] = await Promise.all([
        context.waitForEvent('page'),
        page.getByRole('button', { name: 'MetaMask MetaMask' }).click()
    ]);

    metamaskModal.focus;

    await metamaskModal.waitForSelector('button[data-testid="page-container-footer-next"]');
    await metamaskModal.click('button[data-testid="page-container-footer-next"]');
    
    await metamaskModal.waitForSelector('button[data-testid="page-container-footer-next"]');
    await metamaskModal.click('button[data-testid="page-container-footer-next"]');

    const [sighMetamaskModal] = await Promise.all([
      context.waitForEvent('page'),  
      page.getByText('Only sign this message if you fully understand the content and trust the requesting site.')
    ]);

    sighMetamaskModal.focus;
    await sighMetamaskModal.click('button[data-testid="page-container-footer-next"]');

await page.waitForTimeout(2000)
}


