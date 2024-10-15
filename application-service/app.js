const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(bodyParser.json());

mongoose.connect('mongodb://127.0.0.1:27017/studentManagement',{
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))

app.listen(PORT, ()=> {
    console.log('Server is running on port ${PORT}')
});

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    jobIds: [String],

});

module.exports = mongoose.model('User', userSchema);

app.post('/users', (req, res) => {
    const { userName, email, password} = req.body ;  
    const user = new User({userName, email, password});
    user.save()
    .then(() => res.json({ message: 'User registered successfully' }))
    .catch(err => res.status(400).json({ error: err.message }));  
});

var sessionId = null;

app.post('/login', (req, res) => {
    const { email, password} = req.body ;
    User.findOne({email, password})
    .then(user => {
        if(user) {
            res.json({ message: 'Login successful' });
            sessionId = user._id; // Store user ID in session
            return res.redirect('/jobs');
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
        userLogin();
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

const callGetJobsApi = async () => {
    try {
        const response = await axios.get('http://localhost:3001/api/jobs');
        console.log('Availabel Jobs:', response.data);
    } catch (error) {
        console.error('Error calling API:', error);
    }
};

app.get('/jobs'),(req,res) => {
    if(!sessionId){
        return res.status(401).json({ error: 'Unauthorized' });
    }
    callGetJobsApi();
    console.log('To apply for a job, go to http://localhost:3002/apply/{jobId} where {jobId} is where you need to enter the jobId of the job you want to apply for');

}

app.post('/apply/:jobId', (req, res) => {
    if(!sessionId){
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const {jobId} = req.params;
    var user = User.findById(sessionId);
    user.jobIds.push(jobId);
    res.json({ message: 'Job application successful' });
});

app.get('/logout', (req, res) => {
    sessionId = null;
    res.json({ message: 'Logout successful' });
});

app.get('/myJobs',(req,res) => {
    if(!sessionId){
        return res.status(401).json({ error: 'Unauthorized' });
    }
    var user = User.findById(sessionId);
    res.json(user.jobIds);
});

