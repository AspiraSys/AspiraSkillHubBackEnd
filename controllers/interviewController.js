const db = require("../models/db");


// 1. User sends an interview request
exports.requestInterview =  (req, res) => {
  const { user_id, technology_id, date, mode, level } = req.body;
  const sql = `INSERT INTO interview_requests (user_id, technology_id, date, mode, level, status) VALUES (?, ?, ?, ?, ?, '1')`;
  db.query(sql, [user_id, technology_id, date, mode, level], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send({ message: "Interview request sent!", request_id: result.insertId });
  });
};

// 2. View a particular interview request
exports.getRequestById = (req, res) => {
  const { id } = req.params;
  db.query(`SELECT * FROM interview_requests WHERE id = ?`, [id], (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.length === 0) return res.status(404).send({ message: "Request not found" });
    res.send(result[0]);
  });
};

// 3. Admin views pending requests
exports.getPendingRequests = (req, res) => {
  db.query(`SELECT * FROM interview_requests WHERE status = '1'`, (err, results) => {
    if (err) return res.status(500).send(err);
    res.send(results);
  });
};

// 4. Admin schedules the interview
exports.scheduleInterview = (req, res) => {
    const interview_request_id = req.params.id;
    const { student_id, technology_id, interviewer_name, topic, meeting_link, mode, date, time } = req.body;
  
    // First, check if the interview request exists and is not canceled
    const checkSql = "SELECT status FROM interview_requests WHERE id = ?";
    
    db.query(checkSql, [interview_request_id], (err, results) => {
      if (err) return res.status(500).send(err);
  
      if (results.length === 0) {
        return res.status(404).json({ error: "No interview request found with this ID." });
      }

      const currentStatus = results[0].status;

      if (currentStatus === "4") {
        return res.status(400).json({ error: "This interview request was canceled by the user. Cannot schedule." });
      }

      if (currentStatus === "3") {
        return res.status(400).json({ error: "This interview request was canceled by the admin. Cannot schedule." });
      }
  
      // If request exists and is not canceled, proceed with scheduling
      const insertSql = `INSERT INTO student_interviews 
        (interview_request_id, student_id, technology_id, interviewer_name, topic, meeting_link, mode, date, time, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '0')`;
  
      db.query(insertSql, [interview_request_id, student_id, technology_id, interviewer_name, topic, meeting_link, mode, date, time], 
        (err, result) => {
          if (err) return res.status(500).send(err);
          res.json({ message: "Interview scheduled!", interview_id: result.insertId });
        }
      );
    });
};

// 5. Mark interview as completed
exports.MarkcompleteInterview =(req, res) => {
    const interview_request_id = req.params.id;
  
    // Check if the interview request is canceled
    const checkSql = "SELECT status FROM interview_requests WHERE id = ?";
    
    db.query(checkSql, [interview_request_id], (err, results) => {
      if (err) return res.status(500).send(err);
  
      if (results.length === 0) {
        return res.status(404).json({ error: "No interview request found with this ID." });
      }
  
      const currentStatus = results[0].status;
  
      if (currentStatus === "3" || currentStatus === "4") {
        return res.status(400).json({ error: "This interview has been canceled and cannot be marked as completed." });
      }
  
      // If it's not canceled, mark as completed
      const updateSql = "UPDATE interview_requests SET status = '2' WHERE id = ?";
      
      db.query(updateSql, [interview_request_id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ message: "Interview marked as completed." });
      });
    });
  };


  //  6.get interview response by id
  exports.getInterviewResponseById = (req, res) => {
    const interview_request_id = req.params.id;

    // Query to check interview status
    const checkSql = `
        SELECT ir.id, ir.status, 
               sr.ratings, sr.feedback, sr.interviewquestion 
        FROM interview_requests ir
        LEFT JOIN student_interview_responses sr 
        ON ir.id = sr.student_interview_id
        WHERE ir.id = ?`;

    db.query(checkSql, [interview_request_id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Database error.", details: err });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "No interview request found with this ID." });
        }

        const interview = results[0];
        const status = parseInt(interview.status); // Ensure status is an integer

        switch (status) {
            case 1:
                return res.status(200).json({ message: "Interview is still pending." });
            case 2:
                return res.status(200).json({
                    message: "Interview completed successfully.",
                    ratings: interview.ratings || "No ratings provided",
                    feedback: interview.feedback || "No feedback available",
                    interview_question: interview.interviewquestion || "No interview questions recorded"
                });
            case 3:
                return res.status(400).json({ message: "This interview was canceled by the admin." });
            case 4:
                return res.status(400).json({ message: "This interview was canceled by the student." });
            default:
                return res.status(500).json({ error: "Unexpected status code.", status });
        }
    });
};

   // 7. User/Admin cancels interview request
exports.cancelInterviewStatus =(req, res) => {
    const interview_request_id = req.params.id;
    const { cancelled_by } = req.body; // 'admin' or 'student'
  
    // First, check if the interview request exists and is not already canceled
    const checkSql = "SELECT status FROM interview_requests WHERE id = ?";
    
    db.query(checkSql, [interview_request_id], (err, results) => {
      if (err) return res.status(500).send(err);
  
      if (results.length === 0) {
        return res.status(404).json({ error: "No interview request found with this ID." });
      }
  
      const currentStatus = results[0].status;
  
      if (currentStatus === "3" || currentStatus === "4") {
        return res.status(400).json({ error: "This interview has already been canceled and cannot be changed." });
      }
  
      // Update status to "cancelled"
      const updateSql = "UPDATE interview_requests SET status = ? WHERE id = ?";
      const cancelStatus = cancelled_by === "admin" ? "3" : "4"; // 3 = Admin Canceled, 4 = User Canceled
  
      db.query(updateSql, [cancelStatus, interview_request_id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ message: `Interview canceled by ${cancelled_by}.` });
      });
    });
  };

// 8. Reschedule interview
exports.rescheduleInterview = (req, res) => {
    const interview_request_id = req.params.id;
    const { date, time } = req.body;
  
    // Check if the interview request is canceled
    const checkSql = "SELECT status FROM interview_requests WHERE id = ?";
    
    db.query(checkSql, [interview_request_id], (err, results) => {
      if (err) return res.status(500).send(err);
  
      if (results.length === 0) {
        return res.status(404).json({ error: "No interview request found with this ID." });
      }
  
      const currentStatus = results[0].status;
  
      if (currentStatus === "3" || currentStatus === "4") {
        return res.status(400).json({ error: "This interview has been canceled and cannot be rescheduled." });
      }
  
      // If it's not canceled, allow rescheduling
      const updateSql = "UPDATE student_interviews SET date = ?, time = ? WHERE interview_request_id = ?";
      
      db.query(updateSql, [date, time, interview_request_id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ message: "Interview rescheduled successfully." });
      });
    });
  };


  // 9. View all interview requests
exports.getAllRequests = (req, res) => {
  db.query(`SELECT * FROM interview_requests`, (err, results) => {
    if (err) return res.status(500).send(err);
    res.send(results);
  });
};

// 10. Filter interview requests by status
exports.getRequestsByStatus = (req, res) => {
    const { status } = req.query;

    if (!status) {
        return res.status(400).json({ error: "Status query parameter is required." });
    }

    const sql = "SELECT * FROM interview_requests WHERE status = ?";
    
    db.query(sql, [status], (err, results) => {
        if (err) return res.status(500).json({ error: "Database error.", details: err });
        res.json(results);
    });
};

// 11. Admin provides feedback and rating after interview
exports.addFeedback = (req, res) => {
    const student_interview_id = req.params.id;
    const { student_id, technology_id, student_name, mode, techstack, level, ratings, feedback, interviewquestion } = req.body;
  
    // Check if the interview request exists and is completed
    const checkSql = "SELECT status FROM interview_requests WHERE id = ?";
    
    db.query(checkSql, [student_interview_id], (err, results) => {
      if (err) return res.status(500).json({ error: "Database error.", details: err });
  
      if (results.length === 0) {
        return res.status(404).json({ error: "No interview request found with this ID." });
      }
  
      const interviewStatus = results[0].status;
  
      if (parseInt(interviewStatus) !== 2) {  // Ensure it's checking as an integer
        return res.status(400).json({ error: "Feedback can only be given for completed interview requests." });
      }
  
      // Insert feedback
      const insertSql = `INSERT INTO student_interview_responses 
        (student_interview_id, student_id, technology_id, student_name, mode, techstack, level, ratings, feedback, interviewquestion, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '1')`;
  
      db.query(insertSql, [student_interview_id, student_id, technology_id, student_name, mode, techstack, level, ratings, feedback, interviewquestion], 
        (err, result) => {
          if (err) return res.status(500).json({ error: "Database error.", details: err });
          res.json({ message: "Feedback recorded!", response_id: result.insertId });
        }
      );
    });
  };
