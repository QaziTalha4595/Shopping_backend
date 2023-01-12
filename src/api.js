
const router = require('express').Router();
const mysql = require('mysql');
const cors = require('cors');
const secretkey = "secretkey";
const jwt = require("jsonwebtoken");
const verification = require('./verification');

const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const conn = mysql.createConnection({
    host: "localhost",
    database: "books-db",
    user: "root",
    password: ""
});

conn.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});

router.use(cors());

//===============================================================================================================================//
// Books API's

router.get('/books', verification, function (req, res) {

    conn.query('SELECT * FROM book', function (err, result, fields) {
        if (err) throw err;
        res.send(result)
    })
});

router.get('/books/:id', verification, function (req, res) {

    conn.query('SELECT * FROM book WHERE book_id = ?', [req.params.id], function (err, result, fields) {
        if (!err)
            res.send(result);
        else
            console.log(err);
    })

});

router.post('/books', verification, function (req, res) {
    var {
        title,
        author,
        price,
        user_id,
        Img_name,
        Img_url
    } = req.body;

    console.log(title);

    var VALUES = [
        title, author, price, user_id, Img_name, Img_url
    ];

        var sql = "INSERT INTO book( title, author, price, user_id, Img_name,Img_url) VALUES (?,?,?,?.?,?)";

        
    

    conn.query(sql, [VALUES], function (err, result) {
        if (err) throw err;
        console.log("Number of the record inserted: " + result.affectedRows);
    });

    return res.json({ success: true, message: "You have Inserted the data" });
});

router.put('/books', verification, function (req, res) {

    const {
        title,
        author,
        price,
        user_id,
        Img_name,
        Img_url,
        book_id
    } = req.body;

    var sql = `UPDATE book
    SET title = ?,
    author = ?,
    price = ?,
    user_id = ?,
    Img_name = ?,
    Img_url =? 
    WHERE book_id = ?`;

    var data = [title,
        author,
        price,
        user_id,
        Img_name,
        Img_url,
        book_id
    ];

    conn.query(sql, data, (error, results, fields) => {
        if (error) {
            return console.error(error.message);
        }
    });

    res.send("OKk");
});

router.delete('/Delete/:id', verification, function (req, res) {

    conn.query('DELETE FROM book WHERE book_id = ?', [req.params.id], function (err, result, fields) {
        if (err) {
            console.log(err);
        }
        else {
            return res.json({ success: true, message: "Book Deleted" });
        }
    });

});

//================================================================================================================================//
// carts PAI's

router.get('/fetch_cart', verification, function (req, res) {



    var query = "SELECT * FROM carts INNER JOIN book ON carts.product_id = book_id WHERE carts.user_id = ?";
    var { user_id } = req.query;

    console.log(user_id);
    conn.query(query + " ORDER BY cart_id DESC;",[user_id ], function (err, result, fields) {
        if (err) {
            throw err;
        }
        if (result.length == 0) {
            return res.json({ success: false, message: "No Result Found" });
        }
        return res.json({ success: true, data: result });
    })
});



router.post('/add_to_cart', verification, function (req, res) {

    const {
        product_id,
        user_id
    } = req.body;


    var VALUES = [
        product_id,
        user_id
    ]

    var check = "Select * From carts Where product_id = ? and user_id = ? Limit 1";
    conn.query(check, VALUES, function (err, data) {
        if (err) throw err;
        if (data.length > 0) {

            var update = "UPDATE carts SET quantity = ? WHERE carts.cart_id = ?";

            conn.query(update, [data[0].quantity + 1, data[0].id], function (err, result) {
                console.log(data[0].quantity);
                if (err) return res.json({ success: false, message: "Opps Something went wrong", err: err });;
                console.log("=============================================================")
                return res.json({ success: true, message: "Cart Quantity Updated" });
            });
        }
        else {
            var sql = "INSERT INTO carts( product_id, user_id) VALUES(?,?)";
            conn.query(sql, VALUES, function (err, result) {
                if (err) throw err;
                console.log(result)
                console.log("Number of the record inserted: " + result.affectedRows);
            });
            return res.json({ success: true, message: "You have Inserted the data" });
        }
    });


});



// router.put('/update_cart', verification, function (req, res) {

//     const {
//         product_id,
//         user_id,
//         cart_id
//     } = req.body;

//     var sql = `UPDATE carts
//     SET product_id = ?,
//     user_id = ?
//     WHERE cart_id = ?`;

//     var data = [product_id,
//         user_id,
//         cart_id
//     ];

//     conn.query(sql, data, (error, results, fields) => {
//         if (error) {
//             return console.error(error.message);
//         }
//         // console.log('Rows affected:', results.affectedRows);
//     });

//     res.send("OKk");
// });



router.get('/delete_cart', verification, function (req, res) {
    if (req.query.cart_id == "") {
        return res.json({ success: false, message: "Please select the cart item" });
    }

    conn.query('DELETE FROM carts WHERE cart_id = ?', [req.query.cart_id], function (err, result, fields) {
        if (err) {
            console.log(err);
            return res.json({ success: false, message: "Something wemt wrong", error: err });
        }
        else {
            return res.json({ success: true, message: "Cart Item Deleted" + req.query.cart_id });
        }
    });

});

//=========================================================================================================================//
// logins API's

router.post('/login', function (req, res) {

    var { user_email, user_password } = req.body;

    user_email = user_email || "";
    user_password = user_password || "";

    if (!user_email || !emailRegex.test(user_email)) {
        return res.json({ success: false, message: "Please provide User Email with the Correct Format" })
    }
    if (user_password < 10) {
        return res.json({ success: false, message: "Please provide User Password" })
    }
    try {
        conn.query("SELECT * FROM users WHERE user_email = ? AND user_password = ?", [user_email, user_password], (err, data) => {
            if (data.length !== 0) {
                let token = jwt.sign({ user: data.user_id }, secretkey);
                data[0].token = token;
                console.log(data)
                return res.json({ success: true, message: "Login Successfull", data: data[0] })
            } else {
                return res.json({ success: false, message: "Invalid Credentials" })
            }
        })
    } catch (error) {
        return res.json({ success: false, message: "Something wemt wrong", error: err });
    }
});

router.post('/registration', function (req, res) {
    try {
        const { user_email, user_password, user_name } = req.body

        if (!(user_email && user_name && user_password)) {
            return res.json({ success: false, message: "All input is required" });
        }



        var VALUES = [
            user_name,
            user_email,
            user_password
        ]

        var sql = "INSERT INTO users( user_name, user_email, user_password) VALUES(?,?,?)";
        conn.query(sql, VALUES, function (err, result) {
            if (err) throw err;
            console.log(result)
            console.log("Number of login the record inserted: " + result.affectedRows);
            return res.json({ success: true, message: "You have Inserted the data" });
        });

    } catch (error) {
        return res.json({ success: false, message: "something went wrong", error: error });

    }
});

//=============================================================================================================//
//Testing bulk enrtry

router.post('/books1', verification, function (req, res) {

    var {
        title,
        author,
        price,
        user_id,
        Img_name,
        Img_url
    } = req.body;
var value = [];
req.body.map((e)=>{
value.push( Object.values(e))
})




        var sql = "INSERT INTO book( title, author, price, user_id, Img_name,Img_url) VALUES ?";

        conn.query(sql, [value], function (err, result) {
            if (err) throw err;
            console.log("Number of the record inserted: " + result.affectedRows);
        });
 
    return res.json({ success: true, message: "You have Inserted the data" });
});


module.exports = router;
