import dotenv from 'dotenv';
import { promises as fs } from 'fs';

let ethers = require('../node_modules/ethers')
const { request, chromium } = require('playwright');

dotenv.config();

const nonceUrl = 'https://site/metamask/nonce';
const walletAddress = '0x0b00000e0f003A00Bc000c0000e00Ecae000E0f0';
const privateCode = '00f00dfc00000000dab00f000000f00ecabefcfffcf00cfebebbba0b';
const tokenUrl = 'https://site/security/token'
const utils = ethers.utils;


async function getNonce(address?: string): Promise<string>{
  address = address ?? walletAddress;

  const requestContext = await request.newContext();
  const response = await requestContext.post(nonceUrl, {
    data: { "address": address, 
      "blockchain": "ethereum"
     }
  });

  const responseData = await response.json();
  await requestContext.dispose(); 
  return responseData.nonce;
}


async function getSign(): Promise<string> {
  const wallet = new ethers.Wallet(privateCode);
  const nonce = await getNonce();
  const flatSignature = await wallet.signMessage(nonce);

  return flatSignature;
}


export async function getAccessToken(address?: string): Promise<string> {
  address = address ?? walletAddress;

  const requestContext = await request.newContext();
  const response = await requestContext.post(tokenUrl, {
    data: { "address": address, "nonce": await getSign(), "blockchain": "ethereum"},
  });

  const data = await response.json();
  const accessToken = data.access_token;

  await fs.writeFile('../.auth/user.json', JSON.stringify(data, null, 2)); 
  
  return accessToken;
}

(async () => {
  try {
    const accessToken = await getAccessToken();
    console.log('Access Token:', accessToken);
  } catch (error) {
    console.error('Error getting access token:', error);
  }
})();