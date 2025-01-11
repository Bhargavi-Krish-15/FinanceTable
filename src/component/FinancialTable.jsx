import React, { useState, useEffect } from "react";

const FinancialTable = () => {
  const [data, setData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filteredData, setFilteredData] = useState([]);
  const [sortData, ssetSortData] = useState({
    key: "date",
    way_to_sort: "desc",
  });

  // For filtering the datas
  const [filters, setFilters] = useState({
    startYear: "",
    endYear: "",
    minRevenue: "",
    maxRevenue: "",
    minNetIncome: "",
    maxNetIncome: "",
  });

  // Format learge numbers to millions/billions
  const formatNumber = (num) => {
    if (num >= 1e9) {
      return `$${(num / 1e9).toFixed(2)}B`;
    }
    if (num >= 1e6) {
      return `$${(num / 1e6).toFixed(2)}M`;
    }
    return `$${num.toFixed(2)}`;
  };

  // inorder for user to enter large number of values, it can be given in B/M
  const parseFinanceInput = (value) => {
    if (!value) return "";
    // we remove the space and check for teh letters else if no letters found we are also assuminf for raw numebrs.
    value = value.toString().replace(/\s/g, "").toUpperCase();
    if (value.includes("B")) {
      const number = parseFloat(value.replace("B", ""));
      return number * 1e9;
    }
    if (value.includes("M")) {
      const number = parseFloat(value.replace("M", ""));
      return number * 1e6;
    }
    return parseFloat(value);
  };

  // here we handle the key and error handling
  // await can be used only when we have async concept
  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_KEY = import.meta.env.VITE_APP_API_KEY;
        // get the link response using the api key given as parameter
        const response = await fetch(
          `https://financialmodelingprep.com/api/v3/income-statement/AAPL?period=annual&apikey=${API_KEY}`
        );
        // if the response dont work throw error
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        // if the response works get the data and change the data's state
        const jsonData = await response.json();
        setData(jsonData);
        setFilteredData(jsonData);
        setLoading(false);
      } catch (err) {
        // catch teh error messages here
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // handling filter and sorting
  // array of dictionaries
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    // storing present value
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // handlind sort
  const handleSort = (key) => {
    let way_to_sort = "asc";
    if (sortData.key === key && sortData.way_to_sort === "asc") {
      way_to_sort = "desc";
    }
    ssetSortData({ key, way_to_sort });

    const sortedData = [...filteredData].sort((a, b) => {
      if (key === "date") {
        const dateA = new Date(a[key]);
        const dateB = new Date(b[key]);
        return way_to_sort === "asc" ? dateA - dateB : dateB - dateA;
      }
      return way_to_sort === "asc" ? a[key] - b[key] : b[key] - a[key];
    });

    setFilteredData(sortedData);
  };

  // apply the filtered inputs got
  const applyFilters = () => {
    let filtered = [...data];
    if (filters.startYear || filters.endYear) {
      filtered = filtered.filter((item) => {
        const year = new Date(item.date).getFullYear();
        return (
          (!filters.startYear || year >= parseInt(filters.startYear)) &&
          (!filters.endYear || year <= parseInt(filters.endYear))
        );
      });
    }

    // revenue , parsing before applying the filter condition
    if (filters.minRevenue || filters.maxRevenue) {
      filtered = filtered.filter((item) => {
        const minRevenue = parseFinanceInput(filters.minRevenue);
        const maxRevenue = parseFinanceInput(filters.maxRevenue);
        return (
          (!filters.minRevenue || item.revenue >= minRevenue) &&
          (!filters.maxRevenue || item.revenue <= maxRevenue)
        );
      });
    }

    // net income
    if (filters.minNetIncome || filters.maxNetIncome) {
      filtered = filtered.filter((item) => {
        const minNetIncome = parseFinanceInput(filters.minNetIncome);
        const maxNetIncome = parseFinanceInput(filters.maxNetIncome);
        return (
          (!filters.minNetIncome || item.netIncome >= minNetIncome) &&
          (!filters.maxNetIncome || item.netIncome <= maxNetIncome)
        );
      });
    }

    // -ve asc , +ve desc
    const { key, way_to_sort } = sortData;
    const sorted = [...filtered].sort((a, b) => {
      if (key === "date") {
        return way_to_sort === "asc"
          ? new Date(a[key]) - new Date(b[key])
          : new Date(b[key]) - new Date(a[key]);
      }
      return way_to_sort === "asc" ? a[key] - b[key] : b[key] - a[key];
    });
    setFilteredData(sorted);
  };

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (error)
    return <div className="text-center p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="p-4 bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-center text-gray-200">
        Apple Inc. Financial Data
      </h1>

      <div className="mb-6 space-y-4 bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm">
        <h2 className="text-xl font-semibold text-center text-gray-200 mb-6">
          Filters
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Date Range Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-300 text-center mb-2">
              Date Range
            </label>
            <div className="flex gap-4">
              <input
                type="number"
                name="startYear"
                placeholder="Start Year"
                className="w-full p-2 rounded bg-gray-700/50 text-gray-200 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none"
                value={filters.startYear}
                onChange={handleFilterChange}
                style={{
                  WebkitAppearance: "textfield",
                  MozAppearance: "textfield",
                  appearance: "textfield",
                }}
              />
              <input
                type="number"
                name="endYear"
                placeholder="End Year"
                className="w-full p-2 rounded bg-gray-700/50 text-gray-200 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none"
                value={filters.endYear}
                onChange={handleFilterChange}
                style={{
                  WebkitAppearance: "textfield",
                  MozAppearance: "textfield",
                  appearance: "textfield",
                }}
              />
            </div>
          </div>

          {/* Revenue Range Filters - */}
          <div>
            <label className="block text-sm font-medium text-gray-300 text-center mb-2">
              Revenue Range (e.g., 90B, 100M)
            </label>
            <div className="flex gap-4">
              <input
                type="text"
                name="minRevenue"
                placeholder="Min Revenue"
                className="w-full p-2 rounded bg-gray-700/50 text-gray-200 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={filters.minRevenue}
                onChange={handleFilterChange}
              />
              <input
                type="text"
                name="maxRevenue"
                placeholder="Max Revenue"
                className="w-full p-2 rounded bg-gray-700/50 text-gray-200 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={filters.maxRevenue}
                onChange={handleFilterChange}
              />
            </div>
          </div>

          {/* Net Income Range Filters  */}
          <div>
            <label className="block text-sm font-medium text-gray-300 text-center mb-2">
              Net Income Range (e.g., 90B, 100M)
            </label>
            <div className="flex gap-4">
              <input
                type="text"
                name="minNetIncome"
                placeholder="Min Net Income"
                className="w-full p-2 rounded bg-gray-700/50 text-gray-200 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={filters.minNetIncome}
                onChange={handleFilterChange}
              />
              <input
                type="text"
                name="maxNetIncome"
                placeholder="Max Net Income"
                className="w-full p-2 rounded bg-gray-700/50 text-gray-200 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={filters.maxNetIncome}
                onChange={handleFilterChange}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={applyFilters}
            className="px-6 py-2 bg-blue-600 text-gray-200 rounded hover:bg-blue-700 transition-colors duration-200"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* display records and also handle sort */}
      <div className="rounded-lg overflow-hidden">
        <table className="w-full border-collapse bg-gray-800/50 backdrop-blur-sm">
          <thead>
            <tr className="bg-gray-700/50">
              <th
                onClick={() => handleSort("date")}
                className="p-4 text-left text-gray-200 font-semibold w-1/6 cursor-pointer hover:bg-gray-600/50"
              >
                Date{" "}
                {sortData.key === "date" &&
                  (sortData.way_to_sort === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("revenue")}
                className="p-4 text-right text-gray-200 font-semibold w-1/6 cursor-pointer hover:bg-gray-600/50"
              >
                Revenue{" "}
                {sortData.key === "revenue" &&
                  (sortData.way_to_sort === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("netIncome")}
                className="p-4 text-right text-gray-200 font-semibold w-1/6 cursor-pointer hover:bg-gray-600/50"
              >
                Net Income{" "}
                {sortData.key === "netIncome" &&
                  (sortData.way_to_sort === "asc" ? "↑" : "↓")}
              </th>
              <th className="p-4 text-right text-gray-200 font-semibold w-1/6">
                Gross Profit
              </th>
              <th className="p-4 text-right text-gray-200 font-semibold w-1/6">
                EPS
              </th>
              <th className="p-4 text-right text-gray-200 font-semibold w-1/6">
                Operating Income
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr
                key={item.date}
                className={`
                  hover:bg-gray-700/50 transition-colors duration-200
                  ${index % 2 === 0 ? "bg-gray-800/30" : "bg-gray-800/50"}
                `}
              >
                <td className="p-4 text-gray-300">
                  {new Date(item.date).toLocaleDateString()}
                </td>
                <td className="p-4 text-gray-300 text-right">
                  {formatNumber(item.revenue)}
                </td>
                <td className="p-4 text-gray-300 text-right">
                  {formatNumber(item.netIncome)}
                </td>
                <td className="p-4 text-gray-300 text-right">
                  {formatNumber(item.grossProfit)}
                </td>
                <td className="p-4 text-gray-300 text-right">
                  ${item.eps.toFixed(2)}
                </td>
                <td className="p-4 text-gray-300 text-right">
                  {formatNumber(item.operatingIncome)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinancialTable;
