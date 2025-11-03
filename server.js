// server.js - Mini MCP Server per test (ES Modules)
import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'MCP Server running', version: '1.0' });
});

// Endpoint MCP: Lista tools disponibili
app.post('/tools', (req, res) => {
  res.json({
    tools: [
      {
        name: 'get_time',
        description: 'Returns current time and date',
        parameters: {}
      },
      {
        name: 'calculate',
        description: 'Simple math calculator',
        parameters: {
          expression: { 
            type: 'string', 
            description: 'Math expression like "2+2" or "10*5"' 
          }
        }
      },
      {
        name: 'random_number',
        description: 'Generate random number between min and max',
        parameters: {
          min: { type: 'number', description: 'Minimum value' },
          max: { type: 'number', description: 'Maximum value' }
        }
      }
    ]
  });
});

// Endpoint MCP: Esegui tool
app.post('/execute', (req, res) => {
  const { tool, parameters } = req.body;
  
  console.log(`Executing tool: ${tool}`, parameters);
  
  try {
    if (tool === 'get_time') {
      const now = new Date();
      res.json({ 
        result: `Current time: ${now.toLocaleString('it-IT')}` 
      });
    } 
    else if (tool === 'calculate') {
      // Sicurezza: solo operazioni matematiche base
      const expr = parameters.expression.replace(/[^0-9+\-*/().]/g, '');
      const result = eval(expr);
      res.json({ 
        result: `${parameters.expression} = ${result}` 
      });
    }
    else if (tool === 'random_number') {
      const min = parameters.min || 0;
      const max = parameters.max || 100;
      const random = Math.floor(Math.random() * (max - min + 1)) + min;
      res.json({ 
        result: `Random number between ${min} and ${max}: ${random}` 
      });
    }
    else {
      res.status(404).json({ error: 'Tool not found' });
    }
  } catch (e) {
    console.error('Error executing tool:', e);
    res.status(500).json({ error: e.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 MCP Test Server running on http://localhost:${PORT}`);
  console.log(`📡 Add this URL to your Natura AI MCP servers:`);
  console.log(`   Name: Test Calculator`);
  console.log(`   URL: http://localhost:${PORT}`);
});