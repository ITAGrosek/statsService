const mongoose = require('mongoose');

const endpointStatsSchema = new mongoose.Schema({
  endpoint: {
    type: String,
    required: true
  },
  callCount: {
    type: Number,
    required: true,
    default: 0
  },
  lastCalled: {
    type: Date,
    default: Date.now
  }
});

const statsSchema = new mongoose.Schema({
  lastEndpoint: {
    type: String,
    required: true
  },
  lastEndpointTimestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  mostFrequentEndpoint: {
    type: String,
    required: true
  },
  mostFrequentEndpointCount: {
    type: Number,
    required: true,
    default: 0
  },
  endpointStats: [endpointStatsSchema]
}, { timestamps: true });

module.exports = mongoose.model('Stats', statsSchema);
