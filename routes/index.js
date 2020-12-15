/* Executed on the server side. */
var express = require("express");
var router = express.Router();
var passport = require("passport");
var Account = require("../models/account");
var formidable = require('formidable');
var fs = require('fs');

function escapeRegex(text) {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

var monk = require("monk");
var db = monk("localhost:27017/car");

// Landing Page
router.get("/", function (req, res, next) {
	res.render("landing");
});

// "Add New Car" form
router.get("/cars/new", function (req, res) {
	res.render("new", { user: req.user });
});

// Add the new car
router.post("/cars", function (req, res) {
	var collection = db.get("cars");
	var form = new formidable.IncomingForm();
	form.parse(req, function (err, fields, files) {
		// var oldpath = files.file.path;
		// var newpath = 'public/images/' + files.file.name;
		// fs.rename(oldpath, newpath, function (err) {
		// 	if (err) throw err;
		// });
		collection.insert(
			{
				name: fields.name,
				image: files.file.name,
				type: fields.type,
				price: parseFloat(parseFloat(fields.price).toFixed(2)),
				description: fields.description,
				inventory: parseInt(fields.inventory),
				isDeleted: false,
			},
			function (err, car) {
				if (err) throw err;
				req.flash('success','Successfully Add a new Car!');
				res.redirect("/cars");
			}
		);
	});
});

// Details of one car
router.get("/cars/:id", function (req, res) {
	var collection = db.get("cars");
	collection.findOne({ _id: req.params.id }, function (err, cars) {
		if (err) throw err;
		res.render("show", { cars: cars, user: req.user });
	});
});

// To register
router.get("/register", function (req, res) {
	if (req.query.username && req.xhr) {
		console.log(req.query.username);
		Account.findOne({ username: req.query.username }, function (err, user) {
			if (err) {
				console.log(err);
			}
			var message;
			if (user) {
				message = "user exists";
			} else {
				message = "user doesn't exist";
			}
			res.json({ message: message });
		});
	} else {
		res.render("register", { user: req.user });
	}
});

// Finish register
router.post("/register", function (req, res) {
	var newAccount = new Account({ username: req.body.username });
	if (req.body.username === "admin") {
		newAccount.isAdmin = true;
	}
	Account.register(newAccount, req.body.password, function (err, account) {
		if (err) {
			console.log(err.message);
			return res.redirect("/register");
		}

		passport.authenticate("local")(req, res, function () {

			res.redirect("/cars");
		});
	});
});

// To login
router.get("/login", function (req, res) {
	res.render("login", { user: req.user });
});

// Finish login
router.post(
	"/login",
	passport.authenticate("local", {
		successRedirect: "/cars",
		failureRedirect: "/login",
	}),
	function (req, res) { }
);

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect("/login");
}

// To logout
router.get("/logout", function (req, res) {
	req.logout();
	res.redirect("/cars");
});





router.get("/cars", async (req, res, next) => {
	var page = parseInt(req.query.page) || 1;
	var collection = db.get("cars");
	var result = [];
	var length = 0;
	if (req.query.search) {
		if (req.query.type != "all") {
			const regex = new RegExp(escapeRegex(req.query.search), "gi");
			var type = new RegExp(escapeRegex(req.query.type), "gi");
			if (req.user && req.user.isAdmin) {
				collection.find({ name: regex, type: type }, function (err, cars) {
					if (err) {
						console.log(err);
					} else {
						   result = []
						   length = cars.length;
					        for (var i = 8 * (page - 1); i < 8 * page; i++) {
						        if (i < length) {
							        result.push(cars[i]);
						        }
					        }
					       var maxPage = Math.ceil(length / 8);
					       res.render("index", {
						       cars: result,
						       currentPage: page,
						       numOfPages: maxPage,
						       numOfResults: cars.length,
						       user: req.user,
					         });
					}
				});
			} else {

				collection.find(
					{ name: regex, type: type, isDeleted: false },
					function (err, cars) {
						if (err) {
							console.log(err);
						} else {
						length = cars.length;
					     for (var i = 8 * (page - 1); i < 8 * page; i++) {
						     if (i < length) {
							     result.push(cars[i]);
						     }
					     }
					    var maxPage = Math.ceil(length / 8);
					    res.render("index", {
						    cars: result,
						    currentPage: page,
						    numOfPages: maxPage,
						    numOfResults: cars.length,
						    user: req.user,
					      });
						}
					}
				);
			}
		} else if (req.query.type == "all") {
			// console.log("hellothere");
			const regex = new RegExp(escapeRegex(req.query.search), "gi");
			var type = new RegExp(escapeRegex(req.query.type), "gi");
			if (req.user && req.user.isAdmin) {
				collection.find({ name: regex }, function (err, cars) {
					if (err) {
						console.log(err);
					} else {

						   result = []
						   length = cars.length;
					        for (var i = 8 * (page - 1); i < 8 * page; i++) {
						        if (i < length) {
							        result.push(cars[i]);
						        }
					        }
					       var maxPage = Math.ceil(length / 8);
					       res.render("index", {
						       cars: result,
						       currentPage: page,
						       numOfPages: maxPage,
						       numOfResults: cars.length,
						       user: req.user,
					         });
					}
				});
			} else {
				collection.find({ name: regex, isDeleted: false }, function (
					err,
					cars
				) {
					if (err) {
						console.log(err);
					} else {
                         length = cars.length;
					     for (var i = 8 * (page - 1); i < 8 * page; i++) {
						     if (i < length) {
							     result.push(cars[i]);
						     }
					     }
					    var maxPage = Math.ceil(length / 8);
					    res.render("index", {
						    cars: result,
						    currentPage: page,
						    numOfPages: maxPage,
						    numOfResults: cars.length,
						    user: req.user,
					      });
					}
				});
			}
		}
	} else if (req.query.search == "" && req.query.type != "all") {

		var type = new RegExp(escapeRegex(req.query.type), "gi");
		if (req.user && req.user.isAdmin) {
			collection.find({ type: type }, function (err, cars) {
				if (err) {
					console.log(err);
				} else {
						   result = []
						   length = cars.length;
					        for (var i = 8 * (page - 1); i < 8 * page; i++) {
						        if (i < length) {
							        result.push(cars[i]);
						        }
					        }
					       var maxPage = Math.ceil(length / 8);
					       res.render("index", {
						       cars: result,
						       currentPage: page,
						       numOfPages: maxPage,
						       numOfResults: cars.length,
						       user: req.user,
					         });
				}
			});
		} else {
			collection.find({ type: type, isDeleted: false }, function (err, cars) {
				if (err) {
					console.log(err);
				} else {
					    result = []
						length = cars.length;
					     for (var i = 8 * (page - 1); i < 8 * page; i++) {
						     if (i < length) {
							     result.push(cars[i]);
						     }
					     }
					    var maxPage = Math.ceil(length / 8);
					    res.render("index", {
						    cars: result,
						    currentPage: page,
						    numOfPages: maxPage,
						    numOfResults: cars.length,
						    user: req.user,
					      });
					// res.status(200).json(cars);
				}
			});
		}
	} else {
		if (req.xhr) {
			if (req.user && req.user.isAdmin) {
				collection.find({}, function (err, cars) {
					if (err) throw err;
						   result = []
						   length = cars.length;
					        for (var i = 8 * (page - 1); i < 8 * page; i++) {
						        if (i < length) {
							        result.push(cars[i]);
						        }
					        }
					       var maxPage = Math.ceil(length / 8);
					       res.render("index", {
						       cars: result,
						       currentPage: page,
						       numOfPages: maxPage,
						       numOfResults: cars.length,
						       user: req.user,
					         });
				});
			} else {

				collection.find({ isDeleted: false }, function (err, cars) {
					if (err) throw err;
					result = []
						 length = cars.length;
					     for (var i = 8 * (page - 1); i < 8 * page; i++) {
						     if (i < length) {
							     result.push(cars[i]);
						     }
					     }
					    var maxPage = Math.ceil(length / 8);
					    res.render("index", {
						    cars: result,
						    currentPage: page,
						    numOfPages: maxPage,
						    numOfResults: cars.length,
						    user: req.user,
					      });
					// res.status(200).json(cars);
				});
			}
		} else {

			if (req.user && req.user.isAdmin) {
				collection.find({}, function (err, cars) {
					if (err) throw err;
					length = cars.length;
					for (var i = 8 * (page - 1); i < 8 * page; i++) {
						if (i < length) {
							result.push(cars[i]);
						}
					}
					var maxPage = Math.ceil(length / 8);
					res.render("index", {
						cars: result,
						currentPage: page,
						numOfPages: maxPage,
						numOfResults: cars.length,
						user: req.user,
					});
				});
			} else {
				collection.find({ isDeleted: false }, function (err, cars) {
					if (err) throw err;
					length = cars.length;
					for (var i = 8 * (page - 1); i < 8 * page; i++) {
						if (i < length) {
							result.push(cars[i]);
						}
					}
					var maxPage = Math.ceil(length / 8);
					res.render("index", {
						cars: result,
						currentPage: page,
						numOfPages: maxPage,
						numOfResults: cars.length,
						user: req.user,
					});
				});
			}
		}
	}
});

// To edit a car
router.get("/cars/:id/edit", function (req, res) {
	var collection = db.get("cars");
	collection.findOne({ _id: req.params.id }, function (err, cars) {
		if (err) throw err;
		res.render("edit", { cars: cars, user: req.user });
	});
});

// Update the page
router.put("/cars/:id", function (req, res) {
	var collection = db.get("cars");
	var form = new formidable.IncomingForm();
	var url = "/cars/" + req.params.id;

	form.parse(req, function (err, fields, files) {
		var oldpath = files.file.path;
		// console.log(fields.file.name);
		var image = "";
		var newpath = 'public/images/' + files.file.name;
		// fs.rename(oldpath, newpath, function (err) {
		// 	if (err) throw err;
		// });
		collection.findOne({ _id: req.params.id },function(err,cars){
			if (err) throw err;
			console.log("files.file.name:" + files.file.name);
			if(files.file.name === ""){image = cars.image}else{
				image = files.file.name;
			}
			collection.findOneAndUpdate({ _id: req.params.id }, {
			    $set: {
				    name: fields.name,
				    image: image,
				    type: fields.type,
				    price: parseFloat(parseFloat(fields.price).toFixed(2)),
				    description: fields.description,
				    inventory: parseInt(fields.inventory),
			    },
		    }).then((updatedDoc) => { });
		});


		res.redirect(url);
	});
});

// Delete the car
router.post("/cars/:id/delete", function (req, res) {
	var collection = db.get("cars");
	var url = "/cars/" + req.params.id;
	collection
		.findOneAndUpdate(
			{ _id: req.params.id },
			{
				$set: {
					isDeleted: true,
				},
			}
		)
		.then((updatedDoc) => { });
	res.redirect(url);
});

// Recover the car
router.post("/cars/:id/recover", function (req, res) {
	var collection = db.get("cars");
	var url = "/cars/" + req.params.id;
	collection
		.findOneAndUpdate(
			{ _id: req.params.id },
			{
				$set: {
					isDeleted: false,
				},
			}
		)
		.then((updatedDoc) => { });
	res.redirect(url);
});

/******************************************************************************************************
 * Wishlist
 * ":id" is the user's id
 */
// Add to wishlist
router.post("/:id/wishlist", function (req, res) {
	var cars_collection = db.get("cars");
	var wl_collection = db.get("wishlist");

	cars_collection.findOne({ _id: req.body.like }, function (err, car) {
		if (err) throw err;
		var url = "/cars/" + req.body.like;

		wl_collection.findOne(
			{
				userid: req.user._id,
				carObject: car,
			},
			function (err, result) {
				if (err) throw err;
				if (result) {
					console.log("Duplicate in wishlist.");
					res.redirect(url);
				} else {
					wl_collection.insert(
						{
							carObject: car,
							carid: car._id,
							carname: car.name,
							userid: req.user._id,
							username: req.user.username,
						},
						function (err, wishlist) {
							if (err) throw err;
							res.redirect(url);
						}
					);
				}
			}
		);
	});
});

// Delete from wishlist
router.delete("/:id/wishlist", function (req, res) {
	var wl_collection = db.get("wishlist");
	var url = "/" + req.params.id + "/wishlist";
	wl_collection.remove(
		{ username: req.body.wlusername, carname: req.body.wlcarname },
		function (err, wl) {
			if (err) throw err;
			res.redirect(url);
		}
	);
});

// Go to wishlist
router.get("/:id/wishlist", function (req, res) {
	var wl_collection = db.get("wishlist");

	Account.findById(req.params.id, function (err, foundUser) {
		if (err) {
			res.redirect("/login");
		}
		wl_collection.find({ username: foundUser.username }, function (err, wls) {
			if (err) {
				res.redirect("/cars");
			}
			res.render("wishlist", { user: foundUser, wishlists: wls });
		});
	});
});
/**
 * Wishlist: the end
 ******************************************************************************************************/

/******************************************************************************************************
 * Shopping cart
 * ":id" is the user's id
 */
// Go to shopping cart
router.get("/:id/cart", function (req, res) {
	var cart_collection = db.get("cart");

	Account.findById(req.params.id, function (err, foundUser) {
		if (err) {
			res.redirect("/login");
		}
		// console.log("wowowowoow" + foundUser.username);
		cart_collection.find({ username: foundUser.username }, function (
			err,
			items
		) {
			if (err) {
				res.redirect("/cars");
			}

			res.render("cart", { user: foundUser, items: items });
		});
	});
});

// Add to shopping cart
router.post("/:id/cart", function (req, res) {
	var cars_collection = db.get("cars");
	var cart_collection = db.get("cart");

	cars_collection.findOne({ _id: req.body.buy }, function (err, car) {
		if (err) throw err;
		var url = "/cars/" + car._id;

		cart_collection.findOne(
			{ userid: req.user._id, carObject: car },
			function (err, result) {
				if (err) throw err;
				if (result) {
					var inventory = parseInt(car.inventory);
					var originalcarcount = parseInt(result.carcount);
					var add = parseInt(req.body.quantity);
					cart_collection
						.findOneAndUpdate(
							{ userid: req.user._id, carObject: car },
							{
								$set: {
									carcount: originalcarcount + add,
									isEnough: originalcarcount + add <= inventory,
								},
							}
						)
						.then((updateDoc) => { });
					res.redirect(url);
				} else {
					var inventory = parseInt(car.inventory);
					var carcount = parseInt(req.body.quantity);
					cart_collection.insert(
						{
							carObject: car,
							carid: car._id,
							carname: car.name,
							carcount: carcount,
							userid: req.user._id,
							username: req.user.username,
							isEnough: carcount <= inventory,
						},
						function (err, oneCartItem) {
							if (err) throw err;
						}
					);
					res.redirect(url);
				}
			}
		);
	});
});

// Delete from the cart.
router.post("/:id/cart/remove", function (req, res) {
	var cart_collection = db.get("cart");
	var cars_collection = db.get("cars");
	var url = "/" + req.params.id + "/cart";
	var deduct = parseInt(req.body.removeQuantity);
	var query = { carname: req.body.itemname, username: req.body.username };

	cars_collection.findOne({ name: req.body.itemname }, function (err, car) {
		cart_collection.findOne(query, function (err, result) {
			if (err) throw err;

			var inventory = parseInt(car.inventory);
			var originalcarcount = parseInt(result.carcount);

			if (originalcarcount > deduct) {
				cart_collection
					.findOneAndUpdate(query, {
						$set: {
							carcount: originalcarcount - deduct,
							isEnough: originalcarcount - deduct <= inventory,
						},
					})
					.then((updateDoc) => { });
				res.redirect(url);
			} else {
				cart_collection.remove(query, function (err, ans) {
					if (err) throw err;
				});
				res.redirect(url);
			}
		});
	});
});

// Delete all from shopping cart
router.post("/:id/cart/removeAll", function (req, res) {
	var cart_collection = db.get("cart");
	var url = "/" + req.params.id + "/cart";
	var query = { carname: req.body.itemname, username: req.body.username };

	cart_collection.remove(query, function (err, ans) {
		if (err) throw err;
		res.redirect(url);
	});
});

// Add more from the cart.
router.post("/:id/cart/add", function (req, res) {
	var cart_collection = db.get("cart");
	var cars_collection = db.get("cars");
	var url = "/" + req.params.id + "/cart";
	var add = parseInt(req.body.addQuantity);
	var query = { carname: req.body.itemname, username: req.body.username };

	cars_collection.findOne({ name: req.body.itemname }, function (err, car) {
		cart_collection.findOne(query, function (err, result) {
			if (err) throw err;

			var inventory = parseInt(car.inventory);
			var originalcarcount = parseInt(result.carcount);

			cart_collection
				.findOneAndUpdate(query, {
					$set: {
						carcount: originalcarcount + add,
						isEnough: originalcarcount + add <= inventory,
					},
				})
				.then((updateDoc) => { });
			res.redirect(url);
		});
	});
});
/**
 * Shopping cart: the end
 ******************************************************************************************************/

/******************************************************************************************************
 * Checkout page
 * ":id" is the user's id
 */
// Confirm page before checking out.
router.get("/:id/checkout", function (req, res) {
	var car_collection = db.get("cars");
	var cart_collection = db.get("cart");
	var total = 0.0;
	var canCheckout = true;

	Account.findById(req.params.id, function (err, foundUser) {
		if (err) {
			res.redirect("/login");
		}

		cart_collection.find({ username: foundUser.username }, function (
			err,
			items
		) {
			if (err) {
				res.redirect("/cars");
			}

			for (var i = 0; i < items.length; i++) {
				total +=
					parseFloat(items[i].carcount) *
					parseFloat(items[i].carObject.price);
				if (!items[i].isEnough) {
					canCheckout = false;
				}
			}

			res.render("checkout", {
				user: foundUser,
				items: items,
				total: total.toFixed(2),
				canCheckout: canCheckout,
			});
		});
	});
});

// Success.
router.post("/:id/success", function (req, res) {
	var cart_collection = db.get("cart");
	var order_collection = db.get("orders");
	var cars_collection = db.get("cars");

	var timeStamp = new Date().toLocaleString();
	var orderId = new Date().getTime().toFixed(0).toString();

	Account.findById(req.params.id, function (err, foundUser) {
		if (err) {
			res.redirect("/login");
		}

		var oneOrder = {
			cars: [],
			userid: req.params.id,
			username: foundUser.username,
			orderid: orderId,
			ordertime: timeStamp,
			totalPrice: req.body.totalPrice,
		};

		cart_collection.find({ username: foundUser.username }, function (
			err,
			items
		) {
			if (err) throw err;

			// Removing coresponding items from inventory
			for (var i = 0; i < items.length; i++) {
				cars_collection
					.findOneAndUpdate(
						{ name: items[i].carname },
						{
							$inc: {
								inventory: -1,
							},
						}
					)
					.then((updateDoc) => { });
			}

			// Making the order object to put in the database
			for (var i = 0; i < items.length; i++) {
				var onecar = {
					carObject: items[i].carObject,
					carid: items[i].carid,
					carname: items[i].carname,
					carcount: items[i].carcount,
				};
				oneOrder.cars.push(onecar);
			}

			order_collection.insert(oneOrder, function (err, records) {
				if (err) throw err;
			});
		});

		cart_collection.remove({ username: foundUser.username }, function (
			err,
			items
		) {
			if (err) {
				throw err;
			}
			res.render("success", { user: foundUser });
		});
	});
});
/**
 * Checkout page: the end
 ******************************************************************************************************/

/******************************************************************************************************
 * Profile page
 * ":id" is the user's id
 */
// Get order history.
router.get("/:id/profile", function (req, res) {
	var order_collection = db.get("orders");
	var sortedOrder = [];

	Account.findById(req.params.id, function (err, foundUser) {
		if (err) {
			res.redirect("/login");
		}

		if (foundUser.isAdmin) {
			order_collection.find({}, function (err, orders) {
				if (err) throw err;
				for (var i = orders.length - 1; i >= 0; i--) {
					sortedOrder.push(orders[i]);
				}
				res.render("profile", { user: foundUser, orders: sortedOrder });
			});
		} else {
			order_collection.find({ username: foundUser.username }, function (
				err,
				orders
			) {
				if (err) throw err;
				for (var i = orders.length - 1; i >= 0; i--) {
					sortedOrder.push(orders[i]);
				}
				res.render("profile", { user: foundUser, orders: sortedOrder });
			});
		}
	});
});

// Get order detail.
router.get("/:id/profile/:orderId", function (req, res) {
	var order_collection = db.get("orders");

	Account.findById(req.params.id, function (err, foundUser) {
		if (err) {
			res.redirect("/login");
		}

		order_collection.findOne({ _id: req.params.orderId }, function (
			err,
			oneOrder
		) {
			res.render("orderdetail", {
				user: foundUser,
				order: oneOrder,
				items: oneOrder.cars,
			});
		});
	});
});
/**
 * Profile page: the end
 ******************************************************************************************************/
module.exports = router;
