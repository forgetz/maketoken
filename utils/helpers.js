
import axios from '../axios.config';

export async function makeContract() {
   const res = await axios.get('/api/solc');
   return res;
}