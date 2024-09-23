const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios=require('axios');



public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
  
    // Check if username and password are provided
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
  
    
    const existingUser = users.find((user) => user.username === username);
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }
  
    // Register new user
    const newUser = { username, password };
    users.push(newUser);
  
    return res.status(201).json({ message: "User registered successfully!" });
  });
    

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  return res.status(300).json({books});
});

public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const bookDetails = books.find(book => book.isbn === isbn);
    
    if (!bookDetails) {
        return res.status(404).json({ message: "Book not found" });
    }
    return res.status(200).json(bookDetails);
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    const booksByAuthor = books.filter(book => book.author.toLowerCase() === author.toLowerCase());
    
    if (booksByAuthor.length === 0) {
        return res.status(404).json({ message: "No books found by this author" });
    }
    return res.status(200).json(booksByAuthor);
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    const booksByTitle = books.filter(book => book.title.toLowerCase().includes(title.toLowerCase()));
    
    if (booksByTitle.length === 0) {
        return res.status(404).json({ message: "No books found with this title" });
    }
    return res.status(200).json(booksByTitle);
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const bookDetails = books.find(book => book.isbn === isbn);
    
    if (!bookDetails || !bookDetails.reviews) {
        return res.status(404).json({ message: "No reviews found for this book" });
    }
    return res.status(200).json(bookDetails.reviews);
});
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;

    try {
        // Simulate an API call to fetch books by author
        const response = await axios.get(`http://localhost:5000/books?author=${author}`);
        const booksByAuthor = response.data;

        if (booksByAuthor.length === 0) {
            return res.status(404).json({ message: "No books found by this author" });
        }
        return res.status(200).json(booksByAuthor);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error fetching books by author" });
    }
});



module.exports.general = public_users;
