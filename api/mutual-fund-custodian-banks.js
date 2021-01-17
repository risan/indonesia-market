const client = require('./pasardanaClient');

module.exports = async (req, res) => {
  try {
    const response = await client.get('/FundCustodianBank/GetAll', {
      headers: {
        Referer: 'https://pasardana.id/fund/search',
      },
    });

    const data = response.data.map(item => ({
      ...item,
      stocks_url: `https://indonesia-market.vercel.app/api/mutual-funds?custodian_bank_id=${item.Id}`,
    }));

    return res.json({ data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};