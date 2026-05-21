import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import SearchBar from "./SearchBar";

const FetchData = ({ cat }) => {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");

    const queryString = searchQuery
      ? `?q=${encodeURIComponent(searchQuery)}`
      : cat
      ? `?category=${encodeURIComponent(cat)}`
      : "";

    const apiUrl = `/.netlify/functions/news${queryString}`;

    try {
      const response = await axios.get(apiUrl);
      const responseData = response.data;

      if (responseData.status && responseData.status !== "ok") {
        throw new Error(responseData.message || "News API returned an error.");
      }

      const articles = responseData.articles || [];
      setData(articles);

      if (articles.length === 0) {
        setError(
          searchQuery
            ? "No search results found. Try a different keyword."
            : "No articles available right now. Try another category."
        );
      }

      return articles;
    } catch (fetchError) {
      const message =
        fetchError.response?.data?.error || fetchError.message || "Unable to fetch news.";
      console.error("News fetch error:", message);
      setError(message);
      setData([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [cat, searchQuery]);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      if (!mounted) return;
      await fetchData();
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [fetchData]);

  const handleSearch = (searchTerm) => {
    setSearchQuery(searchTerm || "");
  };

  return (
    <div className="container my-4">
      <SearchBar onSearch={handleSearch} />

      <div className="row justify-content-center g-4 mt-3">
        {loading ? (
          <div className="col-12 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : error ? (
          <div className="col-12">
            <div className="alert alert-warning" role="alert">
              {error}
            </div>
          </div>
        ) : data.length > 0 ? (
          data.map((items, index) => (
            <div key={index} className="col-12 col-md-10 col-lg-8">
              <div className="card shadow-sm h-100">
                {items.urlToImage && (
                  <img
                    src={items.urlToImage}
                    alt={items.title || "Article image"}
                    className="card-img-top"
                    style={{ height: "320px", objectFit: "cover" }}
                  />
                )}
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{items.title}</h5>
                  <p className="card-text text-muted mb-2">
                    {items.source?.name || "Unknown source"} ·{' '}
                    {items.publishedAt
                      ? new Date(items.publishedAt).toLocaleDateString()
                      : ""}
                  </p>
                  <p className="card-text">
                    {items.description || items.content || "No description available."}
                  </p>
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
