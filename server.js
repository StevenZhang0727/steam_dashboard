const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;

app.use(express.static('public'));

// === Route 1: 获取游戏大列表 ===
app.get('/api/steam-games', async (req, res) => {
    try {
        const url = 'https://store.steampowered.com/api/featuredcategories/?cc=US&l=english';
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

// === Route 2: 获取某一款游戏的深度详情 ===
app.get('/api/game-detail', async (req, res) => {
    const appId = req.query.id; // 从前端请求的 URL 里提取 ?id=xxx 的参数

    if (!appId) {
        return res.status(400).json({ error: "Game ID is required!" });
    }

    try {
        // 请求 Steam 真正的详细数据接口
        const url = `https://store.steampowered.com/api/appdetails?appids=${appId}&cc=US&l=english`;
        const response = await axios.get(url);
        
        // Steam 的接口设计有点奇葩，它的数据是包裹在游戏 ID 里的，比如 {"123": { success: true, data: {...} }}
        const gameData = response.data[appId];

        if (gameData && gameData.success) {
            // 如果查到了，把核心数据发给前端
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