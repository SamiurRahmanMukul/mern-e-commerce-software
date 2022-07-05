const Categories = require("../models/catagories.model");
const Products = require("../models/products.model");

// make a controller for creating category
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const image = req.file;

    if (!name || !image) {
      res.status(400).json({
        statusCode: 400,
        message: "Category name and image is required field",
      });
    } else {
      const newName = name.replace(/\s/g, "").toLowerCase();

      // check if category name is exists
      let findCategory = await Categories.findOne({ name: newName });

      if (findCategory) {
        res.status(400).json({
          statusCode: 400,
          message: "Category name already exists",
        });
      } else {
        // create new category
        const category = await Categories.create({
          name: newName,
          image: "/uploads/catagories/" + image.filename,
        });

        res.status(201).json({
          statusCode: 201,
          message: "Category created successfully",
          data: {
            id: category._id,
            name: category.name,
            image: process.env.APP_BASE_URL + category.image,
          },
        });
      }
    }
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: "Category creation failed",
      error: err,
    });
  }
};

// make a controller for getting all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Categories.find();

    if (!categories) {
      res.status(404).json({
        statusCode: 404,
        message: "No categories found",
      });
    } else {
      res.status(200).json({
        statusCode: 200,
        message: "Categories fetched successfully",
        totalCategories: categories.length,
        data: [
          ...categories.map((category) => {
            return {
              id: category._id,
              name: category.name,
              image: process.env.APP_BASE_URL + category.image,
            };
          }),
        ],
      });
    }
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: "Categories fetching failed",
      error: err,
    });
  }
};

// make a controller for updating category
exports.updateCategory = async (req, res) => {
  try {
    const category = await Categories.findById(req.params.id);
    const { name } = req.body;
    const image = req.file;

    if (!category) {
      res.status(404).json({
        statusCode: 404,
        message: "Category not found",
      });
    } else {
      const newName = name.replace(/\s/g, "").toLowerCase();

      if (name && image) {
        // update category
        const updatedCategory = await Categories.findByIdAndUpdate(
          req.params.id,
          {
            name: newName,
            image: "/uploads/catagories/" + image.filename,
          },
          { new: true }
        );

        res.status(200).json({
          statusCode: 200,
          message: "Category updated successfully",
          data: updatedCategory,
        });
      } else if (name) {
        // update category
        const updatedCategory = await Categories.findByIdAndUpdate(
          req.params.id,
          {
            name: newName,
          },
          { new: true }
        );

        res.status(200).json({
          statusCode: 200,
          message: "Category updated successfully",
          data: {
            id: updatedCategory._id,
            name: updatedCategory.name,
            image: process.env.APP_BASE_URL + updatedCategory.image,
          },
        });
      } else {
        res.status(400).json({
          statusCode: 400,
          message: "Category name and image is required field",
        });
      }
    }
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: "Category updating failed.",
      error: err,
    });
  }
};

// make a controller for deleting category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Categories.findById(req.params.id);

    if (!category) {
      res.status(404).json({
        statusCode: 404,
        message: "Category not found",
      });
    } else {
      // delete category
      await Categories.findByIdAndDelete(req.params.id);

      res.status(200).json({
        statusCode: 200,
        message: "Category deleted successfully",
      });
    }
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: "Category deletion failed",
      error: err,
    });
  }
};

// make a controller for categories against filter products
exports.getCategoriesAgainstProducts = async (req, res) => {
  try {
    // check if category name is exists
    let category = await Categories.findOne({ name: { $regex: new RegExp(`^${req.params.name}$`), $options: "i" } });

    if (!category) {
      res.status(404).json({
        statusCode: 404,
        message: "Category not found.",
      });
    } else {
      // get all products against category
      const products = await Products.find({
        category: { $regex: new RegExp(`^${req.params.name}$`), $options: "i" },
      });

      if (products.length === 0) {
        res.status(404).json({
          statusCode: 404,
          message: "No products found.",
        });
      } else {
        res.status(200).json({
          statusCode: 200,
          message: "Products fetched successfully.",
          totalProducts: products.length,
          data: products,
        });
      }
    }
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: "Categories fetching failed.",
      error: err,
    });
  }
};
