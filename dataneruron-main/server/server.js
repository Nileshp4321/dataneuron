const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

// Database connection
mongoose.connect('mongodb://localhost:27017/componentsDB', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Component schema
const componentSchema = new mongoose.Schema({
  content: String,
  size: Number
});

const Component = mongoose.model('Component', componentSchema);

// Middleware
app.use(bodyParser.json());

// Count variables
let addCount = 0;
let updateCount = 0;

// Add component route

  
  // Update component route
  app.put('/api/components/:id', async (req, res) => {
    try {
      // Extract data and component ID from request body and params
      const { content, size } = req.body;
      const id = req.params.id;
      // Update component in the database
      await Component.findByIdAndUpdate(id, { content, size });
      // Increment count of update requests
      updateCount++;
      // Send success response
      res.json({ message: 'Component updated successfully' });
    } catch (error) {
      // Handle errors
      res.status(500).json({ error: error.message });
    }
  });
  app.post('/api/components/add', async (req, res) => {
    try {
      // Extract data from request body
      const { content, size } = req.body;
      // Insert new component into the database
      const newComponent = new Component({ content, size });
      await newComponent.save();
      // Increment count of add requests
      addCount++;
      // Send success response
      res.status(201).json({ message: 'Component added successfully' });
    } catch (error) {
      // Handle errors
      res.status(500).json({ error: error.message });
    }
  });
  
  // Count API route
  app.get('/api/components/count', (req, res) => {
    try {
      // Send counts as JSON response
      res.json({ addCount, updateCount });
    } catch (error) {
      // Handle errors
      res.status(500).json({ error: error.message });
    }
  });
  
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
