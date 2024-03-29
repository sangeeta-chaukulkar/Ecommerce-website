const Product = require('../models/product');
const Cart = require('../models/cart');
const Order = require('../models/order');

const ITEMS_PER_PAGE = 2;

exports.getProducts = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products'
      });
    })
    .catch(err => {
      console.log(err);
    });
};
exports.getCards = (req, res, next) => {
  CartItem.findAll()
    .then(carts => {
        res.json(carts);
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  // Product.findAll({ where: { id: prodId } })
  //   .then(products => {
  //     res.render('shop/product-detail', {
  //       product: products[0],
  //       pageTitle: products[0].title,
  //       path: '/products'
  //     });
  //   })
  //   .catch(err => console.log(err));
  Product.findById(prodId)
    .then(product => {
      res.json(product);
      // res.render('shop/product-detail', {
      //   product: product,
      //   pageTitle: product.title,
      //   path: '/products'
      // });
    })
    .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;
  Product.count()
    .then(numProducts => {
      totalItems = numProducts;
      return Product.find({ offset: ((page - 1) * ITEMS_PER_PAGE) , limit: ITEMS_PER_PAGE });
      // Product.count()
      //   .skip((page - 1) * ITEMS_PER_PAGE)
      //   .limit(ITEMS_PER_PAGE);
    }) 
    .then(products => {
      console.log(products);
      // res.render('shop/index', {
      //   prods: products,
      //   pageTitle: 'Shop',
      //   path: '/',
      res.json({
        currentPage:page,
        prods: products,
        totalProducts: totalItems,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
  // Product.findAll()
  //   .then(products => {
  //     res.render('shop/index', {
  //       prods: products,
  //       pageTitle: 'Shop',
  //       path: '/'
  //     });
  //   })
  //   .catch(err => {
  //     console.log(err);
  //   });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId').execPopulate()
    .then(user => {
         const products = user.cart.items;
          res.render('shop/cart', {
            path: '/cart',
            pageTitle: 'Your Cart',
            products: products
          });
        })
    .catch(err => console.log(err));
    }
    // .catch(err => console.log(err));
  // const page = +req.query.page || 1;
  // let totalItems;
  // CartItem.count()
  //   .then(numCart => {
  //     totalItems = numCart;
  //     return CartItem.findAll({ offset: ((page - 1) * ITEMS_PER_PAGE) , limit: ITEMS_PER_PAGE });
  //   }) 
  //   .then(products => {
  //     console.log(products);
      
  //     res.json({
  //       currentPage:page,
  //       prods: products,
  //       totalProducts: totalItems,
  //       hasNextPage: ITEMS_PER_PAGE * page < totalItems,
  //       hasPreviousPage: page > 1,
  //       nextPage: page + 1,
  //       previousPage: page - 1,
  //       lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
  //     });
  //   })
  //   .catch(err => {
  //     const error = new Error(err);
  //     error.httpStatusCode = 500;
  //     return next(error);
  //   });


exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
  .then(product => {
     return req.user.addToCart(product);
  })
  .then(result => {
    console.log(result);
    res.redirect('/cart')
  })

  // if (!req.body.productId){
  //   return res.status(400).json({success:false,message:'Product id is missing'});
  // }
  // let fetchedCart;
  // let newQuantity = 1;
  // req.user
  //   .getCart()
  //   .then(cart => {
  //     fetchedCart = cart;
  //     return cart.getProducts({ where: { id: prodId } });
  //   })
  //   .then(products => {
  //     let product;
  //     if (products.length > 0) {
  //       product = products[0];
  //     }

  //     if (product) {
  //       const oldQuantity = product.cartItem.quantity;
  //       newQuantity = oldQuantity + 1;
  //       return product;
  //     }
  //     return Product.findByPk(prodId);
  //   })
  //   .then(product => {
  //     return fetchedCart.addProduct(product, {
  //       through: { quantity: newQuantity }
  //     });
  //   })
  //   .then(() => {
  //     res.status(200).json({success:true,message:'Success'});
  //     // res.redirect('/cart');
  //   })
  //   .catch(err => {
  //     res.status(500).json({success:false,message:'Error occured'});
  //     // console.log(err)
  //   });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user.removeFromCart(prodId)
  .then(result => {
    res.redirect('/cart');
  })
  .catch(err => console.log(err))
};


exports.postOrder = (req, res, next) => {
  req.user.populate('cart.items.productId').execPopulate()
    .then(user => {
      const products = user.cart.items.map(i => {
        return {quantity: i.quantity, product : {...i.productId._doc} }
      })
      const order = new Order({
        user : {
          name : req.user.name,
          userId : req.user
        },
        products : products
      })
      return order.save();
    })
  .then(result => {
    return req.user.clearCart();
  })
  .then(results => {
    res.redirect('/orders')
  })
  .catch(err => console.log(err));
}

exports.getOrders = (req, res, next) => {
  Order.find({"user.userId" : req.user._id })
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      });
    })
    .catch(err => console.log(err));
};
