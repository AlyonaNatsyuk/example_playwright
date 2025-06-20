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

  await page.goto(BASE_URL_DEV+TRENDING_TAB)
});


test.afterEach(async () => {

  await page.goto(BASE_URL_DEV+TRENDING_TAB);
  
  // Close all tabs except currently one
  const pages =  context.pages();
  for (const p of pages) {
    if (p !== page) {
      await p.close();
    }
  }
});



test('collection list not empty',async()=>{
    expect(page.locator('.h-[16px] w-[16px] cursor-pointer').first());
})

test('check working filter by floor price',async()=>{
    await page.getByRole('button',{name:'Filters'}).click();
    await page.getByRole('button',{name:'Floor price'}).click();
    await page.locator('[placeholder="Min"]').fill('1');
    await page.locator('[placeholder="Max"]').fill('2');
    await page.getByRole('button', { name: 'Apply' }).click();
    expect((page.locator('.h-[16px] w-[16px] cursor-pointer').first()));

  // Get priceText for the first time  
  let priceText = await page.locator('[class="body2-medium text-lightBlack dark:text-ui-100 leading-6 !body1-medium truncate"]').first().getAttribute('title');

  // Now click on the sort by price button
  await page.locator('div:nth-child(5) > svg').click();
  await page.waitForTimeout(3000);

  // Get priceText again after sorting
  priceText = await page.locator('[class="body2-medium text-lightBlack dark:text-ui-100 leading-6 !body1-medium truncate"]').first().getAttribute('title');

  if (priceText !== null) {
    const price = parseFloat(priceText);
  
    // Now check that the price is between 0.02 and 1
    expect(price >= 1 && price <= 2).toBe(true);
  }
})

test('check working filter by categories', async () => {
  const categories = ['art', 'domain-names', 'gaming', 'memberships', 'pfps', 'photography', 'virtual-worlds'];

  // Function to apply the filter and verify visibility
  const applyFilterAndVerify = async (category: string) => {
    await page.locator('div').filter({ hasText: new RegExp(`^${category}$`) }).locator('div').click();
    await page.waitForSelector('[class="flex justify-center flex-[0_0_40px] mobile:flex-[0_0_30px]"]', { state: 'visible' });
    expect(page.locator('[class="flex justify-center flex-[0_0_40px] mobile:flex-[0_0_30px]"]').first()).toBeVisible();
    await page.locator('div').filter({ hasText: new RegExp(`^${category}$`) }).locator('div').click(); // Uncheck the filter
  };

  await page.getByRole('button', { name: 'Filters' }).click();
  await page.getByRole('button', { name: 'Categories' }).click();

  // Loop through each category and apply the filter
  for (const category of categories) {
    await applyFilterAndVerify(category);
  }
});


test ('check clear filters', async()=>{
  await page.getByRole('button', { name: 'Filters' }).click();
  await page.getByRole('button', { name: 'Floor price', exact: true }).click();
  await page.locator('[placeholder="Min"]').fill('1');
  await page.locator('[placeholder="Max"]').fill('2');
  await page.getByRole('button', { name: 'Apply' }).click();
  await page.waitForSelector('[class="rounded-md border border-brand-100 p-2 dark:border-brand-800"]');
  await page.locator('[class="rounded-md border border-brand-100 p-2 dark:border-brand-800"]').click();
  const elementCount = await page.locator('[class="rounded-md border border-brand-100 p-2 dark:border-brand-800"]').count();
  expect(elementCount).toBe(0);
})

test(`open collection page`, async()=>{
  await page.getByPlaceholder('Search Collections...').click();
  await page.getByPlaceholder('Search Collections...').fill('Weee Did It Palz');
  await page.locator('div').filter({ hasText: /^Weee Did It Palz$/ }).click();
  expect(page.getByText('Weee Did It Palz'));
  expect(page.getByText('Floor price'));
  expect(page.getByText('Avg Sale Price'));
  expect(page.getByText('7d Volume'));
  expect(page.locator('span').filter({ hasText: 'Listed' }));
  expect(page.getByText('Owners/Unique'));
  expect(page.getByText('7d Change'));
  expect(page.getByText('30d Change'));
})

test('search collection', async()=>{
  await page.getByPlaceholder('Search Collections...').click();
  await page.getByPlaceholder('Search Collections...').press('CapsLock');
  await page.getByPlaceholder('Search Collections...').fill('NFT NAME');
  expect(page.locator('div').filter({ hasText: /^NFT name$/ }));
})

test('changes by time dropdown', async () => {
  const dropDownMenu = page.locator('button[aria-haspopup="listbox"]');

  // Function to select option and perform checks
  const selectOptionAndCheck = async (optionName: string, floorText: string, volumeText: string) => {
    await dropDownMenu.click();
    await page.getByRole('option', { name: optionName }).locator('div').first().click();
    await page.waitForSelector('[class="flex justify-center flex-[0_0_40px] mobile:flex-[0_0_30px]"]', { state: 'visible' });
    expect(page.locator('[class="flex justify-center flex-[0_0_40px] mobile:flex-[0_0_30px]"]').first()).toBeVisible();  
    expect(page.getByText(floorText)).toBeVisible();
    expect(page.getByText(volumeText)).toBeVisible();
  };

  // Perform checks for each dropdown option
  await selectOptionAndCheck('Last hour', '1h Floor', '1h Volume');
  await selectOptionAndCheck('Last 6 hours', '6h Floor', '6h Volume');
  await selectOptionAndCheck('Last 24 hours', '24h Floor', '24h Volume');
  await selectOptionAndCheck('Last 7 days', '7d Floor', '7d Volume');
  await selectOptionAndCheck('Last 30 days', '30d Floor', '30d Volume');
});

test('sorting by items', async () => {
  const itemsLocator = page.locator('[class="flex items-center gap-[4px] text-ui-950 dark:text-ui-100 flex-[1_1_9%] mobile:pl-2.5 mobile:flex-[1_1_8%] pl-[24px] truncate"]');

  // Function to get the values of the first two collections
  const getCollectionTexts = async () => {
    const firstCollectionText = await itemsLocator.nth(0).textContent();
    const secondCollectionText = await itemsLocator.nth(1).textContent();
    return { firstCollectionText, secondCollectionText };
  };

  // Sorting from largest to smallest
  await page.locator('div').filter({ hasText: /^Items$/ }).getByRole('img').click();
  let { firstCollectionText: textFirstCollection, secondCollectionText: textSecondCollection } = await getCollectionTexts();

  expect(textFirstCollection !== null && textSecondCollection !== null && textFirstCollection >= textSecondCollection).toBe(true);

  // Sorting from smallest to largest
  await page.locator('div').filter({ hasText: /^Items$/ }).getByRole('img').click();
  let { firstCollectionText: textValueFirstCollection, secondCollectionText: textValueSecondCollection } = await getCollectionTexts();

  expect(textValueFirstCollection !== null && textValueSecondCollection !== null && textValueFirstCollection <= textValueSecondCollection).toBe(true);
});

test('sorting by owners', async () => {
  const ownersLocator = page.locator('[class="flex items-center gap-[4px] text-ui-950 dark:text-ui-100 flex-[1_1_9%] mobile:flex-[1_1_7%] pl-[24px] truncate"]');

  // Function to get values and compare them as numbers
  const getAndCompareCollections = async (comparison: (a: number, b: number) => boolean) => {
    const firstCollectionText = await ownersLocator.nth(0).textContent();
    const secondCollectionText = await ownersLocator.nth(1).textContent();

    if (firstCollectionText !== null && secondCollectionText !== null) {
      const numberFirstCollection = parseFloat(firstCollectionText);
      const numberSecondCollection = parseFloat(secondCollectionText);
      expect(comparison(numberFirstCollection, numberSecondCollection)).toBe(true);
    }
  };

  // Sorting from largest to smallest
  await page.locator('div').filter({ hasText: /^Owners$/ }).getByRole('img').click();
  await getAndCompareCollections((a, b) => a >= b);

  // Sorting from smallest to largest
  await page.locator('div').filter({ hasText: /^Owners$/ }).getByRole('img').click();
  await getAndCompareCollections((a, b) => a <= b);
});


test('sorting by floor price', async () => {
  // Function to get floor prices of the first two collections and compare them
  const getAndCompareFloorPrices = async (comparison: (a: number, b: number) => boolean) => {
    const firstNameCollection = await page.locator('[class="body2-medium overflow-hidden pr-0 leading-[1.15] text-ui-950 dark:text-white mobile:pr-2"]').nth(0).textContent();
    const secondNameCollection = await page.locator('[class="body2-medium overflow-hidden pr-0 leading-[1.15] text-ui-950 dark:text-white mobile:pr-2"]').nth(1).textContent();

    const floorPriceFirstCollection = await page.locator(`div:has-text("${firstNameCollection}")`).getByRole('paragraph').nth(0).textContent();
    const floorPriceSecondCollection = await page.locator(`div:has-text("${secondNameCollection}")`).getByRole('paragraph').nth(2).textContent();

    if (floorPriceFirstCollection !== null && floorPriceSecondCollection !== null) {
      const numberFirstCollection = parseFloat(floorPriceFirstCollection);
      const numberSecondCollection = parseFloat(floorPriceSecondCollection);
      expect(comparison(numberFirstCollection, numberSecondCollection)).toBe(true);
    }
  };

  // Sorting from largest to smallest
  await page.locator('div:nth-child(5) > svg').click();
  await getAndCompareFloorPrices((a, b) => a >= b);

  // Sorting from smallest to largest
  await page.locator('div:nth-child(5) > svg').click();
  await getAndCompareFloorPrices((a, b) => a <= b);
});

test('sorting by volume', async () => {
  // Function to get and compare volume values for two collections
  const getAndCompareVolumes = async (comparison: (a: number, b: number) => boolean) => {
    await page.waitForSelector('[class="body2-medium overflow-hidden pr-0 leading-[1.15] text-ui-950 dark:text-white mobile:pr-2"]');
    
    const firstNameCollection = await page.locator('[class="body2-medium overflow-hidden pr-0 leading-[1.15] text-ui-950 dark:text-white mobile:pr-2"]').nth(0).textContent();
    const secondNameCollection = await page.locator('[class="body2-medium overflow-hidden pr-0 leading-[1.15] text-ui-950 dark:text-white mobile:pr-2"]').nth(1).textContent();
    
    const volumeFirstCollection = await page.locator(`div:has-text("${firstNameCollection}")`).getByRole('paragraph').nth(1).textContent();
    const volumeSecondCollection = await page.locator(`div:has-text("${secondNameCollection}")`).getByRole('paragraph').nth(3).textContent();
    
    if (volumeFirstCollection !== null && volumeSecondCollection !== null) {
      const numberFirstCollection = parseFloat(volumeFirstCollection);
      const numberSecondCollection = parseFloat(volumeSecondCollection);
      expect(comparison(numberFirstCollection, numberSecondCollection)).toBe(true);
    }
  };

  // Sorting from smallest to largest
  await page.locator('div').filter({ hasText: /^Volume$/ }).getByRole('img').click();
  await getAndCompareVolumes((a, b) => a <= b);

  // Sorting from largest to smallest
  await page.locator('div').filter({ hasText: /^Volume$/ }).getByRole('img').click();
  await getAndCompareVolumes((a, b) => a >= b);
});
