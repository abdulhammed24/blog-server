import asyncHandler from "express-async-handler";
import Category from "../../model/Category/Category.js";

//create a category
export const createCategory = asyncHandler(async (req, res) => {
  try {
    const category = await Category.create({
      user: req.user._id,
      title: req.body.title,
    });
    res.json(category);
  } catch (error) {
    res.json(error);
  }
});

//fetch all categories
export const fetchCategories = asyncHandler(async (req, res) => {
  try {
    const categories = await Category.find({})
      .populate("user")
      .sort("-createdAt");
    res.json(categories);
  } catch (error) {
    res.json(error);
  }
});

//fetch a single category
export const fetchCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const category = await Category.findById(id)
      .populate("user")
      .sort("-createdAt");
    res.json(category);
  } catch (error) {
    res.json(error);
  }
});

//update
export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const category = await Category.findByIdAndUpdate(
      id,
      {
        title: req?.body?.title,
      },
      {
        new: true,
        runValidators: true,
      }
    );
    res.json(category);
  } catch (error) {
    res.json(error);
  }
});

//delete category
export const deleteCateory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const category = await Category.findByIdAndDelete(id);

    res.json(category);
  } catch (error) {
    res.json(error);
  }
});
