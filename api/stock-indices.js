const client = require('./pasardanaClient');

module.exports = async (req, res) => {
  try {
    const response = await client.get('/Stock/GetIndexFilters');

    const data = response.data.map((i, idx) => ({
      id: i.Id,
      name: i.Name,
      stocks_url: `https://indonesia-market.vercel.app/api/stocks?index_id=${i.Id}`,
    }));

    return res.json({ data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};