import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

const options: AxiosRequestConfig = {
  method: 'GET',
  url: 'https://instagram-scraper-20231.p.rapidapi.com/postcomments/CnpPou9hWqq/%7Bend_cursor%7D/%7Bscraperid%7D',
  headers: {
    'X-RapidAPI-Key': 'c9cf11c221msh7ba92db113f7b27p125495jsnd35a5d990324',
    'X-RapidAPI-Host': 'instagram-scraper-20231.p.rapidapi.com'
  }
};

export async function fetchData(){
  try {
    const response: AxiosResponse<any> = await axios.request(options);
    console.log(response.data);
    
    return response.data; // SReturn only the data part of the response
  } catch (error) {
    console.error('Error fetching data:', error); // Log the error response data if available
    throw error; // Re-throw the error to be handled by the caller
  }
}
