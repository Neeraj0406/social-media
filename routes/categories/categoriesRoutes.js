const express = require("express")
const isLogin = require("../../middlewares/isLogin")
const { createCategory, getAllCategory, getCategoryById, deleteCategory, updateCategory } = require("../../controllers/categories/categoryCtrl")
const categoriesRouter = express.Router()

//create category
categoriesRouter.post("/create", isLogin, createCategory)


//get all category 
categoriesRouter.get("/getall", isLogin, getAllCategory)

//get category by id 
categoriesRouter.get("/get-single-category/:id", isLogin, getCategoryById)

//delete category 
categoriesRouter.delete("/delete-category/:id", isLogin, deleteCategory)

// update category
categoriesRouter.post("/update-category/:id", isLogin, updateCategory)

module.exports = categoriesRouter