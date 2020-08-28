/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
var MongoClient = require("mongodb");
var ObjectId = require("mongodb").ObjectID;
var mongoose = require("mongoose");

module.exports = function(app) {
  const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});
  // Make Mongoose use `findOneAndUpdate()`. Note that this option is `true`
  // by default, you need to set it to false.
  mongoose.set("useFindAndModify", false);
  mongoose.connect(CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  let Schema = mongoose.Schema;
  let IssueSchema = new Schema({
    issue_title: { type: String, required: true },
    issue_text: { type: String, required: true },
    created_by: { type: String, required: true },
    assigned_to: String,
    status_text: String,
    open: { type: Boolean, required: true },
    created_on: { type: Date, required: true },
    updated_on: { type: Date, required: true },
    project: String
  });
  let Issue = mongoose.model("Issue", IssueSchema);

  app
    .route("/api/issues/:project")

    .get(function(req, res) {
      var project = req.params.project;
      let filter = req.query;
      let filteredObject = Object.assign(filter);
      filteredObject.project = project;

      Issue.find(filteredObject, (err, data) => {
        if (!err && data) {
          return res.json(data);
        }
      });
    })

    .post(function(req, res) {
      var project = req.params.project;
      let body = req.body;

      if (!body.issue_title || !body.issue_text || !body.created_by) {
        return res.json("Required fields missing from request");
      }

      let assigned, status;
      if (!body.assigned_to) {
        assigned = "";
      } else {
        assigned = body.assigned_to;
      }

      if (!body.status_text) {
        status = "";
      } else {
        status = body.status_text;
      }

      let newIssue = new Issue({
        issue_title: body.issue_title,
        issue_text: body.issue_text,
        created_by: body.created_by,
        assigned_to: assigned,
        status_text: status,
        open: true,
        created_on: new Date().toUTCString(),
        updated_on: new Date().toUTCString(),
        project: project
      });

      newIssue.save((err, data) => {
        if (!err) {
          return res.json(data);
        }
      });
    })

    .put(function(req, res) {
      var project = req.params.project;
      var body = req.body;

      if (body.length < 2) {
        return res.json("no updated field sent");
      }

      body.updated_on = new Date().toUTCString();
      Issue.findByIdAndUpdate(body._id, body, { new: true }, (err, data) => {
        if (!err && data) {
          return res.json("successfully updated");
        } else if (!data) {
          return res.json("could not update " + body._id);
        }
      });
    })

    .delete(function(req, res) {
      var project = req.params.project;
      var body = req.body;

      if (!body._id) {
        return res.json("id error");
      }

      Issue.findByIdAndRemove(body._id, (err, data) => {
        if (!err && data) {
          res.json("deleted " + data.id);
        } else if (!data) {
          res.json("could not delete " + data.id);
        }
      });
    });
};
