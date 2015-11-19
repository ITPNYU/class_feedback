var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
// verbose mode
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('test.sqlite');
;

var app = express();

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
app.use(bodyParser.json());

// initialize database 
// course_id is "section_id", however it should represent unique id for ditffereb semester
db.serialize(function() {
    db.run("CREATE TABLE IF NOT EXISTS elements (element_id INTEGER PRIMARY KEY AUTOINCREMENT, course_id TEXT, element_name TEXT)");
    db.run("CREATE TABLE IF NOT EXISTS scores (element_id INTEGER, student_netid TEXT, score INTEGER, FOREIGN KEY(element_id) REFERENCES elements(element_id))");
    
    // db.run("INSERT INTO elements (course_id, element_name) VALUES ('4056', 'admiration')");
    // db.run("INSERT INTO elements (course_id, element_name) VALUES ('4056', 'bouquet')");
    // db.run("INSERT INTO elements (course_id, element_name) VALUES ('4056', 'corsage')");
    // db.run("INSERT INTO elements (course_id, element_name) VALUES ('4056', 'festoon')");
    // db.run("INSERT INTO elements (course_id, element_name) VALUES ('4056', 'ovation')");

    // db.run("INSERT INTO scores (element_id, student_netid, score) VALUES (1,'net001', 1)");
    // db.run("INSERT INTO scores (element_id, student_netid, score) VALUES (2,'net001', 2)");
    // db.run("INSERT INTO scores (element_id, student_netid, score) VALUES (3,'net001', 3)");
    // db.run("INSERT INTO scores (element_id, student_netid, score) VALUES (4,'net001', 4)");
    // db.run("INSERT INTO scores (element_id, student_netid, score) VALUES (5,'net001', 5)");

    // db.run("INSERT INTO scores (element_id, student_netid, score) VALUES (1,'net002', 5)");
    // db.run("INSERT INTO scores (element_id, student_netid, score) VALUES (2,'net002', 4)");
    // db.run("INSERT INTO scores (element_id, student_netid, score) VALUES (3,'net002', 3)");
    // db.run("INSERT INTO scores (element_id, student_netid, score) VALUES (4,'net002', 2)");
    // db.run("INSERT INTO scores (element_id, student_netid, score) VALUES (5,'net002', 1)");

});

app.get('/', function (req, res){

    console.log("Playing");
    
});


// List all students of section with section info
// GET, sections/:section_id/students
app.get('/sections/:section_id/students', function (req, res){

	var section_id = req.params.section_id;
	// force ITPG-GT.2773.1
	section_id = "4056";

    var feed_data = fs.readFileSync('test.json').toString();

	var fake_respond = feed_data;
    res.json({ "section_id" : section_id, "title" : fake_respond[0].title, "semester" : fake_respond[0].semester, "year" : fake_respond[0].year, "course_id" : fake_respond[0].course_number+"."+fake_respond[0].section_number, "data": fake_respond});
     
    
});

// List all elements of section
// GET, sections/:section_id/elements
app.get('/sections/:section_id/elements', function (req, res){

	var section_id = req.params.section_id;

	db.all("SELECT * FROM elements WHERE course_id = ?",[section_id], function(err, rows){
        
        res.json({"section_id":section_id, "data":rows});
       
    });
    
});

// Add an elements of section
// POST, sections/:section_id/elements
app.post('/sections/:section_id/elements', function (req, res){

	var section_id = req.params.section_id;
	var data = req.body;
    // json {"new_element" : "new_element_name"}
    var new_element = data.new_element;
	// need to check if section is available 
	db.get("SELECT course_id FROM elements WHERE element_name = ? AND course_id = ?",[new_element,section_id], function(err, row){
    
        if (row == null){

        	db.run("INSERT INTO elements (course_id, element_name) VALUES (?, ?)", section_id, new_element);
            console.log("Updated");
        }
        else{
            console.log("Data existed");
        }
       
    });

    res.end();   
    
});

// Delete single element of section
// DELETE, sections/:section_id/elements/:element_name
app.delete('/sections/:section_id/elements/:element_name', function (req, res) {
  
  
  var section_id = req.params.section_id;
  var element_name = req.params.element_name;

  db.run("DELETE FROM elements WHERE element_name = ? AND course_id = ?", [element_name, section_id],function (err,row){

    console.log("Finished!");

  });

  res.send('DELETE request to homepage');
});


// Update single element of section
// PUT, sections/:section_id/elements/:element_name
app.put('/sections/:section_id/elements/:element_name', function (req, res){

    var section_id = req.params.section_id;
    var old_element_name = req.params.element_name;
    var data = req.body;
    // json {"element_update" : "update_element_name"}
    var element_update = data.element_update;
    // need to check if section is available 
    db.get("SELECT course_id FROM elements WHERE element_name = ? AND course_id = ?",[old_element_name,section_id], function(err, row){
    
        if (row == null){

            console.log("Data not existed");

        }
        else{

            db.run("UPDATE elements SET element_name = ? WHERE element_name = ? AND course_id = ? ", element_update, old_element_name, section_id);
            console.log("Updated");
        }
       
    });

    res.end();   
    
});

// Show a student’s all scores of an section
// GET, students/:student_netid/sections/:section_id/scores
app.get('/students/:student_netid/sections/:section_id/scores', function (req, res){

    var student_netid = req.params.student_netid;
    var section_id = req.params.section_id;
    
    db.all("SELECT element_name, score FROM elements, scores WHERE elements.element_id = scores.element_id AND student_netid = ? AND course_id = ?",[student_netid, section_id], function(err, rows){

             res.json({"student_netid" : student_netid, "section_id": section_id, "data" : rows});
        
       
    });
    
});


app.listen(8080);

console.log("Server at http://localhost:8080/");
