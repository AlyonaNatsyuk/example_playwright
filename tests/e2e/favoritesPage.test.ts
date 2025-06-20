import { test, expect, BrowserContext, Page} from '@playwright/test';
import { BASE_URL_DEV, TRENDING_TAB, COLLECTION_DETAILS_PAGE, NFT_PAGE, FAVORITES_NFT_COLLECTION_PAGE } from '../../utils/data/constants'
import {setupMetamaskWithCookie} from '../../utils/setupMetamaskWithCookie'
import {loginViaMetamask} from '../../utils/loginViaMetamask'
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

    await page.goto(BASE_URL_DEV+TRENDING_TAB);
    
    // Close all tabs except currently one
    const pages =  context.pages();
    for (const p of pages) {
      if (p !== page) {
        await p.close();
      }
    }
  });

async function addToFavorites() {
  await page.goto(BASE_URL_DEV + COLLECTION_DETAILS_PAGE);
  let nameCollection = await page.locator('[class="typography-h5-medium truncate pb-[2px] leading-8 text-ui-950 dark:text-white"]').textContent();
  await page.locator('div').filter({ hasText: new RegExp(`^${nameCollection}$`) }).getByRole('img').click();

  await page.goto(BASE_URL_DEV + NFT_PAGE);
  nameCollection = await page.locator('[class="typography-h5-medium truncate pb-[2px] leading-8 text-ui-950 dark:text-white"]').textContent();
  await page.locator('div').filter({ hasText: new RegExp(`^${nameCollection}$`) }).getByRole('img').click();
  await page.goto(BASE_URL_DEV + FAVORITES_NFT_COLLECTION_PAGE);
}

test('check sorts by Items on Favorites page', async () => {
  const itemsLocator = page.locator('[class="flex items-center gap-[4px] text-ui-950 dark:text-ui-100 flex-[1_1_9%] mobile:pl-2.5 mobile:flex-[1_1_8%] pl-[24px] truncate"]');

  // Function to get the values of the first two collections as numbers
  const getCollectionTextsAsNumbers = async () => {
    const firstCollectionText = await itemsLocator.nth(0).textContent();
    const secondCollectionText = await itemsLocator.nth(1).textContent();

    const firstCollectionNumber = firstCollectionText ? parseFloat(firstCollectionText) : 0;
    const secondCollectionNumber = secondCollectionText ? parseFloat(secondCollectionText) : 0;

    return { firstCollectionNumber, secondCollectionNumber };
  };

  // Function to perform sorting checks
  const performSortingChecks = async () => {
    // Sorting from smallest to largest
    await page.locator('div').filter({ hasText: /^Items$/ }).getByRole('img').click();
    let { firstCollectionNumber: textValueFirstCollection, secondCollectionNumber: textValueSecondCollection } = await getCollectionTextsAsNumbers();
    expect(textValueFirstCollection !== null && textValueSecondCollection !== null && textValueFirstCollection <= textValueSecondCollection).toBe(true);

    // Sorting from largest to smallest
    await page.locator('div').filter({ hasText: /^Items$/ }).getByRole('img').click();
    let { firstCollectionNumber: textFirstCollection, secondCollectionNumber: textSecondCollection } = await getCollectionTextsAsNumbers();
    console.log(textFirstCollection);
    console.log(textSecondCollection);
    expect(textFirstCollection !== null && textSecondCollection !== null && textFirstCollection >= textSecondCollection).toBe(true);
  };

  const sorting = async () => {
    // Check if there are elements to sort
    const elementsExist = await page.locator('[class="group body1-medium flex items-center border-b-[1px] border-ui-150 py-[10px] leading-none hover:bg-ui-50 dark:border-ui-800 dark:text-ui-100 dark:hover:bg-ui-900 mobile:!w-[1024px]"]').count();
    let numberOfElements = 0;

    if (elementsExist > 0) {
      numberOfElements = await page.$$eval('[class="group body1-medium flex items-center border-b-[1px] border-ui-150 py-[10px] leading-none hover:bg-ui-50 dark:border-ui-800 dark:text-ui-100 dark:hover:bg-ui-900 mobile:!w-[1024px]"]', elements => elements.length);
    }

    // If there are more than 2 elements, check sorting
    if (numberOfElements >= 2) {
      await performSortingChecks();
    } else {
      // If there are no elements or fewer than 2, add to favorites
      await addToFavorites();
      // After adding to favorites, repeat verification
      await performSortingChecks();
    }
  };

  // Check if logged in
  await page.goto(BASE_URL_DEV + FAVORITES_NFT_COLLECTION_PAGE);
  const connectButtonVisible = await page.getByRole('button', { name: 'Connect to Ethereum' }).isVisible();

  if (connectButtonVisible) {
    await page.goto(BASE_URL_DEV);
    await loginViaMetamask(page, context);
    await page.goto(BASE_URL_DEV + FAVORITES_NFT_COLLECTION_PAGE);
    await page.waitForTimeout(1000);
    await sorting();
  } else {
    await page.goto(BASE_URL_DEV + FAVORITES_NFT_COLLECTION_PAGE);
    await page.waitForTimeout(1000);
    await sorting();
  }
});

test('check sorts by owners on Favorites page', async () => {
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

  // Function to perform sorting checks
  const performSortingChecks = async () => {
    // Sorting from largest to smallest
    await page.locator('div').filter({ hasText: /^Owners$/ }).getByRole('img').click();
    await getAndCompareCollections((a, b) => a >= b);

    // Sorting from smallest to largest
    await page.locator('div').filter({ hasText: /^Owners$/ }).getByRole('img').click();
    await getAndCompareCollections((a, b) => a <= b);
  };

  const sorting = async () => {
    // Check if there are elements to sort
    const elementsExist = await page.locator('[class="group body1-medium flex items-center border-b-[1px] border-ui-150 py-[10px] leading-none hover:bg-ui-50 dark:border-ui-800 dark:text-ui-100 dark:hover:bg-ui-900 mobile:!w-[1024px]"]').count();
    let numberOfElements = 0;

    if (elementsExist > 0) {
      numberOfElements = await page.$$eval('[class="group body1-medium flex items-center border-b-[1px] border-ui-150 py-[10px] leading-none hover:bg-ui-50 dark:border-ui-800 dark:text-ui-100 dark:hover:bg-ui-900 mobile:!w-[1024px]"]', elements => elements.length);
    }

    // If there are more than 2 elements, perform sorting checks
    if (numberOfElements >= 2) {
      await performSortingChecks();
    } else {
      // If there are no elements or fewer than 2, add to favorites and repeat sorting checks
      await addToFavorites();
      await performSortingChecks();
    }
  };

  // Check if logged in
  await page.goto(BASE_URL_DEV + FAVORITES_NFT_COLLECTION_PAGE);
  const connectButtonVisible = await page.getByRole('button', { name: 'Connect to Ethereum' }).isVisible();

  if (connectButtonVisible) {
    await page.goto(BASE_URL_DEV);
    await loginViaMetamask(page, context);
    await page.goto(BASE_URL_DEV + FAVORITES_NFT_COLLECTION_PAGE);
    await page.waitForTimeout(1000);
    await sorting();
  } else {
    await page.goto(BASE_URL_DEV + FAVORITES_NFT_COLLECTION_PAGE);
    await page.waitForTimeout(1000);
    await sorting();
  }
});

test('check sorts by floor price on Favorites page', async () => {
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

  // Function to perform sorting checks
  const performSortingChecks = async () => {
    // Sorting from largest to smallest
    await page.locator('div:nth-child(5) > svg').click();
    await getAndCompareFloorPrices((a, b) => a >= b);

    // Sorting from smallest to largest
    await page.locator('div:nth-child(5) > svg').click();
    await getAndCompareFloorPrices((a, b) => a <= b);
  };

  const sorting = async () => {
    const elementsExist = await page.locator('[class="group body1-medium flex items-center border-b-[1px] border-ui-150 py-[10px] leading-none hover:bg-ui-50 dark:border-ui-800 dark:text-ui-100 dark:hover:bg-ui-900 mobile:!w-[1024px]"]').count();

    if (elementsExist > 0) {
      const numberOfElements = await page.$$eval('[class="group body1-medium flex items-center border-b-[1px] border-ui-150 py-[10px] leading-none hover:bg-ui-50 dark:border-ui-800 dark:text-ui-100 dark:hover:bg-ui-900 mobile:!w-[1024px]"]', elements => elements.length);

      if (numberOfElements >= 2) {
        await performSortingChecks();
      } else {
        await addToFavorites();
        await performSortingChecks();
      }
    }
  };

  // Check if logged in
  await page.goto(BASE_URL_DEV + FAVORITES_NFT_COLLECTION_PAGE);
  const connectButtonVisible = await page.getByRole('button', { name: 'Connect to Ethereum' }).isVisible();

  if (connectButtonVisible) {
    await page.goto(BASE_URL_DEV);
    await loginViaMetamask(page, context);
    await page.goto(BASE_URL_DEV + FAVORITES_NFT_COLLECTION_PAGE);
    await page.waitForTimeout(1000);
    await sorting();
  } else {
    await page.goto(BASE_URL_DEV + FAVORITES_NFT_COLLECTION_PAGE);
    await page.waitForTimeout(1000);
    await sorting();
  }
});

test('check sorts by volume on Favorites page', async () => {
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

  // Function to perform sorting checks
  const performSortingChecks = async () => {
    // Sorting from largest to smallest
    await page.locator('div').filter({ hasText: /^Volume$/ }).getByRole('img').click();
    await getAndCompareVolumes((a, b) => a >= b);

    // Sorting from smallest to largest
    await page.locator('div').filter({ hasText: /^Volume$/ }).getByRole('img').click();
    await getAndCompareVolumes((a, b) => a <= b);
  };

  const sorting = async () => {
    const elementsExist = await page.locator('[class="group body1-medium flex items-center border-b-[1px] border-ui-150 py-[10px] leading-none hover:bg-ui-50 dark:border-ui-800 dark:text-ui-100 dark:hover:bg-ui-900 mobile:!w-[1024px]"]').count();

    if (elementsExist > 0) {
      const numberOfElements = await page.$$eval('[class="group body1-medium flex items-center border-b-[1px] border-ui-150 py-[10px] leading-none hover:bg-ui-50 dark:border-ui-800 dark:text-ui-100 dark:hover:bg-ui-900 mobile:!w-[1024px]"]', elements => elements.length);

      if (numberOfElements >= 2) {
        await performSortingChecks();
      } else {
        // If there are no elements or fewer than 2, add to favorites and repeat sorting checks
        await addToFavorites();
        await performSortingChecks();
      }
    }
  };

  // Check if logged in
  await page.goto(BASE_URL_DEV + FAVORITES_NFT_COLLECTION_PAGE);
  const connectButtonVisible = await page.getByRole('button', { name: 'Connect to Ethereum' }).isVisible();

  if (connectButtonVisible) {
    await page.goto(BASE_URL_DEV);
    await loginViaMetamask(page, context);
    await page.goto(BASE_URL_DEV + FAVORITES_NFT_COLLECTION_PAGE);
    await page.waitForTimeout(1000);
    await sorting();
  } else {
    await page.goto(BASE_URL_DEV + FAVORITES_NFT_COLLECTION_PAGE);
    await page.waitForTimeout(1000);
    await sorting();
  }
}
);

test('choose nfts using filter by floor price on Favorites page', async () => {
  // Function to apply filters and verify sorting
  const applyFiltersAndVerifyPrice = async () => {
    await page.getByRole('button', { name: 'Filters' }).click();
    await page.getByRole('button', { name: 'Floor price' }).click();
    await page.locator('[placeholder="Min"]').fill('0');
    await page.locator('[placeholder="Max"]').fill('1');
    await page.getByRole('button', { name: 'Apply' }).click();
    expect((page.locator('.h-[16px] w-[16px] cursor-pointer').first()));

    const allElements = await page.$$('[class="body2-medium text-lightBlack dark:text-ui-100 leading-6 !body1-medium truncate"]');
    const allTitles = [];

    for (const element of allElements) {
      const title = await element.getAttribute('title');
      if (title) {
        allTitles.push(title);
      }
    }

    allTitles.forEach(title => {
      const number = parseFloat(title);
      expect(number).toBeGreaterThanOrEqual(0);
      expect(number).toBeLessThanOrEqual(1);
    });
  };

  // Function to check elements and apply filters
  const checkAndApplyFilters = async () => {
    const elementsExist = await page.locator('[class="group body1-medium flex items-center border-b-[1px] border-ui-150 py-[10px] leading-none hover:bg-ui-50 dark:border-ui-800 dark:text-ui-100 dark:hover:bg-ui-900 mobile:!w-[1024px]"]').count();
    let numberOfElements = 0;

    if (elementsExist > 0) {
      numberOfElements = await page.$$eval('[class="group body1-medium flex items-center border-b-[1px] border-ui-150 py-[10px] leading-none hover:bg-ui-50 dark:border-ui-800 dark:text-ui-100 dark:hover:bg-ui-900 mobile:!w-[1024px]"]', elements => elements.length);
    }

    // If there are more than 2 elements, apply filters and verify
    if (numberOfElements >= 2) {
      await applyFiltersAndVerifyPrice();
    } else {
      // If there are no elements or fewer than 2, add to favorites and then verify
      await addToFavorites();
      await applyFiltersAndVerifyPrice();
    }
  };

  await page.goto(BASE_URL_DEV + FAVORITES_NFT_COLLECTION_PAGE);
  const connectButtonVisible = await page.getByRole('button', { name: 'Connect to Ethereum' }).isVisible();

  if (connectButtonVisible) {
    await page.goto(BASE_URL_DEV);
    await loginViaMetamask(page, context);
    await page.goto(BASE_URL_DEV + FAVORITES_NFT_COLLECTION_PAGE);
    await page.waitForTimeout(1000);
    await checkAndApplyFilters();
  } else {
    await page.goto(BASE_URL_DEV + FAVORITES_NFT_COLLECTION_PAGE);
    await page.waitForTimeout(1000);
    await checkAndApplyFilters();
  }
});

test('choose nfts using filter by categories on Favorites page', async () => {
  // Function to apply filters and verify sorting for a specific category
  const applyCategoryFilterAndVerify = async (category: string) => {
    await page.locator('div').filter({ hasText: new RegExp(`^${category}$`) }).locator('div').click();
    try {
      await expect(page.locator('[class="flex justify-center flex-[0_0_40px] mobile:flex-[0_0_30px]"]').first()).toBeVisible();
    } catch (error) {
      const nothingHereText = await page.locator('text=Nothing here yet').isVisible();
      expect(nothingHereText).toBe(true);
    }
    await page.locator('div').filter({ hasText: new RegExp(`^${category}$`) }).locator('div').click(); // Uncheck the filter
  };

  // Function to apply all category filters and verify
  const applyFiltersAndVerify = async () => {
    await page.getByRole('button', { name: 'Filters' }).click();
    await page.getByRole('button', { name: 'Categories' }).click();

// get all the data from the locators and write them into a variable in the form of an array
  const categories = await page.$$eval(
    '[class="flex-1 leading-none text-ui-950 dark:text-white"]',
    elements => elements.map(element => element.textContent?.trim() || '')
  );

  for (const category of categories) {
      await applyCategoryFilterAndVerify(category);
    }
  };

  // Function to check elements and apply filters
  const checkAndApplyFilters = async () => {
    await page.waitForTimeout(1000);
    const elementsExist = await page.locator('[class="group body1-medium flex items-center border-b-[1px] border-ui-150 py-[10px] leading-none hover:bg-ui-50 dark:border-ui-800 dark:text-ui-100 dark:hover:bg-ui-900 mobile:!w-[1024px]"]').count();

    let numberOfElements = 0;
    if (elementsExist > 0) {
      numberOfElements = await page.$$eval('[class="group body1-medium flex items-center border-b-[1px] border-ui-150 py-[10px] leading-none hover:bg-ui-50 dark:border-ui-800 dark:text-ui-100 dark:hover:bg-ui-900 mobile:!w-[1024px]"]', elements => elements.length);
    }

    // If there are more than 2 elements, apply filters and verify
    if (numberOfElements >= 2) {
      await applyFiltersAndVerify();
    } else {
      // If there are no elements or fewer than 2, add to favorites and then verify
      await addToFavorites();
      await applyFiltersAndVerify();
    }
  };

  // Check if user is connected
  await page.goto(BASE_URL_DEV + FAVORITES_NFT_COLLECTION_PAGE);
  const connectButtonVisible = await page.getByRole('button', { name: 'Connect to Ethereum' }).isVisible();

  if (connectButtonVisible) {
    await page.goto(BASE_URL_DEV);
    await loginViaMetamask(page, context);
    await page.goto(BASE_URL_DEV + FAVORITES_NFT_COLLECTION_PAGE);
    await checkAndApplyFilters();
  } else {
    await page.goto(BASE_URL_DEV + FAVORITES_NFT_COLLECTION_PAGE);
    await checkAndApplyFilters();
  }
});

test('check clear filters on Favorites page', async()=>{
  const checkAndApplyFilters = async () => {
    await page.getByRole('button', { name: 'Filters' }).click();
    await page.getByRole('button', { name: 'Floor price', exact: true }).click();
    await page.locator('[placeholder="Min"]').fill('1');
    await page.locator('[placeholder="Max"]').fill('2');
    await page.getByRole('button', { name: 'Apply' }).click();
    expect(page.locator('[class="rounded-md border border-brand-100 p-2 dark:border-brand-800"]')).toBeVisible();
    await page.locator('[class="rounded-md border border-brand-100 p-2 dark:border-brand-800"]').click();
    const elementCount = await page.locator('[class="rounded-md border border-brand-100 p-2 dark:border-brand-800"]').count();
    expect(elementCount).toBe(0);
  }

  await page.goto(BASE_URL_DEV + FAVORITES_NFT_COLLECTION_PAGE);
  const connectButtonVisible = await page.getByRole('button', { name: 'Connect to Ethereum' }).isVisible();
  if (connectButtonVisible) {
    await page.goto(BASE_URL_DEV);
    await loginViaMetamask(page, context);
    await page.goto(BASE_URL_DEV + FAVORITES_NFT_COLLECTION_PAGE);
    await checkAndApplyFilters();
  } else {
    await page.goto(BASE_URL_DEV + FAVORITES_NFT_COLLECTION_PAGE);
    await checkAndApplyFilters();
  }
})

test('changes by time dropdown on Favorites page', async () => {
  const checkOnDropMenu = async () => {
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
}

  await page.goto(BASE_URL_DEV + FAVORITES_NFT_COLLECTION_PAGE);
  const connectButtonVisible = await page.getByRole('button', { name: 'Connect to Ethereum' }).isVisible();
  if (connectButtonVisible) {
    await page.goto(BASE_URL_DEV);
    await loginViaMetamask(page, context);
    await page.goto(BASE_URL_DEV + FAVORITES_NFT_COLLECTION_PAGE);
    await checkOnDropMenu();
  } else {
    await page.goto(BASE_URL_DEV + FAVORITES_NFT_COLLECTION_PAGE);
    await checkOnDropMenu();
  }
});