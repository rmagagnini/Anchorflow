import axios from 'axios';

async function main(): Promise<void> {
  try {
    const response = await axios.get('http://localhost:3001/api/data');
    console.log('Status:', response.status);
    console.log('Data:', response.data);
  } catch (err: any) {
    console.log('Status:', err.response?.status);
    console.log('Headers:', JSON.stringify(err.response?.headers, null, 2));
    console.log('Data:', JSON.stringify(err.response?.data, null, 2));
  }
}

main();