import { test, expect, BrowserContext, Page} from '@playwright/test';
import {setupMetamaskWithCookie} from '../../utils/setupMetamaskWithCookie'
import {BASE_URL_DEV, TRENDING_TAB} from '../../utils/data/constants'


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
});


test.afterEach(async () => {
  await page.goto(BASE_URL_DEV);
  
  // Close all tabs except currently one
  const pages =  context.pages();
  for (const p of pages) {
    if (p !== page) {
      await p.close();
    }
  }
});

test('change color mode', async () => {
  const light = page.locator('[style="color-scheme: light;"]');
  const dark = page.locator('[style="color-scheme: dark;"]')
  if(light){
    await page.getByRole('switch', { name: 'Light/Dark Theme Setting' }).click();
    expect(dark)
  }else if(dark){
    await page.getByRole('switch', { name: 'Light/Dark Theme Setting' }).click();
    expect(light)
  }
  await page.getByRole('switch', { name: 'Light/Dark Theme Setting' }).click();
});

test('open connection pop-up', async () => {
  await page.getByRole('button', { name: 'Wallets' }).click();
  await page.getByRole('button', { name: 'Connect to Ethereum' }).click();
  expect(page.locator('wui-text').filter({ hasText: 'Connect Wallet' }).locator('slot'));
  });
  
test('redirect to pages on header', async () => {
await page.getByRole('link', { name: 'Tokens' }).click();
expect(page.getByText('Token name'));
await page.getByRole('link', { name: 'NFTs' }).click();
expect(page.getByText('Collection name'));
});

test('open connection pop-up on footer', async () => {
  await page.getByRole('contentinfo').getByText('Portfolio').click();
  expect(page.locator('wui-text').filter({ hasText: 'Connect Wallet' }).locator('slot'));
  await page.getByTestId('w3m-header-close').getByRole('button').click();


  await page.getByRole('contentinfo').getByText('Watchlist').click();
  expect(page.locator('wui-text').filter({ hasText: 'Connect Wallet' }).locator('slot'));
  await page.getByTestId('w3m-header-close').getByRole('button').click();

  await page.getByRole('contentinfo').getByText('Settings').click();
  expect(page.locator('wui-text').filter({ hasText: 'Connect Wallet' }).locator('slot'));
})

test('redirect to pages on footer', async () => {  
  await page.getByRole('link', { name: 'Terms' }).click();
  expect(page.getByRole('heading', { name: 'Terms of Service' }));
  await page.goto(BASE_URL_DEV);
  
  await page.getByRole('link', { name: 'FAQ' }).click();
  expect(page.locator('#general-questions').getByText('General Questions'));
  await page.goto(BASE_URL_DEV);
  
  await page.getByRole('link', { name: 'Feedback' }).click();
  expect(page.getByText('Please provide any feedback'));
  await page.goto(BASE_URL_DEV);
  
  await page.getByRole('link', { name: 'Privacy Policy' }).click();
  expect( page.getByRole('heading', { name: 'Privacy Policy' }));
  await page.goto(BASE_URL_DEV);
  })

  test('check Join our newsletter block with valid email', async () => {  
    await page.getByPlaceholder('Enter your email').click();
    await page.getByPlaceholder('Enter your email').fill('test@requestum.com');
    await page.getByRole('button', { name: 'Join' }).click();
    expect(page.getByText('Thanks for Joining! Your'));
  })

  test('check Join our newsletter block with invalid email', async () => {  
  await page.getByPlaceholder('Enter your email').click();
  await page.getByPlaceholder('Enter your email').fill('test');
  await page.getByRole('button', { name: 'Join' }).click();
  expect(page.getByText('Invalid email format.'));

  await page.getByPlaceholder('Enter your email').click();
  await page.getByPlaceholder('Enter your email').fill('test@');
  await page.getByRole('button', { name: 'Join' }).click();
  expect(page.getByText('Invalid email format.'));

  await page.getByPlaceholder('Enter your email').click();
  await page.getByPlaceholder('Enter your email').fill('test@gmail');
  await page.getByRole('button', { name: 'Join' }).click();
  expect(page.getByText('Invalid email format.'));

  await page.getByPlaceholder('Enter your email').click();
  await page.getByPlaceholder('Enter your email').fill('test@gmail.');
  await page.getByRole('button', { name: 'Join' }).click();
  expect(page.getByText('Invalid email format.'));

  await page.getByPlaceholder('Enter your email').click();
  await page.getByPlaceholder('Enter your email').fill('@gmail.com');
  await page.getByRole('button', { name: 'Join' }).click();
  expect(page.getByText('Invalid email format.'));

  await page.getByPlaceholder('Enter your email').click();
  await page.getByPlaceholder('Enter your email').fill('test@gmail.com');
  await page.getByRole('button', { name: 'Join' }).click();
  expect(page.getByText('Invalid email format.'));

  await page.getByPlaceholder('Enter your email').click();
  await page.getByPlaceholder('Enter your email').fill('testgmail.com');
  await page.getByRole('button', { name: 'Join' }).click();
  expect(page.getByText('Invalid email format.'));
  })

  test('change currency', async() =>{
    await page.goto(BASE_URL_DEV+TRENDING_TAB)
    const other_currency = page.locator('div[class="z-10 flex h-full w-full cursor-pointer items-center justify-center text-ui-400"]')
    const eth = page.locator('.fill-brand-400')
if(eth){
    await other_currency.click()
    expect(page.locator('span[class="body1-regular"]'))
}
else{
    await page.locator(':text-is("ETH")').click()
    expect(eth)
}
})