// frontend/src/App.jsx
import React, { useState } from 'react';
import axios from 'axios';

const API_ROOT = import.meta.env.VITE_API_ROOT || 'http://localhost:5000';

function App() {
  // Text flow states
  const [prompt, setPrompt] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [enhanced, setEnhanced] = useState('');
  const [approvedPrompt, setApprovedPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Image flow states
  const [file, setFile] = useState(null);
  const [imageCaption, setImageCaption] = useState('');
  const [variations, setVariations] = useState([]);

  // Text analysis
  const analyzeText = async () => {
    if (!prompt) return alert('Enter prompt first');
    setLoading(true);
    try {
      const r = await axios.post(`${API_ROOT}/api/analyze-text`, { text: prompt });
      setAnalysis(r.data);
    } catch (e) {
      console.error(e);
      alert('Analysis failed');
    } finally { setLoading(false); }
  };

  const enhanceText = async () => {
    if (!prompt) return alert('Enter prompt first');
    setLoading(true);
    try {
      const r = await axios.post(`${API_ROOT}/api/enhance-text`, { prompt });
      setEnhanced(r.data.enhanced || '');
    } catch (e) {
      console.error(e);
      alert('Enhance failed');
    } finally { setLoading(false); }
  };

  const generateImage = async (promptToUse) => {
    setLoading(true);
    try {
      const r = await axios.post(`${API_ROOT}/api/generate-image`, { prompt: promptToUse });
      setGeneratedImage(r.data.image);
    } catch (e) {
      console.error(e);
      alert('Image generation failed');
    } finally { setLoading(false); }
  };

  // Image upload analysis
  const analyzeImage = async () => {
    if (!file) return alert('Choose an image first');
    const fd = new FormData();
    fd.append('image', file);
    setLoading(true);
    try {
      const r = await axios.post(`${API_ROOT}/api/analyze-image`, fd, { headers: { 'Content-Type': 'multipart/form-data' }});
      setImageCaption(JSON.stringify(r.data.caption));
    } catch (e) {
      console.error(e);
      alert('Image analysis failed');
    } finally { setLoading(false); }
  };

  const generateVariations = async (count = 3) => {
    if (!file) return alert('Choose an image first');
    const fd = new FormData();
    fd.append('image', file);
    fd.append('count', count);
    setLoading(true);
    try {
      const r = await axios.post(`${API_ROOT}/api/generate-variations`, fd, { headers: { 'Content-Type': 'multipart/form-data' }});
      setVariations(r.data.variations || []);
    } catch (e) {
      console.error(e);
      alert('Variations failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Inter, Roboto, Arial' }}>
      <h1>Image & Text Generator — Prototype</h1>

      <section style={{ marginTop: 20 }}>
        <h2>Text → Enhance → Generate</h2>
        <textarea rows={4} placeholder="Write a prompt to create an image..." value={prompt} onChange={e => setPrompt(e.target.value)} style={{ width: '100%' }} />
        <div style={{ marginTop: 8 }}>
          <button onClick={analyzeText} disabled={loading}>Analyze</button>
          <button onClick={enhanceText} disabled={loading} style={{ marginLeft: 8 }}>Auto-Enhance</button>
        </div>

        {analysis && (
          <div style={{ marginTop: 8, background: '#f3f3f3', padding: 8 }}>
            <b>Analysis:</b>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(analysis, null, 2)}</pre>
          </div>
        )}

        {enhanced && (
          <div style={{ marginTop: 8 }}>
            <b>Enhanced Prompt (preview):</b>
            <div style={{ background: '#fff', padding: 8 }}>{enhanced}</div>
            <div style={{ marginTop: 6 }}>
              <button onClick={() => { setApprovedPrompt(enhanced); generateImage(enhanced); }} disabled={loading}>Approve & Generate Image</button>
              <button onClick={() => { setApprovedPrompt(enhanced); }} style={{ marginLeft: 8 }}>Approve only</button>
            </div>
          </div>
        )}

        {approvedPrompt && !generatedImage && (
          <div style={{ marginTop: 8 }}>
            <b>Approved prompt:</b> {approvedPrompt}
            <div><button onClick={() => generateImage(approvedPrompt)} disabled={loading}>Generate Image</button></div>
          </div>
        )}

        {generatedImage && (
          <div style={{ marginTop: 12 }}>
            <b>Generated Image:</b>
            <div><img src={generatedImage} alt="generated" style={{ maxWidth: 512 }} /></div>
          </div>
        )}
      </section>

      <hr style={{ margin: '30px 0' }} />

      <section>
        <h2>Image → Analyze → Variations</h2>
        <input type="file" accept="image/*" onChange={(e) => { setFile(e.target.files[0]); setVariations([]); }} />
        <div style={{ marginTop: 8 }}>
          <button onClick={analyzeImage} disabled={loading}>Analyze Image</button>
          <button onClick={() => generateVariations(3)} disabled={loading} style={{ marginLeft: 8 }}>Generate 3 Variations</button>
        </div>

        {imageCaption && (
          <div style={{ marginTop: 12 }}>
            <b>Caption/analysis:</b>
            <div style={{ background: '#f3f3f3', padding: 8 }}>{imageCaption}</div>
          </div>
        )}

        {variations.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <b>Variations:</b>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
              {variations.map((v, i) => <img key={i} src={v} alt={'variation-'+i} style={{ width: 200, border: '1px solid #ddd' }} />)}
            </div>
          </div>
        )}
      </section>

      {loading && <div style={{ marginTop: 20 }}>Working... please wait</div>}
    </div>
  );
}

export default App;
