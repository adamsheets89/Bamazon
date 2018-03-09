var mysql = require("mysql");
var inquirer = require("inquirer");
// create the connection information for the sql database
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "",
    database: "bamazon"
});

// connect to the mysql server and sql database
connection.connect(function (err) {
    if (err) throw err;
    var showItems = connection.query("Select * FROM products", function (err, results) {
        console.log("\nItems for Sale")
        for (var i = 0; i < results.length; i++) {
            console.log("\nID: " + results[i].item_id)
            console.log(results[i].product_name)
            console.log("Price: $" + results[i].price)
        }
        inquirer
            .prompt([
                {
                    name: "id",
                    type: "input",
                    message: "What is the ID of the product you would like to buy?"
                },
                {
                    name: "quantity",
                    type: "input",
                    message: "How many units of the product would you like?"
                },
            ])
            .then(function (answer) {
                for (var i = 0; i < results.length; i++) {
                    if (results[i].item_id == answer.id) {
                        chosenItem = results[i];
                    }
                }
                if (chosenItem.stock_quantity < answer.quantity) {
                    console.log("Insufficient Quantity!")
                }
                else {
                    connection.query(
                        "UPDATE products SET ? WHERE ?",
                        [
                            {
                                stock_quantity: chosenItem.stock_quantity - answer.quantity
                            },
                            {
                                item_id: answer.id
                            },
                        ],
                        function (error, result) {
                            if (error) throw err;
                            var totalCost = chosenItem.price * answer.quantity;
                            console.log("Your total amount due is $" + totalCost + ".00.")
                        }
                    )
                }
            })
    });
});

