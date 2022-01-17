import axios from 'axios';
// axios.defaults.baseURL = 'https://hooks.zapier.com';
axios.defaults.headers.post['Content-Type'] = 'application/json';

export default axios;