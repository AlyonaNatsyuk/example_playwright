import { test, expect, BrowserContext, Page } from '@playwright/test';
import {setupMetamaskWithCookie} from '../../utils/setupMetamaskWithCookie'
import {BASE_URL_DEV} from '../../utils/data/constants'
import exp from 'constants';


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

test('search on pop-up', async () => {
  await page.fill('input[placeholder="Search..."]', 'test');
   expect(page.locator('div').filter({ hasText: /test/ }).first())
   
   await page.getByRole('button', { name: 'NFTs' }).click();
   await page.getByPlaceholder('Search...').click();
   expect(page.locator('div').filter({ hasText: /test/ }).first())
   
   await page.fill('input[placeholder="Search..."]', 'acco');
   await page.getByRole('button', { name: 'Profiles' }).click();
   expect(page.locator('div').filter({ hasText: /accou/ }).first())
   });
  

test('display recent search data', async () => {
await page.fill('input[placeholder="Search..."]', 'bored');
await page.locator('[class="flex flex-1 items-center gap-[12px] overflow-hidden"]').first().click();
const collectionName = await page.locator('[class="typography-h5-medium truncate pb-[2px] leading-8 text-ui-950 dark:text-white"]').innerText();
const collectionRegex = new RegExp(`^${collectionName}$`);
await page.fill('input[placeholder="Search..."]', '');
await page.getByRole('banner').getByRole('link').first().click();
await page.getByPlaceholder('Search...').click();
expect(page.locator('div').filter({ hasText: collectionRegex }).nth(1)).toBeVisible();
});
      

test('check display data on search page', async () => {
  await page.fill('input[placeholder="Search..."]', 'bored');
  await page.getByPlaceholder('Search...').press('Enter');
  expect(page.locator('[id="heroicons-outline/star"]').first());
  expect(page.getByRole('tab', { name: 'Collections' }));
  expect(page.getByRole('tab', { name: 'NFTs' }));
  expect(page.getByRole('tab', { name: 'Profiles' }));
});


test('data not display data on search page', async () => {
  await page.fill('input[placeholder="Search..."]', 'something else what we should npt have');
  await page.getByPlaceholder('Search...').press('Enter');
  expect(page.getByText('Found 0 items'));
  expect(page.getByText('Nothing here yet'));
  });


test('check filter by price on collection tab on search page', async () => {
  // Function to process superscript numbers
  const processPriceText = (priceText: string | null): string | null => {
    if (priceText !== null && /[\u2070-\u2079]/.test(priceText)) {
      return priceText.replace(/[\u2070-\u2079]+/g, (match) => {
        const exponent = [...match].map(char => '₀₁₂₃₄₅₆₇₈₉'.indexOf(char)).join('');
        return '0'.repeat(parseInt(exponent));
      });
    }
    return priceText;
  };
  
  await page.fill('input[placeholder="Search..."]', 'bored');
  await page.getByPlaceholder('Search...').press('Enter');
  await page.getByRole('button', { name: 'Filters' }).click();
  await page.getByRole('button', { name: 'Floor price' }).click();
  await page.locator('[placeholder="Min"]').fill('0.02');
  await page.locator('[placeholder="Max"]').fill('1');
  await page.getByRole('button', { name: 'Apply' }).click();
    
  // Get priceText for the first time
  let priceText = await page.locator('[class="body2-medium text-lightBlack dark:text-ui-100 !body1-medium truncate"]').first().textContent();
  
  // Process potential superscripts
  let formattedPriceText = processPriceText(priceText);
    
  // Now click on the sort by price button
  await page.locator('div:nth-child(5) > svg').click();
  await page.waitForTimeout(3000);
  
  // Get priceText again after sorting
  priceText = await page.locator('[class="body2-medium text-lightBlack dark:text-ui-100 !body1-medium truncate"]').first().textContent();
  
  // Process potential superscripts
  formattedPriceText = processPriceText(priceText);
  
  if (formattedPriceText !== null) {
    const price = parseFloat(formattedPriceText);
  
    // Now check that the price is between 0.02 and 1
    expect(price >= 0.02 && price <= 1).toBe(true);
  }
});

test('check filter by categories on collection tab on search page', async () => {
  await page.fill('input[placeholder="Search..."]', 'bored');
  await page.getByPlaceholder('Search...').press('Enter');

  await page.getByRole('button',{name:'Filters'}).click()
  await page.getByRole('button',{name:'Categories'}).click()

  await page.locator('div').filter({ hasText: /^art$/ }).locator('div').click();
  await page.waitForSelector('[class="flex justify-center flex-[0_0_40px] mobile:flex-[0_0_30px]"]', { state: 'visible' });
  expect(page.locator('[class="flex justify-center flex-[0_0_40px] mobile:flex-[0_0_30px]"]').first()).toBeVisible();
  await page.locator('div').filter({ hasText: /^art$/ }).locator('div').click();

  await page.locator('div').filter({ hasText: /^domain-names$/ }).locator('div').click();
  await page.waitForSelector('[class="flex justify-center flex-[0_0_40px] mobile:flex-[0_0_30px]"]', { state: 'visible' });
  expect(page.locator('[class="flex justify-center flex-[0_0_40px] mobile:flex-[0_0_30px]"]').first()).toBeVisible();
  await page.locator('div').filter({ hasText: /^domain-names$/ }).locator('div').click();

  await page.locator('div').filter({ hasText: /^gaming$/ }).locator('div').click();
  await page.waitForSelector('[class="flex justify-center flex-[0_0_40px] mobile:flex-[0_0_30px]"]', { state: 'visible' });
  expect(page.locator('[class="flex justify-center flex-[0_0_40px] mobile:flex-[0_0_30px]"]').first()).toBeVisible();
  await page.locator('div').filter({ hasText: /^gaming$/ }).locator('div').click();

  await page.locator('div').filter({ hasText: /^memberships$/ }).locator('div').click();
  await page.waitForSelector('[class="flex justify-center flex-[0_0_40px] mobile:flex-[0_0_30px]"]', { state: 'visible' });
  expect(page.locator('[class="flex justify-center flex-[0_0_40px] mobile:flex-[0_0_30px]"]').first()).toBeVisible();
  await page.locator('div').filter({ hasText: /^memberships$/ }).locator('div').click();
  
  await page.locator('div').filter({ hasText: /^pfps$/ }).locator('div').click();
  await page.waitForSelector('[class="flex justify-center flex-[0_0_40px] mobile:flex-[0_0_30px]"]', { state: 'visible' });
  expect(page.locator('[class="flex justify-center flex-[0_0_40px] mobile:flex-[0_0_30px]"]').first()).toBeVisible();
  await page.locator('div').filter({ hasText: /^pfps$/ }).locator('div').click();
  
  await page.locator('div').filter({ hasText: /^photography$/ }).locator('div').click();
  await page.waitForSelector('[class="flex justify-center flex-[0_0_40px] mobile:flex-[0_0_30px]"]', { state: 'visible' });
  expect(page.locator('[class="flex justify-center flex-[0_0_40px] mobile:flex-[0_0_30px]"]').first()).toBeVisible();
  await page.locator('div').filter({ hasText: /^photography$/ }).locator('div').click();
  
  await page.locator('div').filter({ hasText: /^virtual-worlds$/ }).locator('div').click();
  await page.waitForSelector('[class="flex justify-center flex-[0_0_40px] mobile:flex-[0_0_30px]"]', { state: 'visible' });
  expect(page.locator('[class="flex justify-center flex-[0_0_40px] mobile:flex-[0_0_30px]"]').first()).toBeVisible();
  await page.locator('div').filter({ hasText: /^virtual-worlds$/ }).locator('div').click();
});

test('check clear filters on collection tab on search page', async()=>{
  await page.fill('input[placeholder="Search..."]', 'bored');
  await page.getByPlaceholder('Search...').press('Enter');

  await page.getByRole('button', { name: 'Filters' }).click();
  await page.getByRole('button', { name: 'Floor price', exact: true }).click();

  await page.locator('[placeholder="Min"]').fill('0');
  await page.locator('[placeholder="Max"]').fill('2');
  await page.getByRole('button', { name: 'Apply' }).click();
  await page.waitForSelector('[class="rounded-md border border-brand-100 p-2 dark:border-brand-800"]');
  await page.locator('[class="rounded-md border border-brand-100 p-2 dark:border-brand-800"]').click();
  const elementCount = await page.locator('[class="rounded-md border border-brand-100 p-2 dark:border-brand-800"]').count();
  expect(elementCount).toBe(0);
})

test('changes by time dropdown on collection tab on search page', async()=>{
  await page.fill('input[placeholder="Search..."]', 'bored');
  await page.getByPlaceholder('Search...').press('Enter');

  const dropDownMenu= page.locator('button[aria-haspopup="listbox"]');

  await dropDownMenu.click();
  await page.getByRole('option', { name: 'Last hour' }).locator('div').first().click();
  await page.waitForSelector('[class="flex justify-center flex-[0_0_40px] mobile:flex-[0_0_30px]"]', { state: 'visible' });
  expect(page.locator('[class="flex justify-center flex-[0_0_40px] mobile:flex-[0_0_30px]"]').first()).toBeVisible();    
  expect(page.getByText('1h Floor'));
  expect(page.getByText('1h Volume'));

  await dropDownMenu.click();
  await page.getByRole('option', { name: 'Last 6 hours' }).locator('div').first().click();
  await page.waitForSelector('[class="flex justify-center flex-[0_0_40px] mobile:flex-[0_0_30px]"]', { state: 'visible' });
  expect(page.locator('[class="flex justify-center flex-[0_0_40px] mobile:flex-[0_0_30px]"]').first()).toBeVisible();  
  expect(page.getByText('6h Floor'));
  expect(page.getByText('6h Volume'));


  await dropDownMenu.click();
  await page.getByRole('option', { name: 'Last 24 hours' }).locator('div').first().click();
  await page.waitForSelector('[class="flex justify-center flex-[0_0_40px] mobile:flex-[0_0_30px]"]', { state: 'visible' });
  expect(page.locator('[class="flex justify-center flex-[0_0_40px] mobile:flex-[0_0_30px]"]').first()).toBeVisible();  
  expect(page.getByText('24h'));
  expect(page.getByText('24h'));

  await dropDownMenu.click();
  await page.getByRole('option', { name: 'Last 7 days' }).locator('div').first().click();
  await page.waitForSelector('[class="flex justify-center flex-[0_0_40px] mobile:flex-[0_0_30px]"]', { state: 'visible' });
  expect(page.locator('[class="flex justify-center flex-[0_0_40px] mobile:flex-[0_0_30px]"]').first()).toBeVisible();  
  expect(page.getByText('7d Floor'));
  expect(page.getByText('7d Volume'));

  await dropDownMenu.click();
  await page.getByRole('option', { name: 'Last 30 days' }).locator('div').first().click();
  await page.waitForSelector('[class="flex justify-center flex-[0_0_40px] mobile:flex-[0_0_30px]"]', { state: 'visible' });
  expect(page.locator('[class="flex justify-center flex-[0_0_40px] mobile:flex-[0_0_30px]"]').first()).toBeVisible();  
  expect(page.getByText('30d Floor'));
  expect(page.getByText('30d Volume'));
})

test('sorting by items on collection tab on search page', async () => {
  await page.fill('input[placeholder="Search..."]', 'bored');
  await page.getByPlaceholder('Search...').press('Enter');

  const itemsLocator = page.locator('[class="flex items-center gap-[4px] text-ui-950 dark:text-ui-100 flex-[1_1_9%] mobile:flex-[1_1_8%] pl-[24px]"]');

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

test('sorting by owners on collection tab on search page', async () => {
  await page.fill('input[placeholder="Search..."]', 'bored');
  await page.getByPlaceholder('Search...').press('Enter');

  const ownersLocator = page.locator('[class="flex items-center gap-[4px] text-ui-950 dark:text-ui-100 flex-[1_1_9%] mobile:flex-[1_1_7%] pl-[24px]"]');

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

test('sorting by floor price on collection tab on search page', async () => {
  await page.fill('input[placeholder="Search..."]', 'bored');
  await page.getByPlaceholder('Search...').press('Enter');

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


test('sorting by volume on collection tab on search page', async () => {
  await page.fill('input[placeholder="Search..."]', 'bored');
  await page.getByPlaceholder('Search...').press('Enter');

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

  // Sorting from largest to smallest
  await page.locator('div').filter({ hasText: /^Volume$/ }).getByRole('img').click();
  await getAndCompareVolumes((a, b) => a >= b);

  // Sorting from smallest to largest
  await page.locator('div').filter({ hasText: /^Volume$/ }).getByRole('img').click();
  await getAndCompareVolumes((a, b) => a <= b);
});

test('check sort by Rarity on nft tab on search page', async () => {
  await page.fill('input[placeholder="Search..."]', 'weee');
  await page.getByPlaceholder('Search...').press('Enter');

  await page.getByRole('tab', { name: 'NFTs' }).click();
  await page.locator('div').filter({ hasText: /^FiltersLiveSort$/ }).getByRole('img').nth(2).click();

  const rarityLocator = page.locator('[class="flex items-center gap-[4px] text-ui-950 dark:text-ui-100 flex-[1_1_9%] small-desktop:flex-[1_1_8%] mobile:flex-[1_1_8%] pl-[24px]"]');

  // Function to compare rarity values
  const compareRarityValues = async (comparison: (a: number, b: number) => boolean) => {
    const rarityFirstNft = await rarityLocator.nth(0).textContent();
    const raritySecondNft = await rarityLocator.nth(1).textContent();

    if (rarityFirstNft !== null && raritySecondNft !== null) {
      const numberFirstCollection = parseFloat(rarityFirstNft);
      const numberSecondCollection = parseFloat(raritySecondNft);
      expect(comparison(numberFirstCollection, numberSecondCollection)).toBe(true);
    }
  };

  // Sorting from largest to smallest
  await page.locator('.body2-medium > svg').click();
  await compareRarityValues((a, b) => a >= b);

  // Sorting from smallest to largest
  await page.locator('.body2-medium > svg').click();
  await compareRarityValues((a, b) => a <= b);
});

test('change view on nft tab on search pages', async () => {
  await page.fill('input[placeholder="Search..."]', 'weee');
  await page.getByPlaceholder('Search...').press('Enter');
  await page.getByRole('tab', { name: 'NFTs' }).click();

  let tile = page.locator('.max-h-\\[100\\%\\] > div > div');
  let marketplaceLocator = page.locator('[class="body2-medium relative flex items-center gap-[8px] whitespace-nowrap text-left text-ui-500 flex-[1_1_9%] small-desktop:flex-[1_1_9%] mobile:flex-[1_1_11%]"]');

  // Check if marketplaceLocator exists and tile doesn't exist
  if (await marketplaceLocator.count() > 0 && await tile.count() === 0) {
    await page.locator('div').filter({ hasText: /^FiltersLiveLast 24 hours$/ }).getByRole('img').nth(1).click();
    expect(await tile.count()).toBeGreaterThan(0); // Verify that tile is now present

    await page.locator('div').filter({ hasText: /^FiltersLiveSort$/ }).getByRole('img').nth(2).click();
    marketplaceLocator = page.locator('[class="body2-medium relative flex items-center gap-[8px] whitespace-nowrap text-left text-ui-500 flex-[1_1_9%] small-desktop:flex-[1_1_9%] mobile:flex-[1_1_11%]"]');
    expect(await marketplaceLocator.count()).toBeGreaterThan(0); // Verify that marketplaceLocator is now present
  }
  
  // Check if tile exists and listing doesn't exist
  if (await tile.count() > 0 && await marketplaceLocator.count() === 0) {
    await page.locator('div').filter({ hasText: /^FiltersLiveSort$/ }).getByRole('img').nth(2).click();
    expect(await marketplaceLocator.count()).toBeGreaterThan(0); // Verify that marketplaceLocator is now present

    await page.locator('div').filter({ hasText: /^FiltersLiveLast 24 hours$/ }).getByRole('img').nth(1).click();
    tile = page.locator('.max-h-\\[100\\%\\] > div > div');
    expect(await tile.count()).toBeGreaterThan(0); // Verify that tile is now present
  }
});

test('check sort from dropdown on nft tab on search page', async () => {
  await page.fill('input[placeholder="Search..."]', 'weee');
  await page.getByPlaceholder('Search...').press('Enter');

  await page.getByRole('tab', { name: 'NFTs' }).click();
  await page.locator('div').filter({ hasText: /^FiltersLiveSort$/ }).getByRole('img').nth(2).click();

  const sorts = ['Rarity Lowest to Highest', 'Rarity Highest to Lowest', 'Price Lowest to Highest', 'Price Highest to Lowest', 'Marketplace A to Z', 'Marketplace Z to A', 'Listed Oldest to Newest', 'Listed Newest to Oldest'];
  const dropDownMenu= page.locator('button[aria-haspopup="listbox"]').first();
  const rarityLocator = page.locator('[class="flex items-center gap-[4px] text-ui-950 dark:text-ui-100 flex-[1_1_9%] small-desktop:flex-[1_1_8%] mobile:flex-[1_1_8%]"]');
  const priceLocator = page.locator('[class="body2-medium text-lightBlack dark:text-ui-100 !body1-medium truncate leading-6"]');


  // Function to compare rarity values
  const compareRarityValues = async (comparison: (a: number, b: number) => boolean) => {
    const rarityFirstNft = await rarityLocator.nth(0).textContent();
    const raritySecondNft = await rarityLocator.nth(1).textContent();

    if (rarityFirstNft !== null && raritySecondNft !== null) {
      const numberFirstCollection = parseFloat(rarityFirstNft);
      const numberSecondCollection = parseFloat(raritySecondNft);
      expect(comparison(numberFirstCollection, numberSecondCollection)).toBe(true);
    }
  };

  // Function to compare price values
  const comparePriceValues = async (comparison: (a: number, b: number) => boolean) => {
    const priceFirstNft = await priceLocator.nth(0).textContent();
    const priceSecondNft = await priceLocator.nth(1).textContent();

    if (priceFirstNft !== null && priceSecondNft !== null) {
      const numberFirstCollection = parseFloat(priceFirstNft);
      const numberSecondCollection = parseFloat(priceSecondNft);
      expect(comparison(numberFirstCollection, numberSecondCollection)).toBe(true);
    }
  };

  const listedLocator = page.locator('[class="body2-medium text-ui-500 dark:text-ui-400"]');

  // Function to convert text to minutes
  function convertToMinutes(text: string | null): number {
    if (!text) return 0;

    const timeValue = parseFloat(text.split(' ')[0]);
    const timeUnit = text.split(' ')[1];

    switch (timeUnit) {
      case 'minute':
      case 'minutes':
        return timeValue;
      case 'hour':
      case 'hours':
        return timeValue * 60;
      case 'day':
      case 'days':
        return timeValue * 60 * 24;
      case 'month':
      case 'months':
        return timeValue * 60 * 24 * 30.44; // Average number of days in a month
      case 'year':
      case 'years':
        return timeValue * 60 * 24 * 365.25; // Average number of days in a year
      default:
        return 0;
    }
  }

  // Function to check sorting
  const checkSortingListed = async (comparison: (a: number, b: number) => boolean) => {
    const firstListed = await listedLocator.nth(0).textContent();
    const secondListed = await listedLocator.nth(1).textContent();

    const timeInMinuteFirstNft = convertToMinutes(firstListed);
    const timeInMinuteSecondNft = convertToMinutes(secondListed);

    if (timeInMinuteFirstNft !== null && timeInMinuteSecondNft !== null) {
      expect(comparison(timeInMinuteFirstNft, timeInMinuteSecondNft)).toBe(true);
    }
  };

  let allLocators: string[] = [];
  let allLocatorsSorted: string[] = [];

  // Find all img elements and extract their alt attributes
  const imgElements = page.locator('[class="h-[12px] w-[12px]"]');

  // Get the total count of img elements
  const count = await imgElements.count();

  // Loop through each img element and get its alt attribute
  for (let i = 0; i < count; i++) {
    const altText = await imgElements.nth(i).getAttribute('alt');
    if (altText) {
      allLocators.push(altText);
    }
  }
  
  // Iterate through each sort option
  for (const sortOption of sorts) {
    // Click on the dropdown menu
    await dropDownMenu.click();

    // Select the sort option from the dropdown
    await page.getByRole('option', { name: sortOption }).locator('div').first().click();
    if (sortOption == 'Rarity Lowest to Highest'){
      await compareRarityValues((a, b) => a <= b);
    }
    if (sortOption == 'Rarity Highest to Lowest'){
      await compareRarityValues((a, b) => a >= b);
    }
    if (sortOption == 'Price Lowest to Highest'){
      await comparePriceValues((a, b) => a <= b);
    }
    if (sortOption == 'Price Highest to Lowest'){
      await comparePriceValues((a, b) => a >= b);
    }
    if (sortOption == 'Marketplace A to Z'){
      // Sort the collected alt attributes from A to Z
      allLocatorsSorted = [...allLocators].sort(); // Sort in ascending order (A to Z)
      await page.locator('div').filter({ hasText: /^Market$/ }).getByRole('img').click();
      expect(allLocators).toEqual(allLocatorsSorted);
    }
    if (sortOption == 'Marketplace Z to A'){
      await page.locator('div').filter({ hasText: /^Market$/ }).getByRole('img').click();
      allLocatorsSorted = [...allLocators].sort().reverse(); // Sort in descending order (Z to A)
      expect(allLocators).toEqual(allLocatorsSorted);
    }
    if (sortOption == 'Listed Oldest to Newest'){
      await checkSortingListed((a, b) => a >= b);
    }
    if (sortOption == 'Listed Newest to Oldest'){
      await checkSortingListed((a, b) => a <= b);
    }
  }
});
