const express = require('express');
const mongoose = require('mongoose');
const Stats = require('./statsModel'); // Path to your model
const app = express();
const PORT = 9000; 

app.use(express.json());

// Hardcoded MongoDB URI
//const MONGODB_URI = 'mongodb://localhost:27017/statsdb';

//docker

const MONGODB_URI = 'mongodb://mongo:27017/statsdb';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.send('Stats Service is running!');
});

// API za posodobitev statistike za dani endpoint
app.post('/api/stats/updateStats', async (req, res) => {
    const { endpoint } = req.body;
    if (!endpoint) {
        return res.status(400).json({ message: 'Endpoint parameter is required.' });
    }

    try {
        let stats = await Stats.findOne();
        if (!stats) {
            stats = new Stats({
                lastEndpoint: endpoint,
                lastEndpointTimestamp: new Date(),
                mostFrequentEndpoint: endpoint,
                mostFrequentEndpointCount: 1,
                endpointStats: [{
                    endpoint: endpoint,
                    callCount: 1,
                    lastCalled: new Date()
                }]
            });
        } else {
            stats.lastEndpoint = endpoint;
            stats.lastEndpointTimestamp = new Date();
            let endpointStat = stats.endpointStats.find(es => es.endpoint === endpoint);
            if (endpointStat) {
                endpointStat.callCount++;
                endpointStat.lastCalled = new Date();
            } else {
                stats.endpointStats.push({
                    endpoint: endpoint,
                    callCount: 1,
                    lastCalled: new Date()
                });
            }
            // Sortira po številu klicev in posodobi najpogosteje uporabljeni endpoint
            stats.endpointStats.sort((a, b) => b.callCount - a.callCount);
            stats.mostFrequentEndpoint = stats.endpointStats[0].endpoint;
            stats.mostFrequentEndpointCount = stats.endpointStats[0].callCount;
        }
        await stats.save();
        res.status(200).json({ message: 'Statistics updated successfully', updatedStats: stats });
    } catch (error) {
        console.error("Error updating stats: ", error);
        res.status(500).json({ message: "Error updating stats" });
    }
});

// API za pridobivanje števila klicev za posamezen endpoint
app.get('/api/stats/endpointStats', async (req, res) => {
    try {
        const stats = await Stats.findOne();
        if (!stats || !stats.endpointStats) {
            return res.status(404).json({ message: "No endpoint data available." });
        }
        const counts = stats.endpointStats.map(es => ({
            endpoint: es.endpoint,
            method: es.method,
            count: es.callCount,
            lastCalled: es.lastCalled
        }));
        res.json(counts);
    } catch (error) {
        console.error("Error retrieving endpoint stats: ", error);
        res.status(500).json({ message: "Error retrieving data" });
    }
});



// Retrieve the last used endpoint
app.get('/api/stats/lastEndpoint', async (req, res) => {
    try {
        const stats = await Stats.findOne();
        if (!stats) {
            return res.status(404).json({ message: 'No data available' });
        }
        res.json({ lastEndpoint: stats.lastEndpoint, lastCalled: stats.lastEndpointTimestamp });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Retrieve the most frequently used endpoint
app.get('/api/stats/mostFrequentEndpoint', async (req, res) => {
    try {
        const stats = await Stats.findOne();
        if (!stats) {
            return res.status(404).json({ message: 'No data available' });
        }
        res.json({ mostFrequentEndpoint: stats.mostFrequentEndpoint, count: stats.mostFrequentEndpointCount });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
