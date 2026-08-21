import React, { useState, useEffect } from 'react';

function Assistants() {
  const [assistants, setAssistants] = useState([]);
  const [newAssistant, setNewAssistant] = useState({ head_coach_last_name: '', head_coach_league: '', head_coach_season: '', head_coach_year: '', first_name: '', last_name: '' });

  useEffect(() => {
    fetch('/api/assistants')
      .then(res => res.json())
      .then(data => setAssistants(data));
  }, []);

  const handleAddAssistant = async (e) => {
    e.preventDefault();
    const response = await fetch('/api/assistants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAssistant)
    });
    if (response.ok) {
      const result = await response.json();
      setAssistants([...assistants, result]);
      setNewAssistant({ ...newAssistant });
    }
  };

  const handleDeleteAssistant = async (id) => {
    try {
      await fetch(`/api/assistants/${id}`, { method: 'DELETE' });
      setAssistants(assistants.filter(a => a.id !== id));
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  return (
    <div>
      <h1>Assistant Coaches</h1>
      <form onSubmit={handleAddAssistant}>
        <input
          type=text
          placeholder=First Name
          value={newAssistant.first_name}
          onChange={(e) => setNewAssistant({...newAssistant, first_name: e.target.value})}
        />
        <input
          type=text
          placeholder=Last Name
          value={newAssistant.last_name}
          onChange={(e) => setNewAssistant({...newAssistant, last_name: e.target.value})}
        />
        <button type=submit>Add Assistant</button>
      </form>
      <ul>
        {assistants.map(assistant => (
          <li key={assistant.id}>
            {assistant.first_name} {assistant.last_name}
            <button onClick={() => handleDeleteAssistant(assistant.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Assistants;
