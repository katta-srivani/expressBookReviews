const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const axios= require('axios');

const app = express();

app.use(express.json());

app.use(session({
    secret: "fingerprint_customer",
    resave: false,           
    saveUninitialized: true, // Save uninitialized sessions
    cookie: { secure: false } // Set to true if using HTTPS
}));


app.use("/customer/auth/*", function auth(req,res,next){
    if (req.session.authorization) {
        let token = req.session.authorization['accessToken']; // Access Token
        
        // Verify JWT token for user authentication
        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                req.user = user; // Set authenticated user data on the request object
                next(); // Proceed to the next middleware
            } else {
                return res.status(403).json({ message: "User not authenticated" }); // Return error if token verification fails
            }
        });
        
        // Return error if no access token is found in the session
    } else {
        return res.status(403).json({ message: "User not logged in" });
    }
});
 
const PORT =5000;
async function getBooksAsync() {
    try {
        const response = await axios.get('http://localhost:5000');
        console.log('Books fetched successfully (Async/Await):', response.data);
    } catch (error) {
        console.error('Error fetching books (Async/Await):', error);
    }
}
function getBooksPromise() {
    axios.get('http://localhost:5000')
        .then(response => {
            console.log('Books fetched successfully (Promise):', response.data);
        })
        .catch(error => {
            console.error('Error fetching books (Promise):', error);
        });
}

app.get('/books/:isbn', async (req, res) => {
    const isbn = req.params.isbn;

    try {
        // Simulate fetching book details based on ISBN from booksdb.js
        const bookDetails = books.find(book => book.isbn === isbn);
        if (!bookDetails) {
            return res.status(404).json({ message: 'Book not found' });
        }
        return res.status(200).json(bookDetails);
    } catch (error) {
        console.error('Error fetching book details (Async/Await):', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

getBooksAsync();
getBooksPromise();
app.get('/books/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
 try {
        const bookDetails = books.find(book => book.isbn === isbn);
        if (!bookDetails) {
            return res.status(404).json({ message: 'Book not found' });
        }
        return res.status(300).json(bookDetails);
    } catch (error) {
        console.error('Error fetching book details (Async/Await):', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.get('/books/:isbn', (req, res) => {
    const isbn = req.params.isbn;
const bookDetails = books.find(book => book.isbn === isbn);
    new Promise((resolve, reject) => {
        if (!bookDetails) {
            return reject(new Error('Book not found'));
        }
        resolve(bookDetails);
    })
    .then(book => res.status(300).json(book))
    .catch(err => {
        console.error('Error fetching book details (Promise):', err);
        return res.status(404).json({ message: 'Book not found' });
    });
});
app.get('/title/:title', async function (req, res) {
    const title = req.params.title;

    try {
        
        const response = await axios.get(`http://localhost:5000/books?title=${title}`);
        const booksByTitle = response.data;

        if (booksByTitle.length === 0) {
            return res.status(404).json({ message: "No books found with this title" });
        }
        return res.status(300).json(booksByTitle);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error fetching books by title" });
    }
});


app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
