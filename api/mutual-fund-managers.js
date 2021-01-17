const client = require('./pasardanaClient');

module.exports = async (req, res) => {
  try {
    const response = await client.get('/FundInvestmentManager/GetAll', {
      params: {
        Active: 'YES',
        username: 'anonymous',
      },
      headers: {
        Referer: 'https://pasardana.id/fund/search',
      },
    });

    const data = response.data.map(item => ({
      ...item,
      stocks_url: `https://indonesia-market.vercel.app/api/mututal-funds?fund_manager_id=${item.Id}`,
    }));

    return res.json({ data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};