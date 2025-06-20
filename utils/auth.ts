import dotenv from 'dotenv';
import { promises as fs } from 'fs';

let ethers = require('../node_modules/ethers')
const { request, chromium } = require('playwright');

dotenv.config();

const nonceUrl = 'https://site-dev/metamask/nonce';
const walletAddress = '0xbCdbB000D000B000eb00aBa0B00000eb000BBf00';
const privateCode = 'bebbc000a00000a0fcfc000b000f0bfcf000fbaebecfcaab';
const tokenUrl = 'https://site-dev/security/token'
const utils = ethers.utils;


async function getNonce(address?: string): Promise<string>{
  address = address ?? walletAddress;

  const requestContext = await request.newContext();
  const response = await requestContext.post(nonceUrl, {
    data: { "address": address, 
      "blockchain": "ethereum"
     },
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


async function getAccessToken(address?: string): Promise<string> {
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