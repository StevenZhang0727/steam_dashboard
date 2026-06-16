const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;

app.use(express.static('public'));

app.get('/api/steam-games', async (req, res) => {
    try {
        const url = 'https://store.steampowered.com/api/featuredcategories/';
        const response = await axios.get(url);
        const data = response.data;

        // 1. 把 Steam API 里四大类别的游戏全部提取出来并拼接到一个大数组里
        // (使用 ... 展开语法，如果某个类别为空则返回空数组 [] 防止报错)
        let combinedGames = [
            ...(data.specials?.items || []),
            ...(data.top_sellers?.items || []),
            ...(data.new_releases?.items || []),
            ...(data.coming_soon?.items || [])
        ];

        // 2. 数据去重 (Deduplication)
        // 因为一个游戏可能既是"热销"又是"特惠"，我们用 Map 根据游戏的 ID 来去重
        const uniqueGamesMap = new Map();
        combinedGames.forEach(game => {
            uniqueGamesMap.set(game.id, game); // 如果 ID 重复，后面的会覆盖前面的
        });

        // 将 Map 重新转换回干净的数组
        const uniqueGamesArray = Array.from(uniqueGamesMap.values());

        console.log(`Successfully fetched and cleaned ${uniqueGamesArray.length} games!`);

        // 3. 把洗干净的、巨大的游戏数组直接发送给前端
        res.json(uniqueGamesArray);

    } catch (error) {
        console.error("Error fetching from Steam:", error);
        res.status(500).json({ error: "Failed to fetch data from Steam" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running! Access it at: http://localhost:${PORT}`);
});