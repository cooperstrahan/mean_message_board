const express = require('express');
const app = express();
const bp = require('body-parser');
const port = 7000;
const path = require('path');
const mongoose = require('mongoose');

app.use(express.static(path.join(__dirname, './static')));
app.use(bp.urlencoded({extended: true}));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
mongoose.connect('mongodb://localhost/message_data', {useNewUrlParser: true});

var CommentSchema = new mongoose.Schema({
    name: {type: String, required: true, minlength: 2},
    comment: {type: String, required: true, minlength: 3}
},{timestamps: true});
mongoose.model('Comment', CommentSchema);
var Comment = mongoose.model('Comment');

var MessageSchema = new mongoose.Schema({
    name: {type: String, required: true, minlength: 2},
    message: {type: String, required: true, minlength: 3},
    comments: [CommentSchema]
},{timestamps: true});
mongoose.model('Message', MessageSchema);
var Message = mongoose.model('Message');

app.get('/', function(req, res) {
    var mess = Message.find({}, function(err, messages) {
        if(err){
            console.log("We couldn't retrieve your message board!");
            res.render(404);
        } else {
            console.log("We have retrieved your message board");
            console.log(messages[1].comments[0].comment);
            res.render('index', {messages: messages});
        }
    });
    
});

app.post('/message', function(req, res) {
    var message = new Message({name: req.body.name, message: req.body.message});
    message.save(function(err) {
        if(err) {
            console.log('There was a problem adding your message');
            console.log(err);
        } else {
            console.log('Your message was posted!');
            res.redirect('/');
        }
    })
});

app.post('/comment/:id', function(req, res) {
    var comment = new Comment({name: req.body.name, comment: req.body.comment});
    comment.save(function(err) {
        if(err) {
            console.log('There was a problem adding your comment');
            console.log(err);
        } else {
            console.log('Your comment was posted!');
            Message.findOneAndUpdate({_id: req.params.id}, {$push: {comments: comment}}, function(err, data) {
                if(err){
                    console.log("There was an error adding your comment to the array")
                    console.log(err);
                } else {
                    console.log("The comment was added to the array")
                    console.log(data);
                }
            });
        }
    })
    res.redirect('/');
});

app.listen(port, function() {});