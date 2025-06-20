import { test, expect, BrowserContext, Page} from '@playwright/test';
import { BASE_URL_DEV, URL_SETTINGS_ACCOUNT, EMAIL_FOR_VERCEL } from '../../utils/data/constants'
import {setupMetamaskWithCookie} from '../../utils/setupMetamaskWithCookie'
import {loginViaMetamask} from '../../utils/loginViaMetamask'



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

  await loginViaMetamask(page, context);

  await page.goto(BASE_URL_DEV+URL_SETTINGS_ACCOUNT);
});


test.afterEach(async () => {

    await page.goto(BASE_URL_DEV+URL_SETTINGS_ACCOUNT);
    
    // Close all tabs except currently one
    const pages =  context.pages();
    for (const p of pages) {
      if (p !== page) {
        await p.close();
      }
    }
  });
  

test('edit portfolio data with valid data', async () => {
    await page.getByPlaceholder('Enter Username').click();
    await page.getByPlaceholder('Enter Username').fill('Test Account');
    await page.getByPlaceholder('Tell the world who you are!').click();
    await page.getByPlaceholder('Tell the world who you are!').fill('test info about biografy');
    await page.getByPlaceholder('Enter your email').click();
    await page.getByPlaceholder('Enter your email').fill(EMAIL_FOR_VERCEL);
    await page.getByRole('button', { name: 'Save Changes' }).click();
    expect(page.getByText('Your profile information was'));
});
  
  
test('edit portfolio data with invalid data on username field', async () => {
    await page.getByPlaceholder('Enter Username').click();
    await page.getByPlaceholder('Enter Username').fill('Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account ');
    expect(page.getByText('The field cannot contain more than 250 characters'));
});
  
test('edit portfolio data with invalid data on bio field', async () => {
    await page.getByPlaceholder('Tell the world who you are!').click();
    await page.getByPlaceholder('Tell the world who you are!').fill('Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account Test Account ');
    expect(page.getByText('The field cannot contain more than 500 characters'));
});
  
  
test('edit portfolio data with invalid data on email field', async () => {
    await page.getByPlaceholder('Enter your email').click();
    await page.getByPlaceholder('Enter your email').fill('test');
    await page.getByRole('button', { name: 'Save Changes' }).click();
    expect(page.getByText('Invalid email'));

    await page.getByPlaceholder('Enter your email').fill('test@');
    await page.getByRole('button', { name: 'Save Changes' }).click();
    expect(page.getByText('Invalid email'));

    await page.getByPlaceholder('Enter your email').click();
    await page.getByPlaceholder('Enter your email').fill('test@gmail');
    await page.getByRole('button', { name: 'Save Changes' }).click();
    expect(page.getByText('Invalid email'));

    await page.getByPlaceholder('Enter your email').fill('test@gmail.');
    await page.getByRole('button', { name: 'Save Changes' }).click();
    expect(page.getByText('Invalid email'));

    await page.getByPlaceholder('Enter your email').fill('@gmail.com');
    await page.getByRole('button', { name: 'Save Changes' }).click();
    expect(page.getByText('Invalid email'));

    await page.getByPlaceholder('Enter your email').fill('test@gmail.com');
    await page.getByRole('button', { name: 'Save Changes' }).click();
    expect(page.getByText('Invalid email'));

    await page.getByPlaceholder('Enter your email').fill('testgmail.com');
    await page.getByRole('button', { name: 'Save Changes' }).click();
    expect(page.getByText('Invalid email'));
});
  
    