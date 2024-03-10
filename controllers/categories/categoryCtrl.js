const Category = require("../../model/Category/Category");
const User = require("../../model/User/User");
const appError = require("../../utils/appError");


const createCategory = async (req, res, next) => {
    try {
        const { title } = req.body
        const newCategory = await Category.create({ title, user: req.user })
        res.json({ status: "success", data: newCategory })
    } catch (error) {
        next(appError(error.message))
    }
}

// get all category 
const getAllCategory = async (req, res, next) => {
    try {
        const allCategory = await Category.find()
        res.json({
            success: "true",
            data: allCategory
        })
    } catch (error) {
        next(appError(error.message))
    }
}

//update category
const updateCategory = async (req, res, next) => {
    try {
        const upatedCategory = await Category.findByIdAndUpdate(req.params.id, {
            $set: req.body
        }, { new: true })
        res.json({
            success: "true",
            data: upatedCategory
        })
    } catch (error) {
        next(appError(error.message))
    }
}
//get Categroy by id 
const getCategoryById = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id)
        res.json({
            success: "true",
            data: category
        })
    } catch (error) {
        return next(appError(error.message))
    }
}


// delete category
const deleteCategory = async (req, res, next) => {
    try {
        await Category.deleteOne({ _id: req.params.id })
        res.json({
            success: "true",
            msg: "Category has been deleted"
        })
    } catch (error) {
        return next(appError(error.message))
    }
}


module.exports = { createCategory, getAllCategory, getCategoryById, deleteCategory, updateCategory }