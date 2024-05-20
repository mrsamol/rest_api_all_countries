const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const port = 3000; // Changed port to a safe one

const url = 'https://www.worldometers.info/geography/how-many-countries-are-there-in-the-world/';

const getCountries = async (req, res) => {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const table = $('#example2');
    const headers = [];
    const rows = [];

    if (table.length === 0) {
      throw new Error('Table with ID #example2 not found');
    }

    // Define header mappings
    const headerMappings = {
      '#': 'id',
      'Country': 'country_name',
    };

    // Extract table headers
    table.find('thead tr th').each((index, element) => {
      const header = $(element).text().trim();
      headers.push(headerMappings[header] || header); // Use mapped name or original header if no mapping exists
    });

    // Extract table rows
    table.find('tbody tr').each((index, element) => {
      const row = {};
      $(element).find('td').each((i, el) => {
        row[headers[i]] = $(el).text().trim();
      });

      // Filter out only the 'id' and 'country_name' fields
      const filteredRow = {
        id: row['id'],
        country_name: row['country_name']
      };

      rows.push(filteredRow);
    });

    res.status(200).json({
      success: true,
      message: "ok",
      status_code: 200,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching the webpage:', error.message);
    res.status(500).json({ error: 'An error occurred while fetching the data' });
  }
};

app.get('/api/v1/countries', getCountries);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
