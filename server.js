const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;

// Serve static files from the 'public' directory
app.use(express.static('public'));

// API Route: Fetches featured and special offers data from Steam
app.get('/api/steam-games', async (req, res) => {
    try {
        // Steam's official public API for featured categories (no API Key required)
        const url = 'https://store.steampowered.com/api/featuredcategories/';
        const response = await axios.get(url);
        
        // Forward the JSON data from Steam directly to the frontend
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching from Steam:", error);
        res.status(500).json({ error: "Failed to fetch data from Steam" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running! Access it at: http://localhost:${PORT}`);
});