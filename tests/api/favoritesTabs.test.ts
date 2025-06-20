import { test, expect, request } from '@playwright/test';
import { APIRequestContext } from '@playwright/test';
import { getAccessToken } from '../../utils/auth';


let accessToken: string;


test('myWatchlistCollection', async () => {
  if (!accessToken) {
    accessToken = await getAccessToken();
  }
  const query = `query MyWatchList($filter: CollectionTokenFullDtoFilter!, $paging: CursorPaging!, $sorting: [CollectionTokenFullDtoSort!]!) {
    myWatchList(filter: $filter, paging: $paging, sorting: $sorting) {
      edges {
        node {
          id
          name
        }
      }}}`

  const variables = {
    "filter": {},
    "paging": {
      "first": 15
    },
    "sorting": [
      {
        "direction": "DESC",
        "field": "statisticItems"
      }
    ]
  }
  const apiContext = await request.newContext({
    //baseURL: 'https://site/graphql',
    extraHTTPHeaders: {
    //   'Content-Type': 'application/json',
       'Authorization': `Bearer ${accessToken}`
    },
  });
  const response = await apiContext.post('https://site/graphql', {
    data: {
      query,
      variables
    },
  });

  
  const responseBody = await response.json();
  console.log(responseBody)


  expect(response.ok()).toBeTruthy();
  expect(responseBody.data).toBeDefined();   
})
  


test('createOneWatchlistItem', async () => { 
    if (!accessToken) {
      accessToken = await getAccessToken();
    }
  
     
  
    const query = `mutation CreateOneWatchlistItemDto($input: WatchlistItemInputDto!) {
                    createOneWatchlistItemDto(input: $input) {
                            id
                    }
                }`;
  
    const variables = {
        "input": {
          "collection":  "ETHEREUM-SEPOLIA.0x71216fca79d53f4503bdf3ec8d883b2f955ad428"
        }
      }
    
    const apiContext = await request.newContext({
      extraHTTPHeaders: {
         'Authorization': `Bearer ${accessToken}`
      },
    });
  
    
    const response = await apiContext.post('https://site/graphql', {
      data: {
        query,
        variables
      },
    });
  
    
    const responseBody = await response.json();
    console.log(responseBody)
  
  
    expect(response.ok()).toBeTruthy();
    expect(responseBody.data).toBeDefined();
   });

   
   test.skip('deleteOneWatchlistItem', async () => { 
    if (!accessToken) {
      accessToken = await getAccessToken();
    }
  
     
  
    const query = `mutation DeleteOneWatchlistItemDto($input: WatchlistItemInputDto!) {
                    deleteOneWatchlistItemDto(input: $input) {
                      id
                    }
    }`;
  
    const variables = {
        "input": {
          "collection":  ""  //there should be an id here, which can be taken from the last test(from this way "responseBody.data.createOneWatchlistItemDto.id"), until you figure out how to do it
        }
      }
    
    const apiContext = await request.newContext({
      extraHTTPHeaders: {
         'Authorization': `Bearer ${accessToken}`
      },
    });
  
    
    const response = await apiContext.post('https://site/graphql', {
      data: {
        query,
        variables
      },
    });
  
    
    const responseBody = await response.json();
    console.log(responseBody)
  
  
    expect(response.ok()).toBeTruthy();
    expect(responseBody.data).toBeDefined();
   });

//need creae with ChainID
   test.skip('addFavoriteTokens"', async () => {
    if (!accessToken) {
      accessToken = await getAccessToken();
    }
  
     
  
    const query = `mutation AddFavoriteTokens($tokens: [C_InputToken!]!) {
                  addFavoriteTokens(tokens: $tokens)
                  }`;
  
    const variables = {
        "tokens": [
          {
            "chainId": null,
            "tokenAddress": null
          }
        ]
    }
    
    const apiContext = await request.newContext({
      extraHTTPHeaders: {
         'Authorization': `Bearer ${accessToken}`
      },
    });
  
    
    const response = await apiContext.post('https://site/graphql', {
      data: {
        query,
        variables
      },
    });
  
    
    const responseBody = await response.json();
    console.log(responseBody)
  
  
    expect(response.ok()).toBeTruthy();
    expect(responseBody.data).toBeDefined();
   });

  //need creae with ChainID 
   test.skip('RemoveFavoriteTokens', async () => {
    if (!accessToken) {
      accessToken = await getAccessToken();
    }
  
     
  
    const query = `mutation RemoveFavoriteTokens($tokens: [C_InputToken!]!) {
                    removeFavoriteTokens(tokens: $tokens)
                  }`;     
  
    const variables = {
        "tokens": [
          {
            "chainId": null,
            "tokenAddress": null
          }
        ]
    }
    
    const apiContext = await request.newContext({
      extraHTTPHeaders: {
         'Authorization': `Bearer ${accessToken}`
      },
    });
  
    
    const response = await apiContext.post('https://site/graphql', {
      data: {
        query,
        variables
      },
    });
  
    
    const responseBody = await response.json();
    console.log(responseBody)
  
  
    expect(response.ok()).toBeTruthy();
    expect(responseBody.data).toBeDefined();
   });