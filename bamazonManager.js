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

connection.connect(function (err) {
    if (err) throw err;
    inquirer
        .prompt({
            name: "menu",
            type: "rawlist",
            message: "Please select an option.",
            choices: ["Products", "Inventory", "Restock", "Add New Item to Products"]
        })
        .then(function (answer) {
            var selection = answer.menu
            switch (selection) {
                case "Products":
                    viewItems()
                    break;

                case "Inventory":
                    lowInventory()
                    break;

                case "Restock":
                    restock()
                    break;

                case "Add New Item to Products":
                    newItems()
                    break;
            }
        })
});

function viewItems() {
    var showItems = connection.query("Select * FROM products", function (err, results) {
        console.log("\nItems for sale.");
        for (var i = 0; i < results.length; i++) {
            console.log("\nID: " + results[i].item_id)
            console.log("Product Name: " + results[i].product_name)
            console.log("Department: " + results[i].department_name)
            console.log("Price: $" + results[i].price)
            console.log("Quantity: " + results[i].stock_quantity)
        }
    });
}

function lowInventory() {
    var inventory = connection.query("Select * FROM products WHERE stock_quantity < 5", function (err, results) {
        console.log("\nThe following items have less than five left in stock: ")
        for (var i = 0; i < results.length; i++)
            console.log("   " + results[i].product_name);
    })
}

function restock() {
    var stock = connection.query("Select * FROM products", function (err, results) {
        if (err) throw err;
        console.log("All items")
        for (var i = 0; i < results.length; i++) {
            console.log("\nID: " + results[i].item_id)
            console.log("Product Name: " + results[i].product_name)
            console.log("Department: " + results[i].department_name)
            console.log("Price: $" + results[i].price)
            console.log("Quantity: " + results[i].stock_quantity)
        }
        inquirer
            .prompt([
                {
                    name: "id",
                    type: "input",
                    message: "Which item would you like to restock?"
                },
                {
                    name: "quantity",
                    type: "input",
                    message: "How many would you like to add?"
                },
            ])
            .then(function (answer) {
                var chosenItem;
                for (var i = 0; i < results.length; i++) {
                    if (results[i].item_id == answer.id) {
                        chosenItem = results[i];
                    }
                }
                connection.query(
                    "UPDATE products SET ? WHERE ?",
                    [
                        {
                            stock_quantity: chosenItem.stock_quantity++ + parseInt(answer.quantity)
                        },
                        {
                            item_id: answer.id
                        },
                    ],
                    function (error, result) {
                        if (error) throw err;
                        console.log("The stock quantity of " + chosenItem.product_name + " has been increased by " + answer.quantity + ".")
                    }
                )
            })
    })
}

function newItems() {
    inquirer
        .prompt([
            {
                name: "department",
                type: "input",
                message: "Which department would you like to add an item?"
            },
            {
                name: "item",
                type: "input",
                message: "Which item would you like to add to the department?"
            },
            {
                name: "price",
                type: "input",
                message: "What will the price of this item be?",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            },
            {
                name: "quantity",
                type: "input",
                message: "How many of this item would you like to add to the inventory?"
            },
        ])
        .then(function (answer) {
            connection.query(
                "INSERT INTO products SET ?",
                {
                    product_name: answer.item,
                    department_name: answer.department,
                    price: answer.price,
                    stock_quantity: answer.quantity,
                },
                function (err) {
                    if (err) throw err;
                    console.log("Your item was successfully added to the inventory.")
                }
            );
        });
}

