import { promises as fs } from 'fs';

export async function getVercelJwt() {
    const filePath = './.auth/vercel_jwt.json'; 

    const data = await fs.readFile(filePath, 'utf-8');

    // Parse the JSON and get the vercelJwt value
    const jsonData = JSON.parse(data);
    const vercelJwt = jsonData.vercelJwt;

    return vercelJwt;
}
