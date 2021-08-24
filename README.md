# CS6314_CarRental
## Description   
Our project is a car rental application. This web application allows customers to rent car 
online. There are various kind of cars for customer to choose. Different types: Couple, 
Van, SUV, Convertible, Pickup Truck, Sedan. Different brands: BMW, Ford, MINI, 
Toyota, Honda, Porsche, Nissan, Chevrolet, Audi... You can see all kind of cars on 
home page. You can use filter and search function to find what you want. You can see 
detail information about cars by clicking on the car button or car picture. To make a 
order, first, you need register a account and log in. Then you are able to use ‘wishlist’ 
and ‘shopping cart’ function. You can also edit information or delete orders in your cart 
and wishlist. Once an order is made, the price will be calculated and the customer can 
review the order history in the profile. The administrator can use ‘admin’ account to log 
in and is able to add, edit, remove, and recover all information about cars.   

## Frameworks & Tools
Sublime Text: the text editor for code, markup and prose
MongoDB: the database engine we use to store the data.
Express.js: the server-side framework for building web applications, similar to 
ASP.NET MVC or Rails.
Node.js: the JavaScript runtime environment
Bootstrap and JQuery

## Database Design
We use MongoDB to Create database and table:
We use port ‘27017’ to connect the database. In the beginning, we create a database 
named ‘car’ and one collection named ‘cars’. We insert all information about cars in 
‘cars’ table, including 35 different types of cars. User info in accounts table, shopping 
cart in cart table, wishlist info in wishlist table and also previous older info in orders 
table. 
For the cars table, the data includes id, name, price, type, inventory, image, description 
and isDeleted.
If you want to see the detailed data, you can find them in ‘cars.json’ file in our project 
folder.
The data format is as below:
```
{
 "_id" : ObjectId(""),
 "name" : "",
 "price" : ,
 "type" : "",
 "inventory" : ,
 "image" : "",
 "description" : "",
 "isDeleted" : 
}
```
For the accounts table, the data format is as below:
```
{
 "_id" : ObjectId(""),
 " isAdmin" : boolean,
 " username" : “”,
 " salt" : ,
 " hash" :, }
 ```
For the cart table, the data format is as below:
```
{
 "carObject" : {},
 "carid" : ObjectId(""),
 "carname" : "",
 "carcount" : ,
 "userid" : ObjectId(""),
 "username" : "",
 "isEnough" : boolean} }
 ```
For the order table, the data format is as below:
```
{
 "_id" : ObjectId("5fcc3c6c77f39b37c52542f4"),
 "cars" : [ 
 {
 "carObject" : {},
 "carid" : ObjectId(""),
 "carname" : "",
 "carcount" : 
 }
 ],
 "userid" : "",
 "username" : "",
 "orderid" : "",
 "ordertime" : "",
 "totalPrice" : ""
}
```
For the wishlist table, the data format is as below:
{
 "_id" : ObjectId(""),
 "carObject" : {},
 "carid" : ObjectId(""),
 "carname" : "",
 "userid" : ObjectId(""),
 "username" : ""
}
```
## Run our application:
Use these commands:
```
$ cd CarRental
$ npm install
$ nodemon
```
After typing these commands in the terminal, you will be able to use our application at
localhost:3000.
Register a customer account and Login
To use wishlist and shopping cart function, you need to register a new account. Then 
use this account to login. Otherwise, you cannot make a order. After logging in, you 
can see your profile, wishlist and shopping cart at upper-right corner. On shopping 
cart page, you can make an order.
Register an administrator account and Login
To login as an administrator account, you need to register a account. The username of 
this account must be ‘admin’. About the password, you can enter whatever you want. 
After logging in as an administrator account, you are able to add, edit, remove, and 
recover all information about cars.
