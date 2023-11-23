// Create web server
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
// Create server
const app = express();
// Add body parser
app.use(bodyParser.json());
// Create comments object
const commentsByPostId = {};
// Create function to handle events
const handleEvent = (type, data) => {
  // If event type is comment created
  if (type === 'CommentCreated') {
    // Get post id and comment id from data
    const { id, content, postId, status } = data;
    // Get comments by post id
    const comments = commentsByPostId[postId] || [];
    // Add new comment to comments
    comments.push({ id, content, status });
    // Update comments by post id
    commentsByPostId[postId] = comments;
  }
  // If event type is comment updated
  if (type === 'CommentUpdated') {
    // Get post id and comment id from data
    const { id, content, postId, status } = data;
    // Get comments by post id
    const comments = commentsByPostId[postId];
    // Get comment by id
    const comment = comments.find(comment => {
      return comment.id === id;
    });
    // Update comment content
    comment.content = content;
    // Update comment status
    comment.status = status;
  }
};
// Create route to get comments by post id
app.get('/posts/:id/comments', (req, res) => {
  // Get comments by post id
  const comments = commentsByPostId[req.params.id] || [];
  // Send comments
  res.send(comments);
});
// Create route to handle events
app.post('/events', (req, res) => {
  // Get event type and data from request body
  const { type, data } = req.body;
  // Handle event
  handleEvent(type, data);
  // Send response
  res.send({});
});
// Listen on port 4001
app.listen(4001, async () => {
  console.log('Comments service listening on port 4001');
  // Get all events
  const res = await axios.get('http://event-bus-srv:4005/events');
  // For each event
  for (let event of res.data) {
    // Handle event
    handleEvent(event.type, event.data