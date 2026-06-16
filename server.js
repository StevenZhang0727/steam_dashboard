const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;

app.use(express.static('public'));

// === Route 1: 获取游戏大列表 (支持动态区域和语言) ===
app.get('/api/steam-games', async (req, res) => {
    // 从请求中获取参数，如果没有就默认给 US 和 english
    const cc = req.query.cc || 'US'; 
    const lang = req.query.lang || 'english';

    try {
        const url = `https://store.steampowered.com/api/featuredcategories/?cc=${cc}&l=${lang}`;
        const response = await axios.get(url);
        const data = response.data;

        let combinedGames = [
            ...(data.specials?.items || []),
            ...(data.top_sellers?.items || []),
            ...(data.new_releases?.items || []),
            ...(data.coming_soon?.items || [])
        ];

        const uniqueGamesMap = new Map();
        combinedGames.forEach(game => uniqueGamesMap.set(game.id, game));
        const uniqueGamesArray = Array.from(uniqueGamesMap.values());

        res.json(uniqueGamesArray);
    } catch (error) {
        console.error("Error fetching from Steam:", error);
        res.status(500).json({ error: "Failed to fetch data from Steam" });
    }
});

// === Route 2: 获取某一款游戏的深度详情 (支持动态区域和语言) ===
app.get('/api/game-detail', async (req, res) => {
    const appId = req.query.id;
    const cc = req.query.cc || 'US'; 
    const lang = req.query.lang || 'english';

    if (!appId) return res.status(400).json({ error: "Game ID is required!" });

    try {
        const url = `https://store.steampowered.com/api/appdetails?appids=${appId}&cc=${cc}&l=${lang}`;
        const response = await axios.get(url);
        const gameData = response.data[appId];

        if (gameData && gameData.success) {
            res.json(gameData.data);
        } else {
            res.status(404).json({ error: "Detailed data not found for this game." });
        }
    } catch (error) {
        console.error(`Error fetching details for ID ${appId}:`, error.message);
        res.status(500).json({ error: "Failed to fetch detailed data from Steam" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running! Access it at: http://localhost:${PORT}`);
});