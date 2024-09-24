const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();
const session = require('express-session');
const app = express();



app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
}));



// Sample users array for demonstration
let users = [
    { username: "Srivani", password: "Srivani@123" },
    // Add more users as needed
];

const isValid = (username) => {
    // Check if the username is non-empty and meets other criteria
    const usernameRegex = /^[a-zA-Z0-9]+$/; // Only letters and numbers
    return username && username.length >= 3 && username.length <= 20 && usernameRegex.test(username);
};

const authenticatedUser = (username, password) => {
    
    const user = users.find(user => user.username === username);
    return user && user.password === password; // Returns true if both match
};




// Login route
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    const user = users.find(user => user.username.toLowerCase() === username.trim().toLowerCase());

    if (!user || user.password !== password.trim()) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    const accessToken = jwt.sign({ username: user.username }, "access", { expiresIn: '1h' });
    req.session.authorization = { username: user.username, accessToken };
    
    return res.status(200).json({ message: "Login successful", accessToken });
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const { review } = req.body;

    // Check if user is authenticated
    if (!req.session.authorization) {
        return res.status(403).json({ message: "User not authenticated" });
    }

    const username = req.session.authorization.username;
    const book = books[isbn];

    // Check if the book exists
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Add or update the review
    book.reviews[username] = review;

    return res.status(200).json({ message: "Review added/modified successfully", reviews: book.reviews });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;

    // Check if user is authenticated
    if (!req.session.authorization) {
        return res.status(403).json({ message: "User not authenticated" });
    }

    const username = req.session.authorization.username;
    const book = books[isbn];

    // Check if the book exists
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Check if the user has a review to delete
    if (!book.reviews[username]) {
        return res.status(404).json({ message: "Review not found for this user." });
    }

    // Delete the review
    delete book.reviews[username];

    return res.status(200).json({ message: "Review deleted successfully", reviews: book.reviews });
});
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
