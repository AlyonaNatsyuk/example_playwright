import { test, expect, BrowserContext, Page} from '@playwright/test';
import {setupMetamaskWithCookie} from '../../utils/setupMetamaskWithCookie'
import {BASE_URL_DEV, TRENDING_TAB, COLLECTION_DETAILS_PAGE, COLLECTION_DETAILS_PAGE_BRAIN, COLLECTION_DETAILS_PAGE_BORED} from '../../utils/data/constants'

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

  await page.goto(BASE_URL_DEV+COLLECTION_DETAILS_PAGE);
  await page.locator('div').filter({ hasText: /^FiltersFLivePrice Lowest to HighestAnalytics$/ }).getByRole('img').nth(3).click();
});


test.afterEach(async () => {

    await page.goto(BASE_URL_DEV+COLLECTION_DETAILS_PAGE);
    
    // Close all tabs except currently one
    const pages =  context.pages();
    for (const p of pages) {
      if (p !== page) {
        await p.close();
      }
    }
  });


test.skip('search nft',async()=>{
    await page.goto(BASE_URL_DEV+TRENDING_TAB);
    await page.locator('[class="flex cursor-pointer items-center gap-[10px] overflow-hidden bg-white px-0 group-hover:bg-ui-50 dark:bg-ui-950 dark:group-hover:bg-ui-900 [&>span]:truncate flex-[1_1_26%] mobile:flex-[1_1_16%] mobile:sticky mobile:left-0 mobile:z-[9] overflow-x-hidden mobile:pl-2.5"]').first().click();
    await page.getByPlaceholder('Search NFTs...').fill('tests');//nft Name
    await page.getByPlaceholder('Search NFTs...').press('Enter');
    await page.waitForSelector('[class="text-ui-950 dark:text-ui-100"]');
    expect(page.getByRole('heading', { name: 'Nothing here yet' })).toBeVisible();

    await page.goto(BASE_URL_DEV+COLLECTION_DETAILS_PAGE);
    const nameFirstNft = await page.locator('[class="body2-medium overflow-hidden pr-0 leading-[1.15] text-ui-950 dark:text-white mobile:pr-2"]').first().textContent();
    await page.getByPlaceholder('Search NFTs...').fill(`${nameFirstNft}`);//nft Name
    await page.getByPlaceholder('Search NFTs...').press('Enter');
    await page.waitForTimeout(1000);
    const nameFirstNftAfterSearching = await page.locator('[class="body2-medium overflow-hidden pr-0 leading-[1.15] text-ui-950 dark:text-white mobile:pr-2"]').first().textContent();
    expect(nameFirstNftAfterSearching).toBe(nameFirstNft);
})

test ('choose nfts using filter by price', async () => {
  await page.goto(BASE_URL_DEV + COLLECTION_DETAILS_PAGE_BRAIN);
  await page.getByRole('button', { name: 'Filters' }).click();
  await page.getByRole('button', { name: 'Price', exact: true }).click();
  await page.locator('[placeholder="Min"]').fill('0.2');
  await page.locator('[placeholder="Max"]').fill('1');
  await page.getByRole('button', { name: 'Apply' }).click();

  const allElements = await page.$$('[class="body2-medium text-lightBlack dark:text-ui-100 !body1-medium truncate leading-6"]');
  const allTitles = [];

  for (const element of allElements) {
    const title = await element.getAttribute('title');
    if (title) {
      allTitles.push(title);
    }
  }

  allTitles.forEach(title => {
    const number = parseFloat(title);
    expect(number).toBeGreaterThanOrEqual(0.2);
    expect(number).toBeLessThanOrEqual(1);
  });
});

test('choose nfts using filter by marketplace', async()=>{
    await page.getByRole('button', { name: 'Filters' }).click();
    await page.getByRole('button', { name: 'Marketplace' }).click();
    await page.locator('[class="rounded-[4px] border border-ui-500 h-[16px] w-[16px]"]').click();
    const getFilterNameMarket = await page.locator('[class="flex-1 leading-none text-ui-950 dark:text-white"]').innerText();
    const imgLocator = await page.locator('[class="h-[12px] w-[12px]"]').first().getAttribute('alt');
    expect(getFilterNameMarket).toBe(imgLocator);
})

test('choose nfts using filter by rarity', async()=>{
    await page.getByRole('button', { name: 'Filters' }).click();
    await page.getByRole('button', { name: 'Rarity' }).click();
    const minValue = '1'
    const maxValue = '2'
    await page.getByPlaceholder('From (Rare)').fill(minValue);
    await page.getByPlaceholder('To (Common)').fill(maxValue);
    await page.getByRole('button', { name: 'Apply' }).click();
    const RarityValue = page.locator('[class="flex items-center gap-[4px] text-ui-950 dark:text-ui-100 flex-[1_1_9%] small-desktop:flex-[1_1_8%] mobile:flex-[1_1_8%]"]').first();

    expect(Number(RarityValue.textContent) >= Number(minValue) )
    expect(Number(RarityValue.textContent) <= Number(maxValue) )
})

test('check clear filters', async()=>{
    await page.getByRole('button', { name: 'Filters' }).click();
    await page.getByRole('button', { name: 'Price', exact: true }).click();
    await page.getByPlaceholder('Max').click();
    await page.getByPlaceholder('Max').fill('0.3');
    await page.getByRole('button', { name: 'Apply' }).click();
    await page.waitForSelector('[class="rounded-md border border-brand-100 p-2 dark:border-brand-800"]');
    await page.getByRole('button', { name: 'Clear filters' }).click();
    const elementCount = await page.locator('[class="rounded-md border border-brand-100 p-2 dark:border-brand-800"]').count();
    expect(elementCount).toBe(0);
})


test('check sorting by rarity', async () => {
  const rarityLocator = page.locator('[class="flex items-center gap-[4px] text-ui-950 dark:text-ui-100 flex-[1_1_9%] small-desktop:flex-[1_1_8%] mobile:flex-[1_1_8%]"]');

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
  await page.locator('.body2-medium > svg').first().click();
  await compareRarityValues((a, b) => a >= b);

  // Sorting from smallest to largest
  await page.locator('.body2-medium > svg').first().click();
  await compareRarityValues((a, b) => a <= b);
});


test('check sorting by price', async () => {
  const priceLocator = page.locator('[class="body2-medium text-lightBlack dark:text-ui-100 !body1-medium truncate leading-6"]');

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

  // Sorting from largest to smallest
  await page.locator('div:nth-child(4) > svg').click();
  await comparePriceValues((a, b) => a >= b);

  // Sorting from smallest to largest
  await page.locator('div:nth-child(4) > svg').click();
  await comparePriceValues((a, b) => a <= b);
});


test('check sorting by listed', async () => {
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

  // Sorting from largest to smallest
  await page.locator('div').filter({ hasText: /^Listed$/ }).getByRole('img').click();
  await checkSortingListed((a, b) => a >= b);

  // Sorting from smallest to largest
  await page.locator('div').filter({ hasText: /^Listed$/ }).getByRole('img').click();
  await checkSortingListed((a, b) => a <= b);
});

test('check sorting by marketplace', async () => {
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

  // Sort the collected alt attributes from A to Z
  allLocatorsSorted = [...allLocators].sort(); // Sort in ascending order (A to Z)
  await page.locator('div').filter({ hasText: /^Market$/ }).getByRole('img').click();

  // Compare allLocators with allLocatorsSorted by value, not reference
  expect(allLocators).toEqual(allLocatorsSorted);

  // Sorting from Z to A on the page
  await page.locator('div').filter({ hasText: /^Market$/ }).getByRole('img').click();
  allLocatorsSorted = [...allLocators].sort().reverse(); // Sort in descending order (Z to A)

  // Compare allLocators with allLocatorsSorted by value
  expect(allLocators).toEqual(allLocatorsSorted);
});

test('check filter by all events on analytics block', async () => {
  const names_events = ['Purchased by', 'Created by', 'Listed by', 'Burned by'];
  
  await page.getByRole('button', { name: 'Analytics' }).click();

  for (const eventName of names_events) {
      //locator for all event
      await page.locator('[class="inline-flex h-full max-w-[180px] overflow-hidden items-center justify-center bg-white px-4 py-2 text-[13px] font-medium text-lightBlack transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 group-hover:text-brand-400 dark:bg-ui-950 dark:text-ui-100 w-[155px] mobile:mt-2.5 mobile:justify-start mobile:pl-0 mobile-small:w-full mobile-small:p-0"]').click();
      await page.getByRole('option', { name: eventName }).locator('div').first().click();
      await page.waitForTimeout(1000);
      const isTextVisible = await page.locator('text=No event history yet').isVisible();

      let eventText = '';

      if (!isTextVisible) {
          eventText = await page.locator('.overflow-x-auto > div > div:nth-child(2) > div > div:nth-child(2) > .flex > div').first().innerText();
      }

      if (isTextVisible) {
          expect(isTextVisible).toBe(true);
      } else {
          expect(eventText).toBe(eventName);
      }
  }
});

test('checking the correctness of the selected price amounts', async () => {
  await page.locator('[class="flex cursor-pointer select-none items-center"]').nth(1).click();
  await page.locator('[class="flex cursor-pointer select-none items-center"]').nth(2).click();

  const priceFirstNft = await page.locator('[class="body2-medium text-lightBlack dark:text-ui-100 !body1-medium truncate leading-6"]').nth(0).textContent();
  const priceSecondNft = await page.locator('[class="body2-medium text-lightBlack dark:text-ui-100 !body1-medium truncate leading-6"]').nth(1).textContent();

  const priceFirst = parseFloat(priceFirstNft ?? "0");
  const priceSecond = parseFloat(priceSecondNft ?? "0");
  const sum = priceFirst + priceSecond;

  const sumOnWebText = await page.locator('[class="body2-medium text-lightBlack dark:text-ui-100 leading-6 !body1-medium"]').innerText();
  const sumOnWeb = parseFloat(sumOnWebText);

  expect(sum).toBe(sumOnWeb);
});

test('change view for NFTs', async () => {
  let tile = page.locator('.max-h-\\[100\\%\\] > div > div');
  let marketplaceLocator = page.locator('[class="body2-medium relative flex items-center gap-[8px] whitespace-nowrap text-left text-ui-500 flex-[1_1_9%] small-desktop:flex-[1_1_9%] mobile:flex-[1_1_11%]"]');
  
  // Check if marketplaceLocator exists and tile doesn't exist
  if (await marketplaceLocator.count() > 0 && await tile.count() === 0) {
    await page.locator('div').filter({ hasText: /^FiltersFLivePrice Lowest to HighestAnalytics$/ }).getByRole('img').nth(2).click();
    expect(await tile.count()).toBeGreaterThan(0); // Verify that tile is now present

    await page.locator('div').filter({ hasText: /^FiltersFLivePrice Lowest to HighestAnalytics$/ }).getByRole('img').nth(3).click();
    marketplaceLocator = page.locator('[class="body2-medium relative flex items-center gap-[8px] whitespace-nowrap text-left text-ui-500 flex-[1_1_9%] small-desktop:flex-[1_1_9%] mobile:flex-[1_1_11%]"]');
    expect(await marketplaceLocator.count()).toBeGreaterThan(0); // Verify that marketplaceLocator is now present
  }
  
  // Check if tile exists and marketplaceLocator doesn't exist
  if (await tile.count() > 0 && await marketplaceLocator.count() === 0) {
    await page.locator('div').filter({ hasText: /^FiltersFLivePrice Lowest to HighestAnalytics$/ }).getByRole('img').nth(3).click();
    expect(await marketplaceLocator.count()).toBeGreaterThan(0); // Verify that marketplaceLocator is now present

    await page.locator('div').filter({ hasText: /^FiltersFLivePrice Lowest to HighestAnalytics$/ }).getByRole('img').nth(2).click();
    tile = page.locator('.max-h-\\[100\\%\\] > div > div');
    expect(await tile.count()).toBeGreaterThan(0); // Verify that tile is now present
  }
});

test('check sort from dropdown', async () => {
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

test('display analytics', async()=>{
    await page.getByRole('button', { name: 'Analytics' }).click()
    expect(page.getByText('Price & Sales')).toBeVisible();
})

test('buy now nft unauthorize user', async()=>{
    // Finding the button with the class 'transition-all duration-500...'
    const buttonLocator = page.locator('button.transition-all.duration-500.flex.border-ui-gray-line.dark\\:border-ui-800.items-center.gap-\\[10px\\].px-\\[12px\\].py-\\[12px\\].border-l');
    // Checking the button is visible on the screen
    await expect(buttonLocator).toBeVisible();
    // Checking the 'span' element inside the button is present
    const spanLocator = buttonLocator.locator('span.text-nowrap.font-medium.text-lightBlack.dark\\:text-ui-100');
    // Checking the 'span' element with the specified text is visible
    await expect(spanLocator).toBeVisible();
    await page.locator('[class="body2-medium pr-[10px] text-brand-400"]').first().click();
    expect((page.locator('wui-text').filter({hasText: 'Connect Wallet'}).locator('slot')));
});


test('add to cart nft unauthorize user', async()=>{
    await page.locator('[class="ml-1 max-h-[16px] max-w-[16px]"]').first().click();
    await page.locator('[class="body1-medium flex w-[71px] cursor-pointer items-center justify-center text-lightBlack dark:text-white mobile:h-full"]').click();
    await page.getByRole('button', { name: 'Checkout' }).click();
    expect ((page.locator('wui-text').filter({hasText: 'Connect Wallet'}).locator('slot')))
})

test('choose nfts using filter by other filters', async()=>{
  let name_filter_attribute_response: any;

  // Navigate to the collection details page
  await page.goto(BASE_URL_DEV+COLLECTION_DETAILS_PAGE_BORED);

  // Intercept GraphQL requests to filter and allow only those with 'FilterAttributeNameDtos' in the post data
  await page.route('**/graphql', route => {
  const request = route.request();
  const postData = request.postData();
  if (postData && postData.includes('FilterAttributeNameDtos')) {
    route.continue(); // Allow the request to continue
  } else {
    route.abort(); // Abort requests that do not include 'FilterAttributeNameDtos'
  }
});

  // Listen for responses to capture the API response with FilterAttributeNameDtos data
  page.on('response', async response => {
    if (response.url().includes('graphql')) {
      const responseBody = await response.json();
      if (responseBody.data && responseBody.data.filterAttributeNameDtos) {
        name_filter_attribute_response = responseBody.data.filterAttributeNameDtos; 
      }
    }
  });

  // Wait for a while to ensure all network requests are completed
  await page.waitForTimeout(5000);

  interface AttributeNameDto {
    name: string;
    values: object[];
    __typename: string;
  }

  // Create an array to store name values
  const names = name_filter_attribute_response.map((item: AttributeNameDto) => item.name);
  await page.getByRole('button', { name: 'Filters' }).click();

  for (const name of names) {
    await page.getByRole('button', { name: name, exact: true }).click();
    await page.locator('[class="rounded-[4px] border border-ui-500 h-[16px] w-[16px]"]').first().click();
    expect(page.locator('[class="body2-medium pr-[10px] text-brand-400"]'));
    await page.getByRole('button', { name: name, exact: true }).click();
  }
})
















