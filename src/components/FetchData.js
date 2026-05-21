import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import SearchBar from "./SearchBar";

const FetchData = ({ cat }) => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const fetchData = useCallback(async () => {
    const apiKey = process.env.REACT_APP_NEWS_API_KEY;
    const country = "in";
    const categoryParam = cat ? `&category=${cat}` : "";
    const topHeadlinesUrl = `https://newsapi.org/v2/top-headlines?country=${country}${categoryParam}&apiKey=${apiKey}`;
    const fallbackUrl = `https://newsapi.org/v2/top-headlines?country=${country}&apiKey=${apiKey}`;
    const everythingUrl = `https://newsapi.org/v2/everything?q=${cat || "india"}&language=en&pageSize=20&apiKey=${apiKey}`;

    console.log("API Key loaded:", apiKey ? "Yes" : "No");
    console.log("Fetching from URL:", topHeadlinesUrl);

    try {
      const response = await axios.get(topHeadlinesUrl);
      console.log("API Response:", response.data);
      const articles = response.data.articles || [];

      if (articles.length > 0) {
        return articles;
      }

      console.warn("No articles found for category, trying fallback routes...");

      if (cat) {
        const fallbackResponse = await axios.get(fallbackUrl);
        const fallbackArticles = fallbackResponse.data.articles || [];
        if (fallbackArticles.length > 0) {
          return fallbackArticles;
        }
      }

      const everythingResponse = await axios.get(everythingUrl);
      console.log("Everything API Response:", everythingResponse.data);
      return everythingResponse.data.articles || [];
    } catch (error) {
      console.error("Error fetching data:", error.response?.data || error.message);
      return [];
    }
  }, [cat]);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      const articles = await fetchData();
      if (mounted) {
        setData(articles);
        setFilteredData([]);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [fetchData]);

  const handleSearch = (searchTerm) => {
    if (!searchTerm) {
      setFilteredData([]);
      return;
    }
    const filteredArticles = data.filter((article) =>
      article.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filteredArticles);
  };

  const articlesToDisplay = filteredData.length > 0 ? filteredData : data;

  return (
    <div className="container my-4">
      <SearchBar onSearch={handleSearch} />

      <div className="row justify-content-center g-4 mt-3">
        {articlesToDisplay.length > 0 ? (
          articlesToDisplay.map((items, index) => (
            <div key={index} className="col-12 col-md-10 col-lg-8">
              <div className="card shadow-sm h-100">
                {items.urlToImage && (
                  <img
                    src={items.urlToImage}
                    alt={items.title || 'Article image'}
                    className="card-img-top"
                    style={{ height: '320px', objectFit: 'cover' }}
                  />
                )}
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{items.title}</h5>
                  <p className="card-text text-muted mb-2">
                    {items.source?.name || 'Unknown source'} ·{' '}
                    {items.publishedAt
                      ? new Date(items.publishedAt).toLocaleDateString()
                      : ''}
                  </p>
                  <p className="card-text">{items.description || items.content || 'No description available.'}</p>
                  <div className="mt-auto">
                    <a
                      href={items.url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-primary btn-sm"
                    >
                      Read more
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="alert alert-info" role="alert">
              No articles to display. Try another category or search term.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FetchData;
