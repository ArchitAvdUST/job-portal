const bodyParser = require('body-parser');
const mysql = require('mysql2');
const express = require('express');
const moment = require('moment');


var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "pass@word1",
    database: "job"
  });
  
con.connect((err) => {
if(err) throw err;
console.log("Connected!");
});

const app = express();
const PORT = process.env.PORT || 3001;

app.use(bodyParser.json());

app.listen(PORT, ()=> {
    console.log('Server is running on port ${PORT}')
});

// con.connect(function(err) {
//   if (err) throw err;
//   console.log("Connected!");
  // con.query(sql, function (err, result) {
  //   if (err) throw err;
  //   console.log("Result: " + result);
  // });
// });

app.get('/jobs', (req, res) => {
  con.query('SELECT * FROM jobservice', (error, results) => {
      if (error) {
          return res.status(500).json({ error: error.message });
      }
      res.json(results);
  });
});

app.post('/jobs', (req, res) => {
  const { jobId, jobTitle, jobDescription} = req.body ;
  const date = moment().format('YYYY-MM-DD HH:mm:ss');
  //console.log(date);
  const sql = `INSERT INTO jobservice (jobId, jobTitle, jobDescription, jobDate, jobApplicants) VALUES ('${jobId}', '${jobTitle}', '${jobDescription}', '${date}', '0' )`;
  con.query(sql, (error, results) => {
      if (error) {
          return res.status(500).json({ error: error.message });
      }
      res.json({ message: 'Job added successfully' });
  });
});

app.put('/update/jobApplicants', (req,res) => {
  const {jobId} = req.body;

  const sql = `UPDATE jobservice SET jobApplicants = jobApplicants + 1 WHERE jobId = '${jobId}'`;
  con.query(sql, (error, results) => {
      if (error) {
          return res.status(500).json({ error: error.message });
      }
      res.json({ message: 'Job applicants updated successfully' });
  });
});


