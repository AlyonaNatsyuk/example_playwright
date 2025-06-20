import { BrowserContext, chromium } from 'playwright';
import { PASSWORD_FOR_GMAIL_AND_GETHUB_METAMASK, DEV_DOMAIN,  PRIVATE_BETA_PASSWORD, ADDRESS_FOR_WETH, KEY_FOR_WALLET } from './data/constants';
import {getVercelJwt} from '../utils/getVercelJwt'
import {loginViaVercel} from '../utils/loginViaVercel'
import path from 'path';
import fs from 'fs';

// this is a temporary solution until there is no QA env
export async function setupMetamaskWithCookie(context?: BrowserContext): Promise<BrowserContext> {
    const metamaskPath = path.join(__dirname, '../extension/metamask-chrome-11.16.15');

    // check manifest.json file
    const manifestPath = path.join(metamaskPath, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
        throw new Error(`Manifest file not found at path: ${manifestPath}`);
    }

    // close current context (if it opens) 
    if (context) {
        await context.close();
    }
    
    // Launch the browser with the extension
    const newContext = await chromium.launchPersistentContext('', {
        headless: false,
        args: [
            `--disable-extensions-except=${metamaskPath}`,
            `--load-extension=${metamaskPath}`
        ],
    });

    // dismiss geo
    await newContext.grantPermissions(['geolocation']);
    await newContext.setGeolocation({ latitude: 0, longitude: 0 });

    let vercelJwt = await getVercelJwt();

    // Set the _vercel_jwt cookie
    const cookies = [{
        name: '_vercel_jwt',
        value: vercelJwt,
        domain: DEV_DOMAIN, 
        path: '/',
        httpOnly: true,
        secure: true
    },
    {
        name: 'site-private-beta-password',
        value: PRIVATE_BETA_PASSWORD,
        domain: DEV_DOMAIN,
        path: '/',
        httpOnly: true,
        secure: true
    }
];

    // Assuming the browser context has at least one page
    let pages = newContext.pages();
    if (pages.length === 0) {
        await newContext.newPage();
        pages = newContext.pages();
    }
    const [page] = pages;
    await page.context().addCookies(cookies);

    // Check if vercelJwt is valid by looking for the specific locator
    if (await page.locator('[class="login_title__cAqZz"]').count() > 0) {
        // vercelJwt is invalid, need to login again
        await loginViaVercel(page);
        // Get the new token after login
        vercelJwt = await getVercelJwt();
        // Update the cookie with the new token
        await page.context().clearCookies();
        await page.context().addCookies([{
            name: '_vercel_jwt',
            value: vercelJwt,
            domain: DEV_DOMAIN, 
            path: '/',
            httpOnly: true,
            secure: true
        }]);
    }

    // Close all tabs except MetaMask
    for (let i = 1; i < pages.length; i++) {
        await pages[i].close();
    }

    // We get the MetaMask page
    let metamaskPage = pages[0];
    await metamaskPage.bringToFront();

    // Wait for MetaMask to load
    await metamaskPage.waitForTimeout(3000);  

    // Check if a new MetaMask tab has opened
    pages = newContext.pages();
    if (pages.length > 1) {
        // Close the initial tab
        await metamaskPage.close();
        // Switch to the new MetaMask tab
        metamaskPage = pages[1];
        await metamaskPage.bringToFront();
    }

    // Performing actions on the MetaMask tab
    await metamaskPage.click('input[type="checkbox"][data-testid="onboarding-terms-checkbox"]');
    await metamaskPage.click('button[data-testid="onboarding-import-wallet"]');
    await metamaskPage.click('button[data-testid="metametrics-no-thanks"]');

    // enter 12 words
    await metamaskPage.fill('input[data-testid="import-srp__srp-word-0"]', 'example');
    await metamaskPage.fill('input[data-testid="import-srp__srp-word-1"]', 'word');
    await metamaskPage.fill('input[data-testid="import-srp__srp-word-2"]', 'for');
    await metamaskPage.fill('input[data-testid="import-srp__srp-word-3"]', 'wallet');
    await metamaskPage.fill('input[data-testid="import-srp__srp-word-4"]', 'example');
    await metamaskPage.fill('input[data-testid="import-srp__srp-word-5"]', 'word');
    await metamaskPage.fill('input[data-testid="import-srp__srp-word-6"]', 'for');
    await metamaskPage.fill('input[data-testid="import-srp__srp-word-7"]', 'wallet');
    await metamaskPage.fill('input[data-testid="import-srp__srp-word-8"]', 'example');
    await metamaskPage.fill('input[data-testid="import-srp__srp-word-9"]', 'word');
    await metamaskPage.fill('input[data-testid="import-srp__srp-word-10"]', 'for');
    await metamaskPage.fill('input[data-testid="import-srp__srp-word-11"]', 'wallet');
    await metamaskPage.click('button[data-testid="import-srp-confirm"]');
    
    // set password
    await metamaskPage.fill('input[data-testid="create-password-new"]', PASSWORD_FOR_GMAIL_AND_GETHUB_METAMASK);
    await metamaskPage.fill('input[data-testid="create-password-confirm"]', PASSWORD_FOR_GMAIL_AND_GETHUB_METAMASK);
    await metamaskPage.click('input[type="checkbox"][data-testid="create-password-terms"]');
    await metamaskPage.click('button[data-testid="create-password-import"]');

    // onbording
    await metamaskPage.click('button[data-testid="onboarding-complete-done"]');
    await metamaskPage.click('button[data-testid="pin-extension-next"]');
    await metamaskPage.click('button[data-testid="pin-extension-done"]');
    const modalButton =  metamaskPage.locator('[role="dialog"]');
    await modalButton.getByRole('button', { name: 'Enable' }).click();

    //change network to sepolia
    await metamaskPage.locator('[data-testid="network-display"]').click();
    const modalButtonOnNetwork =  metamaskPage.locator('[role="dialog"]');
    await modalButtonOnNetwork.locator('[class="toggle-button toggle-button--off"]').click();
    await modalButtonOnNetwork.locator('[data-testid="Sepolia"]').click();

    // add tokens wallet with weth
    await metamaskPage.locator('[data-testid="import-token-button"]').click();
    const importTokensModal =  metamaskPage.locator('[role="dialog"]');
    await importTokensModal.locator('[data-testid="import-tokens-modal-custom-address"]').fill(ADDRESS_FOR_WETH);
    await metamaskPage.waitForTimeout(2000);
    await importTokensModal.locator('[data-testid="import-tokens-button-next"]').click();
    await importTokensModal.locator('[data-testid="import-tokens-modal-import-button"]').click();
    
    return newContext;
}

// there is added second account in metamask 
export async function setupMetamaskWithCookieWithSecondAccount(context?: BrowserContext): Promise<BrowserContext> {
    const metamaskPath = path.join(__dirname, '../extension/metamask-chrome-11.16.15');

    // check manifest.json file
    const manifestPath = path.join(metamaskPath, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
        throw new Error(`Manifest file not found at path: ${manifestPath}`);
    }

    // close current context (if it opens) 
    if (context) {
        await context.close();
    }
    
    // Launch the browser with the extension
    const newContext = await chromium.launchPersistentContext('', {
        headless: false,
        args: [
            `--disable-extensions-except=${metamaskPath}`,
            `--load-extension=${metamaskPath}`
        ],
    });

    // dismiss geo
    await newContext.grantPermissions(['geolocation']);
    await newContext.setGeolocation({ latitude: 0, longitude: 0 });

    let vercelJwt = await getVercelJwt();

    // Set the _vercel_jwt cookie
    const cookies = [{
        name: '_vercel_jwt',
        value: vercelJwt,
        domain: DEV_DOMAIN, 
        path: '/',
        httpOnly: true,
        secure: true
    },
    {
        name: 'site-private-beta-password',
        value: PRIVATE_BETA_PASSWORD,
        domain: DEV_DOMAIN,
        path: '/',
        httpOnly: true,
        secure: true
    }
];

    // Assuming the browser context has at least one page
    let pages = newContext.pages();
    if (pages.length === 0) {
        await newContext.newPage();
        pages = newContext.pages();
    }
    const [page] = pages;
    await page.context().addCookies(cookies);

    // Check if vercelJwt is valid by looking for the specific locator
    if (await page.locator('[class="login_title__cAqZz"]').count() > 0) {
        // vercelJwt is invalid, need to login again
        await loginViaVercel(page);
        // Get the new token after login
        vercelJwt = await getVercelJwt();
        // Update the cookie with the new token
        await page.context().clearCookies();
        await page.context().addCookies([{
            name: '_vercel_jwt',
            value: vercelJwt,
            domain: DEV_DOMAIN, 
            path: '/',
            httpOnly: true,
            secure: true
        }]);
    }

    // Close all tabs except MetaMask
    for (let i = 1; i < pages.length; i++) {
        await pages[i].close();
    }

    // We get the MetaMask page
    let metamaskPage = pages[0];
    await metamaskPage.bringToFront();

    // Wait for MetaMask to load
    await metamaskPage.waitForTimeout(3000);  

    // Check if a new MetaMask tab has opened
    pages = newContext.pages();
    if (pages.length > 1) {
        // Close the initial tab
        await metamaskPage.close();
        // Switch to the new MetaMask tab
        metamaskPage = pages[1];
        await metamaskPage.bringToFront();
    }

    // Performing actions on the MetaMask tab
    await metamaskPage.click('input[type="checkbox"][data-testid="onboarding-terms-checkbox"]');
    await metamaskPage.click('button[data-testid="onboarding-import-wallet"]');
    await metamaskPage.click('button[data-testid="metametrics-no-thanks"]');

    // enter 12 words
    await metamaskPage.fill('input[data-testid="import-srp__srp-word-0"]', 'example');
    await metamaskPage.fill('input[data-testid="import-srp__srp-word-1"]', 'word');
    await metamaskPage.fill('input[data-testid="import-srp__srp-word-2"]', 'for');
    await metamaskPage.fill('input[data-testid="import-srp__srp-word-3"]', 'wallet');
    await metamaskPage.fill('input[data-testid="import-srp__srp-word-4"]', 'example');
    await metamaskPage.fill('input[data-testid="import-srp__srp-word-5"]', 'word');
    await metamaskPage.fill('input[data-testid="import-srp__srp-word-6"]', 'for');
    await metamaskPage.fill('input[data-testid="import-srp__srp-word-7"]', 'wallet');
    await metamaskPage.fill('input[data-testid="import-srp__srp-word-8"]', 'example');
    await metamaskPage.fill('input[data-testid="import-srp__srp-word-9"]', 'word');
    await metamaskPage.fill('input[data-testid="import-srp__srp-word-10"]', 'for');
    await metamaskPage.fill('input[data-testid="import-srp__srp-word-11"]', 'wallet');
    await metamaskPage.click('button[data-testid="import-srp-confirm"]');
    
    // set password
    await metamaskPage.fill('input[data-testid="create-password-new"]', PASSWORD_FOR_GMAIL_AND_GETHUB_METAMASK);
    await metamaskPage.fill('input[data-testid="create-password-confirm"]', PASSWORD_FOR_GMAIL_AND_GETHUB_METAMASK);
    await metamaskPage.click('input[type="checkbox"][data-testid="create-password-terms"]');
    await metamaskPage.click('button[data-testid="create-password-import"]');

    // onbording
    await metamaskPage.click('button[data-testid="onboarding-complete-done"]');
    await metamaskPage.click('button[data-testid="pin-extension-next"]');
    await metamaskPage.click('button[data-testid="pin-extension-done"]');
    const modalButton =  metamaskPage.locator('[role="dialog"]');
    await modalButton.getByRole('button', { name: 'Enable' }).click();

    // import new account
    await metamaskPage.locator('[data-testid="account-menu-icon"]').click();
    await metamaskPage.locator('[data-testid="multichain-account-menu-popover-action-button"]').click();
    await metamaskPage.locator('[class="mm-box mm-text mm-button-base mm-button-base--size-sm mm-button-link mm-text--body-md-medium mm-box--padding-0 mm-box--padding-right-0 mm-box--padding-left-0 mm-box--display-inline-flex mm-box--justify-content-center mm-box--align-items-center mm-box--color-primary-default mm-box--background-color-transparent"]').nth(1).click();
    await metamaskPage.locator('[for="private-key-box"]').fill(KEY_FOR_WALLET);
    await metamaskPage.locator('[data-testid="import-account-confirm-button"]').click()

    //change network to sepolia
    await metamaskPage.locator('[data-testid="network-display"]').click();
    const modalButtonOnNetwork =  metamaskPage.locator('[role="dialog"]');
    await modalButtonOnNetwork.locator('[class="toggle-button toggle-button--off"]').click();
    await modalButtonOnNetwork.locator('[data-testid="Sepolia"]').click();

    // add tokens wallet with weth
    await metamaskPage.locator('[data-testid="import-token-button"]').click();
    const importTokensModal =  metamaskPage.locator('[role="dialog"]');
    await importTokensModal.locator('[data-testid="import-tokens-modal-custom-address"]').fill(ADDRESS_FOR_WETH);
    await metamaskPage.waitForTimeout(2000);
    await importTokensModal.locator('[data-testid="import-tokens-button-next"]').click();
    await importTokensModal.locator('[data-testid="import-tokens-modal-import-button"]').click();
    
    return newContext;
}
