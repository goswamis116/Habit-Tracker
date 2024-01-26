const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;
const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');
const uri = 'mongodb://localhost:27017';

const client = new MongoClient(uri);

client.connect()
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

  const database = client.db('habitTracker'); 
  const habitsCollection = database.collection('habits');


// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Routes
app.get('/', async (req, res) => {
    try {
        // Retrieve habits data from MongoDB
        const habitsData = await habitsCollection.find().toArray();
        res.render('index', { habits: habitsData });
    } catch (err) {
        console.error('Error retrieving habits:', err);
        res.status(500).send('Error retrieving habits');
    }
});

// Route to add a habit
app.post('/habits/add', async (req, res) => {
    try {
        const newHabit = {
            name: req.body.habitName,
            status: {} 
        };

        // Insert the new habit into the database
        const result = await habitsCollection.insertOne(newHabit);
        
        res.redirect('/');
    } catch (err) {
        console.error('Error adding habit:', err);
        res.status(500).send('Error adding habit');
    }
});


// Route to update habit status for a specific day
app.post('/habits/:habitId/weekly/:day/update', async (req, res) => {
    try {
        const habitId = req.params.habitId;
        const dayOfWeek = req.params.day;
        const status = req.body.status;

        // Convert habitId to MongoDB ObjectID
        const objectId = new ObjectId(habitId);

        const updateObject = { $set: {} };
        updateObject.$set[`status.${dayOfWeek}`] = status;

        const result = await habitsCollection.updateOne(
            { _id: objectId },
            updateObject
        );

        res.json({ success: true }); // Send success response
    } catch (err) {
        console.error('Error updating habit status:', err);
        res.status(500).json({ success: false, error: 'Error updating habit status' });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});