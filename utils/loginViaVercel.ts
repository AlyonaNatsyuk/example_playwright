   import { Page, chromium, BrowserContext } from 'playwright';
   import { promises as fs } from 'fs';
   import {BASE_URL_DEV, EMAIL_FOR_VERCEL, PASSWORD_FOR_GMAIL_AND_GETHUB_METAMASK} from '../utils/data/constants'

   export async function loginViaVercel(pageToSite: Page, context?: BrowserContext) {
      if (!context) {
        const browser = await chromium.launch({ headless: false });
        context = await browser.newContext();
      }

    await pageToSite.goto(BASE_URL_DEV)
    await pageToSite.getByText('Continue with Email →').click();
    await pageToSite.getByTestId('login/email-input').fill(EMAIL_FOR_VERCEL)
    await pageToSite.getByTestId('login/email-button').click()

    // login mail and open the mail
    const pageToGmail = await context.newPage()
    await pageToGmail.goto('https://mail.google.com/')
    await pageToGmail.locator('[type="email"]').fill(EMAIL_FOR_VERCEL)
    await pageToGmail.locator('#identifierNext').click()
    await pageToGmail.locator('[type="password"]').fill(PASSWORD_FOR_GMAIL_AND_GETHUB_METAMASK)
    await pageToGmail.locator('#passwordNext').click()
    await pageToGmail.getByRole('link', { name: 'Vercel Sign-in Verification' }).first().click()
    const confirmationCode = await pageToGmail.locator('td[bgcolor="#f6f6f6"]').innerText();

    // closed tasks
    await pageToGmail.close();

    // enter code on vercel page
    await pageToSite.getByLabel('One-time password, we sent it').fill(confirmationCode);
    await pageToSite.waitForSelector('[class="Jumbotron_description__Zp6LJ"]');

  // check cookie for _vercel_jwt
  const cookies = await pageToSite.context().cookies();
  const vercelJwtCookie = cookies.find(cookie => cookie.name === '_vercel_jwt');  
  const vercelJwt = vercelJwtCookie?.value || '';

  // Create an object with data
  const dataToWrite = {
      vercelJwt: vercelJwt
  };
  
// Write data to the file 'vercel_jwt.json'
  await fs.writeFile('../.auth/vercel_jwt.json', JSON.stringify(dataToWrite, null, 2));
  
  return vercelJwtCookie?.value;
}
