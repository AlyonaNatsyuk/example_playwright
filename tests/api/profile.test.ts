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


test('GetUserDetailsValidId', async () => {  
  const query = `query Query($userDtoId: ID!) {
      userDto(id: $userDtoId) {
        id
      email
      firstName
      username
      avatar {
        context
        createdAt
        id
        mimetype
        name
        originalName
        size
        updatedAt
        uri
      }
      bio
      lastName
      wallet {
        id
      }
      }
    }`;

  const variables = {
    userDtoId: 'test1111111111'
  };
  const apiContext = await request.newContext({
    baseURL: 'https://site/graphql',
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer YOUR_ACCESS_TOKEN`,
    },
  });

  
  const response = await apiContext.post('https://site/graphql', {
    data: {
      query,
      variables,
    },
  });

  
  const responseBody = await response.json();

  


   expect(response.ok()).toBeTruthy();
   expect(responseBody.data).toBeDefined();
 });


test('GetUserDetailsInvalidId', async () => {  
  const query = `query Query($userDtoId: ID!) {
      userDto(id: $userDtoId) {
        id
      email
      firstName
      username
      avatar {
        context
        createdAt
        id
        mimetype
        name
        originalName
        size
        updatedAt
        uri
      }
      bio
      lastName
      wallet {
        id
      }
      }
    }`;

  const variables = {
    userDtoId: 'testesttest'
  };
  const apiContext = await request.newContext({
    baseURL: 'https://site/graphql',
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer YOUR_ACCESS_TOKEN`,
    },
  });

  
  const response = await apiContext.post('https:/site/graphql', {
    data: {
      query,
      variables,
    },
  });

  
  const responseBody = await response.json();

  
  console.log(responseBody.errors[0].message);
  console.log(response)


   expect(response.ok()).toBeTruthy();
   expect(responseBody.data).toBeDefined();
   expect(responseBody.errors[0].message).toEqual('invalid input syntax for type uuid: "testesttest"')
 });


 test('UpdateUserDetails', async () => { 
  if (!accessToken) {
    accessToken = await getAccessToken();
  }
  const UserID = await GetUserID();

  console.log(accessToken)
  console.log(UserID)

  const modifiedUserName = "testusername4"
  const modifiedFirstName = "testfirstname"
  const modifiedLastName = "testLastname"
  const modifiedBio = "TestBiowithsometext"
  const modifiedEmail = "testusername4@mail.com"
   

  const query = `mutation UpdateOneUserDto($input: UpdateOneUserDtoInput!) {
    updateOneUserDto(input: $input) {
      username,
      bio,
      firstName,
      lastName,
      email
  }
}`;

  const variables = {  
    "input": {
      "id": UserID,
      "update": {
        "username": modifiedUserName,
        "bio": modifiedBio,
        "email": modifiedEmail, 
        "firstName": modifiedFirstName,
        "lastName": modifiedLastName
      }
    }
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
  expect(responseBody.data.updateOneUserDto.username).toEqual(modifiedUserName)
  expect(responseBody.data.updateOneUserDto.firstName).toEqual(modifiedFirstName)
  expect(responseBody.data.updateOneUserDto.lastName).toEqual(modifiedLastName)
  expect(responseBody.data.updateOneUserDto.bio).toEqual(modifiedBio)
  expect(responseBody.data.updateOneUserDto.email).toEqual(modifiedEmail)
 });
