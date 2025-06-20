import { test, expect, BrowserContext, Page} from '@playwright/test';
import { BASE_URL_DEV, NFT_PAGE, NFT_PAGE_WEE_791, NFT_BORED, NFT_NEW_WEE } from '../../utils/data/constants'
import {setupMetamaskWithCookie} from '../../utils/setupMetamaskWithCookie'




let context: BrowserContext;
let page: Page;

test.beforeAll(async () => {
  context = await setupMetamaskWithCookie();
  page = await context.newPage();
  await page.goto(BASE_URL_DEV);

  // Close all tabs except currently one
  const pages =  context.pages();
  for (const p of pages) {
    if (p !== page) {
      await p.close();
    }
  }

  await page.goto(BASE_URL_DEV+NFT_PAGE_WEE_791);
});


test.afterEach(async () => {

    await page.goto(BASE_URL_DEV+NFT_PAGE_WEE_791);
    
    // Close all tabs except currently one
    const pages =  context.pages();
    for (const p of pages) {
      if (p !== page) {
        await p.close();
      }
    }
  });
  
test('share nft by X and tg', async () => { 
  await page.locator('.mb-4 > div > svg').click();
  const page2Promise = page.waitForEvent('popup');
  await page.locator('div').filter({ hasText: /^X$/ }).click();
  const page2 = await page2Promise;
  expect(page2.locator('[class="css-1jxf684 r-bcqeeo r-1ttztb7 r-qvutc0 r-poiln3"]').first())


  const page3Promise = page.waitForEvent('popup');
  await page.locator('div').filter({ hasText: /^Telegram$/ }).click();
  const page3 = await page3Promise;
  expect(page2.locator('.tgme_page_icon'))
});

test('share nft using copy button', async () => {
  await page.locator('[class="cursor-pointer stroke-ui-400 hover:stroke-brand-400"]').click();
  await page.locator('[class="flex-shrink-0 cursor-pointer select-none"]').click();
  expect(page.getByText('Text was successfully copied.'));
    
  const clipboardContent = await page.locator('[class="body2-medium select-none truncate text-ui-950 dark:text-white"]').textContent();
  expect(BASE_URL_DEV+NFT_PAGE == clipboardContent)
});

test('redirect to сollection page when the user clicks on the view collection', async () => {
    await page.getByRole('button', { name: 'View collection' }).click();
    expect(page.isVisible('[class="l1-medium pb-[2px] text-ui-950 dark:text-white"]'));
});

test('back on the collection page', async () => {
  await page.locator('[class="body1-medium ml-2 text-ui-400 dark:text-ui-500"]').click();
  expect(page.isVisible('[class="l1-medium pb-[2px] text-ui-950 dark:text-white"]'));
});
        
test('make offer by unauthorized user', async () => {
    await page.getByRole('button', { name: 'Make offer' }).click();
    await page.getByRole('button', { name: 'Make offer' }).click();
    expect(page.locator('wui-text').filter({ hasText: 'Connect Wallet' }).locator('slot'));
});

test('buy now by unauthorized user', async () => {
    await page.getByRole('button', { name: 'Buy now' }).click();
    expect(page.locator('wui-text').filter({ hasText: 'Connect Wallet' }).locator('slot'));
});

test('add to cart by unauthorized user', async () => {
    await page.locator('div').filter({ hasText: /^Buy nowMake offer$/ }).getByRole('button').nth(1).click();
    expect(page.getByText('Added to cart'));
    await page.locator('[class="body1-medium flex w-[71px] cursor-pointer items-center justify-center text-lightBlack dark:text-white mobile:h-full"]').click();
    await page.getByRole('button', { name: 'Checkout' }).click();
    expect(page.locator('wui-text').filter({ hasText: 'Connect Wallet' }).locator('slot'));
});
