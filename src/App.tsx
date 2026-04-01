import { useEffect, useState } from "react";

type NewsItem = {
  title: string;
  link: string;
  pubDate: string;
  thumbnail: string;
};

export default function App() {
  const [time, setTime] = useState("");
  const [weather, setWeather] = useState("...");
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);

    fetch("https://api.open-meteo.com/v1/forecast?latitude=48.85&longitude=2.35&current_weather=true")
      .then((r) => r.json())
      .then((d) => {
        const temp = d?.current_weather?.temperature;
        setWeather(temp !== undefined ? temp + "°C" : "--");
      })
      .catch(() => setWeather("--"));

    const pickImage = (title: string = ""): string => {
      const t = title.toLowerCase();

      if (t.match(/ukraine|russie|israel|gaza|attaque|armée|guerre|missile/)) return "https://loremflickr.com/800/400/war";
      if (t.match(/inflation|économie|bourse|marché|banque|taux|euro|pétrole/)) return "https://loremflickr.com/800/400/finance";
      if (t.match(/football|psg|match|sport/)) return "https://loremflickr.com/800/400/sport";
      if (t.match(/tech|ia|apple|google/)) return "https://loremflickr.com/800/400/technology";
      if (t.match(/politique|gouvernement|élection/)) return "https://loremflickr.com/800/400/politics";

      return "https://loremflickr.com/800/400/news";
    };

    const loadNews = () => {
      fetch("https://api.rss2json.com/v1/api.json?rss_url=https://news.google.com/rss?hl=fr&gl=FR&ceid=FR:fr")
        .then((r) => r.json())
        .then((d) => {
          const items = (d?.items || []).slice(0, 4);

          const formatted: NewsItem[] = items.map((n: any): NewsItem => ( ({
            title: n.title,
            link: n.link,
            pubDate: n.pubDate,
            thumbnail: pickImage(n.title),
          }));

          setNews((prev: NewsItem[]) => {
            const prevTitles = prev.map((n) => n.title).join("|");
            const newTitles = formatted.map((n) => n.title).join("|");
            return prevTitles === newTitles ? prev : formatted;
          });
        })
        .catch(() => {
          setNews((prev) => prev.length ? prev : [{
            title: "Actualités indisponibles",
            pubDate: new Date().toISOString(),
            link: "https://news.google.com",
            thumbnail: "https://loremflickr.com/800/400/news",
          }]);
        });
    };

    loadNews();
    const newsInterval = setInterval(loadNews, 300000);

    return () => {
      clearInterval(interval);
      clearInterval(newsInterval);
    };
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#f2f2f7", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto", padding: "20px", color: "#111" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "28px", fontWeight: "600" }}>Aujourd’hui</div>
          <div style={{ color: "#666" }}>{time}</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
          <div style={{ background: "white", borderRadius: "20px", padding: "20px", boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}>
            <div style={{ color: "#888" }}>Météo Paris</div>
            <div style={{ fontSize: "32px", fontWeight: "600" }}>{weather}</div>
          </div>

          <div style={{ background: "white", borderRadius: "20px", padding: "20px", boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}>
            <div style={{ color: "#888" }}>CAC 40</div>
            <div style={{ fontSize: "32px", fontWeight: "600", color: "#0a84ff" }}>+0.45%</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {news.slice(0, 3).map((n, i) => (
            <a key={i} href={n.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{ display: i === 0 ? "block" : "flex", background: "white", borderRadius: i === 0 ? "30px" : "20px", overflow: "hidden", cursor: "pointer", boxShadow: "0 10px 25px rgba(0,0,0,0.08)" }}>

                <img
                  src={n.thumbnail}
                  alt=""
                  style={{ width: i === 0 ? "100%" : "40%", height: i === 0 ? "260px" : "auto", objectFit: "cover" }}
                />

                <div style={{ padding: "10px" }}>
                  <div style={{ fontWeight: "600" }}>{n.title}</div>
                  <div style={{ fontSize: "12px", color: "#888" }}>{new Date(n.pubDate).toLocaleString()}</div>
                </div>

              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
