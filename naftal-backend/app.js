const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const requestsRoutes = require('./routes/requests');
const adminRoutes = require('./routes/admin');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Link routes
app.use('/api/auth', authRoutes);
app.use('/api/employe', authRoutes); // for /api/employe/register and /api/employe/login compatibility
app.use('/api/technicien', authRoutes); // for /api/technicien/register and /api/technicien/login compatibility
app.use('/api/requests', requestsRoutes);
app.use('/api/admin', adminRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})


app.get('/', (req, res) => {
  res.send('Backend is running');
}
);


