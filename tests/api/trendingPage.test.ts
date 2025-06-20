import { test, expect, request } from '@playwright/test';
import { APIRequestContext } from '@playwright/test';
import { getAccessToken } from '../../utils/auth';

let accessToken: string;

async function GetUserID(): Promise<string> {
  if (!accessToken) {
    accessToken = await getAccessToken();
  }

  const query = `query MeDto {
    meDto {
      id
    }
  }`;

  const apiContext = await request.newContext({
    extraHTTPHeaders: {
      'Authorization': `Bearer ${accessToken}`,  
    },
  });

  const response = await apiContext.post('https://site/graphql', {
    data: {
      query
    },
  });

  const responseBody = await response.json();
  const userID = responseBody.data.meDto.id;
  return userID;
}


test('getCollection', async()=>{
    if (!accessToken) {
        accessToken = await getAccessToken();
      }
      const query = `query CollectionTokenFullDtos($filter: CollectionTokenFullDtoFilter!, $paging: CursorPaging!, $sorting: [CollectionTokenFullDtoSort!]!, $period: String) {
        collectionTokenFullDtos(filter: $filter, paging: $paging, sorting: $sorting, period: $period) {
            edges {
            node {
                id
                name  
            }
            }
        }
        }`
    
      const variables = {
        "filter": {},
        "paging": {"first": 15},
        "sorting": {"direction": "DESC",
            "field": "statisticVolume30Days"},
        "period": "30D"
      
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
      
    
      expect(response.ok()).toBeTruthy();
      expect(responseBody.data.collectionTokenFullDtos.edges).toBeDefined();
})