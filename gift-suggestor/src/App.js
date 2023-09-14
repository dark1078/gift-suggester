import React, { useState } from "react";
import "./App.css";

function App() {
  const [mangaName, setMangaName] = useState("");
  const [relatedMangas, setRelatedMangas] = useState([]);

  const handleSearch = async () => {
    // First, fetch the manga based on the name provided by the user
    const fetchMangaQuery = `
      query ($search: String) {
        Media (search: $search, type: MANGA) {
          id
        }
      }
    `;

    const variables = {
      search: mangaName,
    };

    try {
      const response = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          query: fetchMangaQuery,
          variables: variables,
        }),
      });

      const data = await response.json();
      const mangaId = data.data.Media.id;

      // Now, fetch related mangas using the manga ID
      const relatedMangasQuery = `
        query ($id: Int) {
          Media (id: $id, type: MANGA) {
            relations {
              edges {
                node {
                  title {
                    romaji
                  }
                  coverImage {
                    large
                  }
                  description
                }
              }
            }
          }
        }
      `;

      const relatedVariables = {
        id: mangaId,
      };

      const relatedResponse = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          query: relatedMangasQuery,
          variables: relatedVariables,
        }),
      });

      const relatedData = await relatedResponse.json();
      setRelatedMangas(
        relatedData.data.Media.relations.edges.map((edge) => edge.node)
      );
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Helper function to clean up the description text
  const cleanDescription = (text) => {
    if (!text) return "";
    return text.replace(/<br>/g, "\n").replace(/<\/?[^>]+(>|$)/g, "");
  };

  return (
    <div className="App">
      <div className="search-container">
        <input
          type="text"
          placeholder="Enter a manga name..."
          value={mangaName}
          onChange={(e) => setMangaName(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      <div className="suggestions">
        {relatedMangas.map((manga) => (
          <div key={manga.title.romaji} className="manga-card">
            <h3>{manga.title.romaji}</h3>
            <img src={manga.coverImage.large} alt={manga.title.romaji} />
            <p>{cleanDescription(manga.description)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
