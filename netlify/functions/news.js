const axios = require("axios");

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Content-Type": "application/json",
};

exports.handler = async function (event) {
  const apiKey = process.env.NEWS_API_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "News API key not configured." }),
    };
  }

  const params = event.queryStringParameters || {};
  const category = params.category;
  const q = params.q;

  const baseUrl = "https://newsapi.org/v2";
  const url = q
    ? `${baseUrl}/everything?q=${encodeURIComponent(q)}&sortBy=publishedAt&language=en&pageSize=20&apiKey=${encodeURIComponent(apiKey)}`
    : `${baseUrl}/top-headlines?country=us${category ? `&category=${encodeURIComponent(category)}` : ""}&pageSize=20&apiKey=${encodeURIComponent(apiKey)}`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    if (data.status !== "ok") {
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: data.message || "News API error." }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
    };
  } catch (error) {
    const message =
      error.response?.data?.message || error.response?.data?.error || error.message || "Unable to fetch news.";
    const statusCode = error.response?.status || 500;

    return {
      statusCode,
      headers,
      body: JSON.stringify({ error: message }),
    };
  }
};
