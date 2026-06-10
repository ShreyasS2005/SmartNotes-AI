import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [content, setContent] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  // Connects to your local backend running on port 5001
  const API_BASE_URL = 'http://localhost:5001';

  const handleAction = async (endpoint) => {
    if (!content) {
        alert("Please enter some notes first!");
        return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/${endpoint}`, {
        content: content
      });
      // Handle both string results and object results
      setResult(typeof response.data.result === 'string' ? response.data.result : JSON.stringify(response.data.result, null, 2));
    } catch (error) {
      setResult('Error connecting to backend: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '40px', fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif', maxWidth: '800px', margin: 'auto' }}>
      <h1 style={{ color: '#007bff' }}>SmartNotes AI Web Portal</h1>
      <p>Enter your study notes below to use AI Summarization, Quizzes, and Flashcards.</p>

      <textarea
        id="content-input"
        style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px' }}
        rows="8"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Example: Photosynthesis is the process used by plants to convert light energy into chemical energy..."
      />

      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button id="btn-summarize" style={btnStyle} onClick={() => handleAction('summarize')} disabled={loading}>Summarize</button>
        <button id="btn-quiz" style={btnStyle} onClick={() => handleAction('generate-quiz')} disabled={loading}>Generate Quiz</button>
        <button id="btn-flashcards" style={btnStyle} onClick={() => handleAction('generate-flashcards')} disabled={loading}>Flashcards</button>
      </div>

      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', borderLeft: '5px solid #007bff' }}>
        <h3 style={{ marginTop: 0 }}>Result:</h3>
        <pre id="result-display" style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontSize: '15px' }}>
          {loading ? '🤖 AI is thinking...' : result || 'Waiting for input...'}
        </pre>
      </div>
    </div>
  );
}

const btnStyle = {
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    transition: 'background 0.3s'
};

export default App;
