import { useState } from "react";

const API_KEY = "import.meta.env.VITE_GROQ_API_KEY";

export default function App() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(() => {
    try {
      const s = localStorage.getItem("japlearn-saved");
      return s ? JSON.parse(s) : [];
    } catch { return []; }
  });
  const [showReview, setShowReview] = useState(false);
  const [flipIndex, setFlipIndex] = useState(null);

  const translate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{
            role: "user",
            content: `Translate this English text to Japanese: "${input}". Return ONLY a JSON object (no markdown, no backticks): {"kanji":"Japanese translation","hiragana":"Full reading in Hiragana","romaji":"Romanized reading","meaning":"English meaning","grammar":"Simple grammar explanation in 2-3 lines","examples":[{"japanese":"example 1","english":"meaning 1"},{"japanese":"example 2","english":"meaning 2"}]}`
          }],
          temperature: 0.3
        })
      });
      const data = await response.json();
      let text = data.choices[0].message.content;
      text = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(text);
      setResult(parsed);
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    }
    setLoading(false);
  };

  const saveWord = () => {
    if (!result) return;
    const newSaved = [...saved, { ...result, original: input }];
    setSaved(newSaved);
    localStorage.setItem("japlearn-saved", JSON.stringify(newSaved));
    alert("Word saved! ✅");
  };

  const deleteWord = (index) => {
    const newSaved = saved.filter((_, i) => i !== index);
    setSaved(newSaved);
    localStorage.setItem("japlearn-saved", JSON.stringify(newSaved));
  };

  return (
    <div className="container" style={{maxWidth:"650px",margin:"0 auto",padding:"24px"}}>
      <div style={{textAlign:"center",marginBottom:"32px"}}>
        <h1 style={{fontSize:"3rem",fontWeight:"bold",color:"#dc2626"}}>🎌 JapLearn</h1>
        <p style={{color:"#6b7280",fontSize:"1.1rem"}}>Learn Japanese the smart way with AI</p>
        <button onClick={() => setShowReview(!showReview)}
          style={{marginTop:"12px",background:"#dc2626",color:"white",padding:"8px 20px",borderRadius:"999px",border:"none",cursor:"pointer"}}>
          {showReview ? "🔍 Back to Search" : `📚 Review Deck (${saved.length})`}
        </button>
      </div>

      {!showReview ? (
        <>
          <div style={{display:"flex",gap:"10px",marginBottom:"24px"}}>
            <input type="text" value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && translate()}
              placeholder="Type anything in English..."
              style={{flex:1,padding:"16px",borderRadius:"16px",border:"2px solid #fecaca",fontSize:"1rem",outline:"none"}}
            />
            <button onClick={translate} disabled={loading}
              style={{background:"#dc2626",color:"white",padding:"16px 24px",borderRadius:"16px",border:"none",cursor:"pointer",fontSize:"1.2rem",fontWeight:"bold"}}>
              {loading ? "⏳" : "翻訳"}
            </button>
          </div>

          {loading && <div style={{textAlign:"center",color:"#dc2626",fontSize:"1.2rem",marginBottom:"16px"}}>Translating... ⏳</div>}

          {result && (
            <div style={{background:"white",borderRadius:"24px",boxShadow:"0 10px 40px rgba(0,0,0,0.1)",padding:"24px"}}>
              <div style={{textAlign:"center",borderBottom:"1px solid #f3f4f6",paddingBottom:"16px",marginBottom:"16px"}}>
                <div style={{fontSize:"4rem",fontWeight:"bold",color:"#1f2937"}}>{result.kanji}</div>
                <div style={{fontSize:"1.5rem",color:"#dc2626"}}>{result.hiragana}</div>
                <div style={{color:"#9ca3af"}}>{result.romaji}</div>
                <div style={{color:"#4b5563",fontWeight:"500"}}>{result.meaning}</div>
              </div>

              <div style={{background:"#fff5f5",borderRadius:"16px",padding:"16px",marginBottom:"16px"}}>
                <h3 style={{color:"#dc2626",fontWeight:"bold",marginBottom:"6px"}}>📖 Grammar</h3>
                <p style={{color:"#374151",fontSize:"0.9rem"}}>{result.grammar}</p>
              </div>

              <div style={{background:"#fff0f3",borderRadius:"16px",padding:"16px",marginBottom:"16px"}}>
                <h3 style={{color:"#db2777",fontWeight:"bold",marginBottom:"8px"}}>💬 Examples</h3>
                {result.examples.map((ex, i) => (
                  <div key={i} style={{marginBottom:"8px"}}>
                    <div style={{fontWeight:"500",color:"#1f2937"}}>{ex.japanese}</div>
                    <div style={{fontSize:"0.85rem",color:"#6b7280"}}>{ex.english}</div>
                  </div>
                ))}
              </div>

              <button onClick={saveWord}
                style={{width:"100%",background:"#16a34a",color:"white",padding:"14px",borderRadius:"16px",border:"none",cursor:"pointer",fontSize:"1.1rem",fontWeight:"bold"}}>
                ⭐ Save to Review Deck
              </button>
            </div>
          )}
        </>
      ) : (
        <div>
          <h2 style={{fontSize:"1.5rem",fontWeight:"bold",color:"#dc2626",marginBottom:"16px"}}>📚 Your Review Deck</h2>
          {saved.length === 0 ? (
            <div style={{textAlign:"center",color:"#9ca3af",fontSize:"1.1rem",marginTop:"40px"}}>
              No saved words yet! Search and save some words first. 🎌
            </div>
          ) : (
            saved.map((word, i) => (
              <div key={i} onClick={() => setFlipIndex(flipIndex === i ? null : i)}
                style={{background:"white",borderRadius:"16px",boxShadow:"0 4px 12px rgba(0,0,0,0.08)",padding:"16px",marginBottom:"12px",cursor:"pointer"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontSize:"2rem",fontWeight:"bold"}}>{word.kanji}</div>
                    <div style={{fontSize:"0.85rem",color:"#9ca3af"}}>{word.original}</div>
                  </div>
                  <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
                    <span style={{color:"#9ca3af",fontSize:"0.85rem"}}>tap to flip</span>
                    <button onClick={(e) => { e.stopPropagation(); deleteWord(i); }}
                      style={{background:"none",border:"none",cursor:"pointer",fontSize:"1.2rem"}}>🗑️</button>
                  </div>
                </div>
                {flipIndex === i && (
                  <div style={{marginTop:"12px",paddingTop:"12px",borderTop:"1px solid #f3f4f6"}}>
                    <div style={{color:"#dc2626",fontSize:"1.2rem"}}>{word.hiragana}</div>
                    <div style={{color:"#6b7280"}}>{word.romaji}</div>
                    <div style={{color:"#374151",fontWeight:"500"}}>{word.meaning}</div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}