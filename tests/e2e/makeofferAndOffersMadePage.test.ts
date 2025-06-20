import { test, expect, BrowserContext, Page} from '@playwright/test';
import { BASE_URL_DEV, URL_OFFERS_PAGE, NFT_PAGE_CAR, NFT_PAGE, NFT_NEW_WEE } from '../../utils/data/constants'
import {setupMetamaskWithCookie} from '../../utils/setupMetamaskWithCookie'
import {loginViaMetamask} from '../../utils/loginViaMetamask'
import {acceptSign, acceptActionsOnOffersPage} from '../../utils/signFunctions'
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

  await loginViaMetamask(page, context);

  await page.goto(BASE_URL_DEV+NFT_PAGE_CAR);
});


test.afterEach(async () => {

    await page.goto(BASE_URL_DEV+NFT_PAGE_CAR);
    
    // Close all tabs except currently one
    const pages =  context.pages();
    for (const p of pages) {
      if (p !== page) {
        await p.close();
      }
    }
  });

  export async function makeOffer(pageUrl = NFT_PAGE, price = '0.004') {
    await page.goto(BASE_URL_DEV + pageUrl);
    await page.getByRole('button', { name: 'Make offer' }).click();
    await page.locator('[class="react-datepicker__input-container"]').click();
    await page.getByLabel('Choose Date and Time').getByRole('img').nth(1).click();
    await page.locator('[class="react-datepicker__day react-datepicker__day--001"]').click();
    await page.getByPlaceholder('Enter price').fill(price);
    await page.getByRole('button', { name: 'Make offer' }).click();
    
    await acceptSign(page, context);
    
    await page.waitForTimeout(3000);
    expect(page.getByText('Order was successfully')).toBeVisible();
  }  
  
  test('сompare name, id and price on pop-up', async () => {
    // Get the text from the locator
    const fullText = await page.locator('[class="max-w-[50%] truncate"]').textContent();
  
    // Declare variables before the condition
    let nameOnNftPage = '';
    let idOnNftPage = '';
  
    // Check if fullText is not null
    if (fullText !== null) {
      // Use a regular expression to split the string
      const match = fullText.trim().match(/(.+?) (\#\d+)/);
  
      if (match) {
        nameOnNftPage = match[1];
        idOnNftPage = match[2];
      }
    }
  
    const priceOnNftPage = await page.locator('[class="body2-medium leading-6 ml-1 text-lightBlack dark:text-white !text-4xl"]').innerText();
    await page.getByRole('button', { name: 'Make offer' }).click();
    
    const nameOnMakeOfferPopUp = await page.locator('[class="body2-regular mt-2.5 text-ui-600 dark:text-ui-400"]').innerText();
    const idOnMakeOfferPopUp = await page.locator('div.flex.items-center.dark\\:text-white p[title]').getAttribute('title');
    const priceOnMakeOfferPopUp = await page.locator('[class="body2-medium text-lightBlack dark:text-ui-100 leading-6 !l2-medium truncate"]').innerText();
    
    expect(nameOnNftPage).toBe(nameOnMakeOfferPopUp);
    expect(idOnNftPage).toBe(idOnMakeOfferPopUp);
    expect(priceOnNftPage).toBe(priceOnMakeOfferPopUp);
  });
  
  test('make offer with price less min price', async()=>{
    await page.getByRole('button', { name: 'Make offer' }).click();
    const priceOnField = await page.locator('[class="py-2 px-2.5 h-9 body2-medium border border-ui-200 text-ui-950 rounded-md outline-none bg-transparent placeholder:text-ui-400 focus:border-ui-400 transition-colors duration-300 dark:text-white pl-7 w-[118px] w-[200px] w-full dark:border-ui-700 dark:text-ui-500"]').innerText();
    await page.getByPlaceholder('Enter price').fill('0.000002');
    const changedpriceOnField = await page.locator('[class="py-2 px-2.5 h-9 body2-medium border border-ui-200 text-ui-950 rounded-md outline-none bg-transparent placeholder:text-ui-400 focus:border-ui-400 transition-colors duration-300 dark:text-white pl-7 w-[118px] w-[200px] w-full dark:border-ui-700 dark:text-ui-500"]').innerText();
    expect(changedpriceOnField).toBe(priceOnField);
  })

  test('make offer with price less than the user have', async () => {
    await page.getByRole('button', { name: 'Make offer' }).click();
    await page.locator('[class="react-datepicker__input-container"]').click();
    await page.getByLabel('Choose Date and Time').getByRole('img').nth(1).click();
    await page.locator('[class="react-datepicker__day react-datepicker__day--001"]').click();
    await page.getByPlaceholder('Enter price').fill('5');
    await page.getByRole('button', { name: 'Make offer' }).click();
    
    // Add waitForSelector for the text to appear
    await page.waitForSelector('text=The offerer does not have the amount needed to create or fulfill.');

    // Now check for visibility
    await expect(page.getByText('The offerer does not have the amount needed to create or fulfill.')).toBeVisible();
});

  test('check correct working for duration field', async () => {
    const times = ['1 month', '7 days', '3 days', '1 day', '12 hours', 'Custom'];
  
    await page.getByRole('button', { name: 'Make offer' }).click();
    for (const time of times) {
      await page.locator('[class="inline-flex max-w-[180px] overflow-hidden items-center bg-white py-2 text-[13px] font-medium text-lightBlack focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 group-hover:text-brand-400 dark:text-ui-100 border border-ui-200 dark:border-ui-700 rounded-md hover:border-brand-400 transition-colors duration-300 h-[36px] w-[125px] justify-between px-[10px] dark:bg-ui-900 mobile-small:w-fit"]').click();
      await page.getByRole('option', { name: time }).locator('div').first().click();
      await page.waitForTimeout(1000);
  
      if (time === 'Custom') {
        await page.locator('[class="body2-medium flex h-9 w-full items-center justify-between rounded-md border border-ui-200 bg-transparent px-2 py-2 text-ui-950 outline-none transition-colors duration-300 placeholder:text-ui-400 focus:border-ui-400 dark:text-white mobile:w-auto dark:border-ui-700 mobile:flex-1"]').click();
        await page.getByLabel('Choose Date and Time').getByRole('img').nth(1).click();
  
        const currentlyMonth = await page.locator('[class="date-picker_header_txt__CoUck __className_69542f"]').innerText();
        await page.locator('[class="react-datepicker__day react-datepicker__day--001"]').click();
        await page.waitForTimeout(1000);
  
        const calendarLocator = await page.locator('[class="body2-medium flex h-9 w-full items-center justify-between rounded-md border border-ui-200 bg-transparent px-2 py-2 text-ui-950 outline-none transition-colors duration-300 placeholder:text-ui-400 focus:border-ui-400 dark:text-white mobile:w-auto dark:border-ui-700 mobile:flex-1"]').innerText();
  
        // Create an object to correspond months to their numerical value
        const monthMapping: { [key: string]: string } = {
          "January": "01",
          "February": "02",
          "March": "03",
          "April": "04",
          "May": "05",
          "June": "06",
          "July": "07",
          "August": "08",
          "September": "09",
          "October": "10",
          "November": "11",
          "December": "12"
        };
  
        // Extract the month from `currentlyMonth`
        const monthInCurrently = currentlyMonth.split(',')[0].trim();
        const expectedMonth = monthMapping[monthInCurrently];
  
        // Extract the month from `calendarLocator`
        const monthInCalendar = calendarLocator.split('.')[0].trim();  
        expect(expectedMonth).toBe(monthInCalendar);
  
      } else {
        const calendarLocator = await page.locator('[class="body2-medium flex h-9 w-full items-center justify-between rounded-md border border-ui-200 bg-transparent px-2 py-2 text-ui-950 outline-none transition-colors duration-300 placeholder:text-ui-400 focus:border-ui-400 dark:text-white mobile:w-auto dark:border-ui-700 mobile:flex-1"]').innerText();
  
        const expectedDate = new Date();
  
        switch (time) {
          case '1 month':
            expectedDate.setMonth(expectedDate.getMonth() + 1);
            break;
          case '7 days':
            expectedDate.setDate(expectedDate.getDate() + 7);
            break;
          case '3 days':
            expectedDate.setDate(expectedDate.getDate() + 3);
            break;
          case '1 day':
            expectedDate.setDate(expectedDate.getDate() + 1);
            break;
          case '12 hours':
            expectedDate.setHours(expectedDate.getHours() + 12);
            break;
        }
  
        const expectedDay = String(expectedDate.getDate()).padStart(2, '0');
        const expectedMonth = String(expectedDate.getMonth() + 1).padStart(2, '0');
        const expectedYear = expectedDate.getFullYear();
        const expectedHours = String(expectedDate.getHours()).padStart(2, '0');
        const expectedMinutes = String(expectedDate.getMinutes()).padStart(2, '0');
  
        const expectedDateString = `${expectedMonth}.${expectedDay}.${expectedYear} ${expectedHours}:${expectedMinutes}`;
  
        expect(calendarLocator).toBe(expectedDateString);
      }
    }
  });

  test('make offer with invalid time - smaller than 10m', async()=>{
    await page.getByRole('button', { name: 'Make offer' }).click();
    await page.locator('[class="react-datepicker__input-container"]').click();
    await page.locator('[class="group date-picker_dropdown_group__fU1lW"]').click();
    await page.locator('[class="flex w-[264px] items-center justify-between px-3.5 py-2 hover:text-ui-900 dark:text-ui-100 text-ui-700 false date-picker_dropdown_option__jukwN"]').first().click();
    await page.getByRole('button', { name: 'Make offer' }).click();
    await page.waitForTimeout(1000);
    expect(page.getByText('Expiration time must be at least 10 minutes past listing time.')).toBeVisible();
  });

  test('сheck work cross on pop-up', async()=>{
    await page.getByRole('button', { name: 'Make offer' }).click();
    await page.locator('[class="absolute right-5 cursor-pointer fill-ui-950 dark:fill-ui-400 top-6"]').click();
    expect(page.getByText('Make an offer for the item at')).not.toBeVisible();
  });

  test('сheck data on offer page after made offer', async()=>{
    const nftName= await page.locator('[class="max-w-[50%] truncate"]').nth(0).innerText();
    const nftAddsress= await page.locator('[class="max-w-[50%] truncate"]').nth(1).innerText();
    const fullName = `${nftName} ${nftAddsress}`;

    await page.getByRole('button', { name: 'Make offer' }).click();
    await page.locator('[class="react-datepicker__input-container"]').click();
    await page.getByLabel('Choose Date and Time').getByRole('img').nth(1).click();
    await page.locator('[class="react-datepicker__day react-datepicker__day--001"]').click();
    await page.getByRole('button', { name: 'Make offer' }).click();

    await acceptSign(page, context);

    await page.waitForTimeout(3000);
    expect(page.getByText('Order was successffully')).toBeVisible();

    await page.goto(BASE_URL_DEV+URL_OFFERS_PAGE);
    const nftNameOnOffersPage = await page.locator('[class="body1-medium leading-[24px] text-ui-950 dark:text-white"]').last().innerText();
    expect(nftNameOnOffersPage).toBe(fullName);
  });

test('check correct display counter on offers made', async () => {
  await page.goto(BASE_URL_DEV + URL_OFFERS_PAGE);

  await page.waitForTimeout(3000);
  
  // Attempt to find the element with the specified selector
  const elementsExist = await page.locator('[class="body1-medium leading-[24px] text-ui-950 dark:text-white"]').count();

  let numberOfElements = 0;

  if (elementsExist > 0) {
    // If elements are found, count their number
    numberOfElements = await page.$$eval('[class="body1-medium leading-[24px] text-ui-950 dark:text-white"]', elements => elements.length);
  }

  // Convert the number of elements to a string
  const numberOfElementsString = numberOfElements.toString();

  // Get the number of offers displayed on the web page
  const numberOfOffersOnWeb = await page.locator('[class="body2-regular pb-[1.5px] mobile:caption2-regular dark:text-brand-600 text-brand-200"]').innerText();

  // Compare the values
  expect(numberOfElementsString).toBe(numberOfOffersOnWeb);
});

test('check correct display counter on offers received', async () => {
  await page.goto(BASE_URL_DEV + URL_OFFERS_PAGE);
  await page.getByRole('tab', { name: 'Offers Received' }).click();
  await page.waitForTimeout(3000);

  // Attempt to find the element with the specified selector
  const elementsExist = await page.locator('[class="body1-medium leading-[24px] text-ui-950 dark:text-white"]').count();

  let numberOfElements = 0;

  if (elementsExist > 0) {
    // If elements are found, count their number
    numberOfElements = await page.$$eval('[class="body1-medium leading-[24px] text-ui-950 dark:text-white"]', elements => elements.length);
  }

  // Convert the number of elements to a string
  const numberOfElementsString = numberOfElements.toString();

  // Get the number of offers displayed on the web page
  const numberOfOffersOnWeb = await page.locator('[class="body2-regular pb-[1.5px] mobile:caption2-regular dark:text-brand-600 text-brand-200"]').innerText();

  // Compare the values
  expect(numberOfElementsString).toBe(numberOfOffersOnWeb);
});

test('сheck sorting by Price on offers made', async () => {
  await page.goto(BASE_URL_DEV + URL_OFFERS_PAGE);
  await page.waitForSelector('[class="body1-medium leading-[24px] text-ui-950 dark:text-white"]');

  // Function to sort and validate prices
  async function sortAndValidatePrices(descending = true) {
    // Click the sort button
    await page.locator('.body2-medium > svg').first().click();

    // Get the first and second prices
    const firstPriceString = await page.locator('[class="body2-medium text-lightBlack dark:text-ui-100 leading-6 !body1-medium truncate"]').nth(0).getAttribute('title');
    const secondPriceString = await page.locator('[class="body2-medium text-lightBlack dark:text-ui-100 leading-6 !body1-medium truncate"]').nth(1).getAttribute('title');

    if (firstPriceString !== null && secondPriceString !== null) {
      const firstPrice = parseFloat(firstPriceString);
      const secondPrice = parseFloat(secondPriceString);

      // Validate the sorting order
      if (descending) {
        expect(firstPrice).toBeGreaterThanOrEqual(secondPrice);
      } else {
        expect(firstPrice).toBeLessThanOrEqual(secondPrice);
      }
    }
  }

  // Check if there are elements to sort
  const elementsExist = await page.locator('[class="body1-medium leading-[24px] text-ui-950 dark:text-white"]').count();
  let numberOfElements = 0;

  if (elementsExist > 0) {
    numberOfElements = await page.$$eval('[class="body1-medium leading-[24px] text-ui-950 dark:text-white"]', elements => elements.length);
  }

  if (numberOfElements >= 2) {
    // Sort and validate prices (largest to smallest)
    await sortAndValidatePrices(true);

    // Sort and validate prices (smallest to largest)
    await sortAndValidatePrices(false);
  } else {
      // Add offers if not enough elements are present
    await makeOffer(NFT_PAGE, '0.004');
    await makeOffer(NFT_PAGE_CAR, '0.005');
  
    // Sort and validate prices (largest to smallest)
    await sortAndValidatePrices(true);

    // Sort and validate prices (smallest to largest)
    await sortAndValidatePrices(false);
  }
});

test('check sorting by Marketplace on offers made', async () => {
  // Function to retrieve names and perform sorting verification
  const sortAndVerifyMarketplace = async () => {
    // Retrieve all element names with the class body2-medium
    await page.waitForSelector('[class="body2-medium"]');
    const names = await page.locator('[class="body2-medium"]').allInnerTexts();

    // Click on the Marketplace element (sort A-Z)
    await page.locator('div').filter({ hasText: /^Marketplace$/ }).getByRole('img').click();

    // Retrieve new names after the first click
    await page.waitForSelector('[class="body2-medium"]');
    const newNames = await page.locator('[class="body2-medium"]').allInnerTexts();

    // If sorting is expected in alphabetical order after the first click
    const sortedNames = [...names].sort();
    expect(newNames).toEqual(sortedNames);

    // Click on the Marketplace element (sort Z-A)
    await page.locator('div').filter({ hasText: /^Marketplace$/ }).getByRole('img').click();

    // Retrieve names after the second click
    await page.waitForSelector('[class="body2-medium"]');
    const finalNames = await page.locator('[class="body2-medium"]').allInnerTexts();

    // Sort the original array of names in reverse order
    const reversedNames = [...names].reverse();

    // Verify that after the second click, the order of elements matches the reversed order
    expect(finalNames).toEqual(reversedNames);
  };

  await page.goto(BASE_URL_DEV + URL_OFFERS_PAGE);
  await page.waitForSelector('[class="body1-medium leading-[24px] text-ui-950 dark:text-white"]');

  // Check if there are elements to sort
  const elementsExist = await page.locator('[class="body1-medium leading-[24px] text-ui-950 dark:text-white"]').count();
  let numberOfElements = 0;

  if (elementsExist > 0) {
    numberOfElements = await page.$$eval('[class="body1-medium leading-[24px] text-ui-950 dark:text-white"]', elements => elements.length);
  }

  // If there are at least 2 elements, perform sorting tests
  if (numberOfElements >= 2) {
    // Call the sort and verify function
    await sortAndVerifyMarketplace();
  } else {
    // If no elements or less than 2, make offers
    await makeOffer(NFT_PAGE, '0.004');
    await makeOffer(NFT_PAGE_CAR, '0.005');

    // Call the sort and verify function after making offers
    await sortAndVerifyMarketplace();
  }
});

test('check sorting by time on offers made', async () => {
  // Function to perform sorting by time and verify the data
  const sortAndVerifyByTime = async () => {
    const timeOptions = ['Last hour', 'Last 6 hours', 'Last 24 hours', 'Last 7 days', 'Last 30 days'];

    for (const timeOption of timeOptions) {
      // Open the dropdown menu
      const dropDownMenu = page.locator('button[aria-haspopup="listbox"]');
      await dropDownMenu.click();

      // Click on the corresponding option
      await page.getByRole('option', { name: timeOption }).locator('div').first().click();

      // Wait for the data to refresh
      await page.waitForSelector('[class="flex items-center gap-[4px] text-ui-950 dark:text-ui-100 flex-[1_1_12%] mobile:flex-[1_1_12%]"]');

      // Retrieve the updated data
      const duration = await page.locator('[class="flex items-center gap-[4px] text-ui-950 dark:text-ui-100 flex-[1_1_12%] mobile:flex-[1_1_12%]"]').allInnerTexts();

      // Check the data according to the selected option
      for (const time of duration) {
        if (timeOption === 'Last hour') {
          // Check for "Last hour" (only minutes or seconds)
          expect(time).toMatch(/minute|second/);
          // Additional check: Should not contain "hour", "day", or "month"
          expect(time).not.toMatch(/hour|day|month/);
        } else if (timeOption === 'Last 6 hours') {
          // Check for "Last 6 hours" (minutes, seconds, or hours ≤ 6)
          expect(time).toMatch(/minute|second|hour/);
          if (time.includes('hour')) {
            const hourValue = parseInt(time.split(' ')[1]);
            expect(hourValue).toBeLessThanOrEqual(6);
          }
          // Additional check: Should not contain "day" or "month"
          expect(time).not.toMatch(/day|month/);
        } else if (timeOption === 'Last 24 hours') {
          // Check for "Last 24 hours" (minutes, seconds, or hours ≤ 24)
          expect(time).toMatch(/minute|second|hour/);
          if (time.includes('hour')) {
            const hourValue = parseInt(time.split(' ')[1]);
            expect(hourValue).toBeLessThanOrEqual(24);
          }
          // Additional check: Should not contain "day" or "month"
          expect(time).not.toMatch(/day|month/);
        } else if (timeOption === 'Last 7 days') {
          // Check for "Last 7 days" (minutes, seconds, hours, or days ≤ 7)
          expect(time).toMatch(/minute|second|hour|day/);
          if (time.includes('day')) {
            const dayValue = parseInt(time.split(' ')[1]);
            expect(dayValue).toBeLessThanOrEqual(7);
          }
          // Additional check: Should not contain "month"
          expect(time).not.toMatch(/month/);
        } else if (timeOption === 'Last 30 days') {
          // Check for "Last 30 days" (minutes, seconds, hours, or days ≤ 30)
          expect(time).toMatch(/minute|second|hour|day/);
          if (time.includes('day')) {
            const dayValue = parseInt(time.split(' ')[1]);
            expect(dayValue).toBeLessThanOrEqual(30);
          }
          // Additional check: Should not contain "month"
          expect(time).not.toMatch(/month/);
        }
      }
    }
  };

  await page.goto(BASE_URL_DEV + URL_OFFERS_PAGE);
  await page.waitForSelector('[class="body1-medium leading-[24px] text-ui-950 dark:text-white"]');

  const elementsExist = await page.locator('[class="body1-medium leading-[24px] text-ui-950 dark:text-white"]').count();
  let numberOfElements = 0;

  if (elementsExist > 0) {
    numberOfElements = await page.$$eval('[class="body1-medium leading-[24px] text-ui-950 dark:text-white"]', elements => elements.length);
  }

  // there are offers on page
  if (numberOfElements >= 1) {
    // Call the sort and verify function
    await sortAndVerifyByTime();
  } else {
    // make offer if don't have offers
    await makeOffer();

    // Call the sort and verify function after making the offer
    await sortAndVerifyByTime();
  }
});

test('check searching on offers made', async () => {
  // Function for searching and verifying elements
  const searchAndVerifyNFTNames = async () => {
    // Retrieve all NFT names
    await page.waitForSelector('[class="body1-medium leading-[24px] text-ui-950 dark:text-white"]');
    const nftNames = await page.locator('[class="body1-medium leading-[24px] text-ui-950 dark:text-white"]').allInnerTexts();

    // Loop through each name in the nftNames list
    for (const nftName of nftNames) {
      const searchInput = page.getByPlaceholder('Search Item...');
      await searchInput.fill(nftName);  // Enter the current value from nftNames

      // Wait 1 second for the search result to display
      await page.waitForTimeout(1000);

      // Retrieve all filtered elements
      const filteredNames = await page.locator('[class="body1-medium leading-[24px] text-ui-950 dark:text-white"]').allInnerTexts();
      
      // Verify that the filtered elements contain the expected name, otherwise the test will fail
      expect(filteredNames.length).toBeGreaterThan(0);  // Check that elements were found
      filteredNames.forEach(filteredName => {
        expect(filteredName).toContain(nftName);
      });
    }
  };

  await page.goto(BASE_URL_DEV + URL_OFFERS_PAGE);
  await page.waitForSelector('[class="body1-medium leading-[24px] text-ui-950 dark:text-white"]');

  // Check if there are elements to sort
  const elementsExist = await page.locator('[class="body1-medium leading-[24px] text-ui-950 dark:text-white"]').count();
  let numberOfElements = 0;

  if (elementsExist > 0) {
    numberOfElements = await page.$$eval('[class="body1-medium leading-[24px] text-ui-950 dark:text-white"]', elements => elements.length);
  }

  // If there are more than 2 elements, perform the search test
  if (numberOfElements >= 2) {
    // Call the search and verification function
    await searchAndVerifyNFTNames();
  } else {
    // If there are no elements or fewer than 2, make offers
    await makeOffer(NFT_PAGE, '0.004');
    await makeOffer(NFT_PAGE_CAR, '0.005');

    // After calling makeOffer, repeat the search and verification
    await searchAndVerifyNFTNames();
  }
});

test('check searching with invalid data on offers made', async () => {
  // Function for searching and verifying elements
  const searchAndVerify = async () => {
    await page.waitForSelector('[class="body1-medium leading-[24px] text-ui-950 dark:text-white"]');
    const searchInput = page.getByPlaceholder('Search Item...');
    await searchInput.fill('Something wrong'); 
    // Wait 1 second for the search result to display
    await page.waitForTimeout(1000);
    expect(page.getByText('Nothing here yet')).toBeVisible();
  };

  await page.goto(BASE_URL_DEV + URL_OFFERS_PAGE);
  await page.waitForSelector('[class="body1-medium leading-[24px] text-ui-950 dark:text-white"]');

  // Check if there are elements to sort
  const elementsExist = await page.locator('[class="body1-medium leading-[24px] text-ui-950 dark:text-white"]').count();
  let numberOfElements = 0;

  if (elementsExist > 0) {
    numberOfElements = await page.$$eval('[class="body1-medium leading-[24px] text-ui-950 dark:text-white"]', elements => elements.length);
  }

  // If there are more than 1 element, perform the search test
  if (numberOfElements >= 1) {
    // Call the search and verification function
    await searchAndVerify();
  } else {
    // If there are no elements or fewer than 1, make offers
    await makeOffer();

    // After calling makeOffer, repeat the search and verification
    await searchAndVerify();
  }
});

test('edit data on offers made', async () => {
  await makeOffer(NFT_PAGE_CAR, '0.003');
  await page.waitForSelector('[class="max-w-[50%] truncate"]');
  const nftName= await page.locator('[class="max-w-[50%] truncate"]').innerText();

  await page.goto(BASE_URL_DEV + URL_OFFERS_PAGE);
  await page.getByPlaceholder('Search Item...').fill(nftName);
  await page.waitForTimeout(1000);

  await page.getByRole('button', { name: 'Edit offer' }).first().click();
  await page.locator('[class="body2-medium flex h-9 w-full items-center justify-between rounded-md border border-ui-200 bg-transparent px-2 py-2 text-ui-950 outline-none transition-colors duration-300 placeholder:text-ui-400 focus:border-ui-400 dark:text-white mobile:w-auto dark:border-ui-700 mobile:flex-1"]').click();
  await page.getByLabel('Choose Date and Time').getByRole('img').nth(1).click();
  await page.locator('[class="react-datepicker__day react-datepicker__day--001"]').click();

  const newPrice = '0.004'
  await page.getByPlaceholder('Enter price').fill(newPrice);
  await page.getByRole('button', { name: 'Save changes' }).click();

  await acceptActionsOnOffersPage(page, context);
  await acceptSign(page, context);

  await page.waitForSelector('text=Order was successfully edited.');
  expect(page.getByText('Order was successfully edited.')).toBeVisible();

  await page.getByPlaceholder('Search Item...').fill(nftName);
  const priceAfterEdit = await page.locator('[class="body2-medium text-lightBlack dark:text-ui-100 leading-6 !body1-medium truncate"]').first().getAttribute('title');
  expect(priceAfterEdit).toBe(newPrice);
});

test('delete data on offers made', async () => {
  await makeOffer(NFT_NEW_WEE, '0.003');
  await page.waitForSelector('[class="max-w-[50%] truncate"]');
  const nftName= await page.locator('[class="max-w-[50%] truncate"]').innerText();

  await page.goto(BASE_URL_DEV + URL_OFFERS_PAGE);
  await page.getByPlaceholder('Search Item...').fill(nftName);
  await page.waitForTimeout(1000);
  
  await page.getByRole('button', { name: 'Delete' }).first().click();
  await acceptActionsOnOffersPage(page, context);

  await page.waitForSelector('text=The offer has been declined, the deal cancelled.');
  expect(page.getByText('The offer has been declined, the deal cancelled.')).toBeVisible();

  await page.getByPlaceholder('Search Item...').fill(nftName);
  await page.waitForTimeout(1000);
  expect(page.getByText('Nothing here yet')).toBeVisible();
});
