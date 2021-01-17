const yup = require('yup');
const client = require('./pasardanaClient');

const SORTABLE_FIELDS = [
  'Name',
  'InvestmentManagerName',
  'CustodianBankName',
  'Type',
  'Currency',
  'Dividend',
  'NetAssetValue',
  'DailyReturn',
  'WeeklyReturn',
  'MonthlyReturn',
  'QuarterlyReturn',
  'SemiAnnualReturn',
  'YearlyReturn',
  'MtdReturn',
  'YtdReturn',
  'YearlyRating',
  'OneYearRating',
  'AssetUnderManagement',
  'TotalUnit',
  'AumLastUpdate',
  'LastFundFactSheet',
  'LastUpdatedPortfolio',
  'LastUpdate',
];

const TYPES = {
  balanced: 0,
  equity: 1,
  fixed_income: 2,
  money_market: 3,
  protected: 4,
  limited_participation: 5,
  reits: 6,
  global: 7,
};

const CATEGORIES = {
  sharia: 'catS',
  etf: 'catE',
  index: 'catI',
  conventional: 'catC',
};

const CURRENCIES = {
  idr: 0,
  usd: 1,
};

const validate = async (params) => {
  const schema = yup.object().shape({
    search: yup.string().trim(),
    page: yup.number().positive().integer().default(1),
    per_page: yup.number().positive().integer().default(25),
    sort_by: yup.string().trim().oneOf(SORTABLE_FIELDS).default('Name'),
    sort_direction: yup.string().trim().lowercase().oneOf(['asc', 'desc']).default('asc'),
    type: yup.string().trim().lowercase().oneOf(Object.keys(TYPES)),
    currency: yup.string().trim().lowercase().oneOf(Object.keys(CURRENCIES)),
    categories: yup.array(
      yup.string().trim().lowercase().oneOf(Object.keys(CATEGORIES))
    ).default([]),
  });

  if (typeof params.categories === 'string') {
    params.categories = params.categories.split(',');
  }

  await schema.validate(params);

  const data = schema.cast(params);

  const parsedParams = {
    Keywords: data.search,
    pageBegin: data.page,
    pageLength: data.per_page,
    sortField: data.sort_by,
    sortOrder: data.sort_direction.toUpperCase(),
  };

  if (data.type) {
    parsedParams.type = TYPES[data.type];
  }

  if (data.currency) {
    parsedParams.cur = CURRENCIES[data.currency];
  }

  data.categories.forEach(category => {
    parsedParams[CATEGORIES[category]] = 'Y';
  });

  return parsedParams;
};

const getData = async (params = {}) => {
  const parsedParams = await validate(params);

  try {
    const response = await client.get('/FundSearchResult/GetAll', {
      params: parsedParams,
      headers: {
        Referer: 'https://pasardana.id/fund/search',
      },
    });

    return response.data;
  } catch (error) {
    const message = error.response ? error.response.data.message : error.message;

    throw new Error(message);
  }
};

module.exports = async (req, res) => {
  try {
    const data = await getData(req.query);

    return res.json({ data });
  } catch (error) {
    const status = error.name === 'ValidationError' ? 422 : 500;

    return res.status(status).json({ error: error.message });
  }
};