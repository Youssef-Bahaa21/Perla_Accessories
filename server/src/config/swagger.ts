import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Perla API',
      version: '1.0.0',
      description: 'API documentation for Perla e-commerce platform',
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production'
          ? process.env.API_URL || 'https://your-production-domain.com'
          : 'http://localhost:3000',
        description: process.env.NODE_ENV === 'production'
          ? 'Production server'
          : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'connect.sid'
        }
      },
      schemas: {
        // User schemas
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'User ID'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email'
            },
            role: {
              type: 'string',
              enum: ['customer', 'admin'],
              description: 'User role'
            }
          }
        },
        CreateUserDTO: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email'
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'User password'
            },
            role: {
              type: 'string',
              enum: ['customer', 'admin'],
              description: 'User role'
            }
          }
        },
        UpdateUserDTO: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email'
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'User password'
            },
            role: {
              type: 'string',
              enum: ['customer', 'admin'],
              description: 'User role'
            }
          }
        },

        // Product schemas
        Product: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Product ID'
            },
            name: {
              type: 'string',
              description: 'Product name'
            },
            description: {
              type: 'string',
              description: 'Product description'
            },
            price: {
              type: 'number',
              description: 'Product price'
            },
            stock: {
              type: 'integer',
              description: 'Product stock quantity'
            },
            category_id: {
              type: 'integer',
              description: 'Category ID'
            },
            is_new: {
              type: 'integer',
              description: 'Flag for new products'
            },
            is_best_seller: {
              type: 'integer',
              description: 'Flag for best seller products'
            },
            is_featured: {
              type: 'integer',
              description: 'Flag for featured products'
            },
            images: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'integer'
                  },
                  product_id: {
                    type: 'integer'
                  },
                  url: {
                    type: 'string'
                  }
                }
              }
            }
          }
        },
        CreateProductDTO: {
          type: 'object',
          required: ['name', 'price', 'stock', 'category_id'],
          properties: {
            name: {
              type: 'string',
              description: 'Product name'
            },
            description: {
              type: 'string',
              description: 'Product description'
            },
            price: {
              type: 'number',
              description: 'Product price'
            },
            stock: {
              type: 'integer',
              description: 'Product stock quantity'
            },
            category_id: {
              type: 'integer',
              description: 'Category ID'
            },
            is_new: {
              type: 'integer',
              description: 'Flag for new products'
            },
            is_best_seller: {
              type: 'integer',
              description: 'Flag for best seller products'
            },
            is_featured: {
              type: 'integer',
              description: 'Flag for featured products'
            }
          }
        },
        UpdateProductDTO: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Product name'
            },
            description: {
              type: 'string',
              description: 'Product description'
            },
            price: {
              type: 'number',
              description: 'Product price'
            },
            stock: {
              type: 'integer',
              description: 'Product stock quantity'
            },
            category_id: {
              type: 'integer',
              description: 'Category ID'
            },
            is_new: {
              type: 'integer',
              description: 'Flag for new products'
            },
            is_best_seller: {
              type: 'integer',
              description: 'Flag for best seller products'
            },
            is_featured: {
              type: 'integer',
              description: 'Flag for featured products'
            }
          }
        },

        // Order schemas
        OrderItemDTO: {
          type: 'object',
          required: ['product_id', 'quantity', 'unit_price'],
          properties: {
            product_id: {
              type: 'integer',
              description: 'ID of the product'
            },
            quantity: {
              type: 'integer',
              description: 'Quantity of the product'
            },
            unit_price: {
              type: 'number',
              description: 'Price per unit'
            }
          }
        },
        CreateOrderDTO: {
          type: 'object',
          required: ['items', 'shipping_name', 'shipping_email', 'shipping_address', 'shipping_city', 'shipping_phone', 'delivery_fee'],
          properties: {
            user_id: {
              type: 'integer',
              nullable: true,
              description: 'ID of the user placing the order (null for guest checkout)'
            },
            items: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/OrderItemDTO'
              }
            },
            coupon_code: {
              type: 'string',
              description: 'Optional coupon code'
            },
            shipping_name: {
              type: 'string',
              description: 'Recipient name'
            },
            shipping_email: {
              type: 'string',
              format: 'email',
              description: 'Recipient email'
            },
            shipping_address: {
              type: 'string',
              description: 'Shipping address'
            },
            shipping_city: {
              type: 'string',
              description: 'Shipping city'
            },
            shipping_phone: {
              type: 'string',
              description: 'Recipient phone number'
            },
            delivery_fee: {
              type: 'number',
              description: 'Delivery fee'
            }
          }
        },
        UpdateOrderDTO: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['pending', 'paid', 'shipped', 'completed', 'cancelled'],
              description: 'Order status'
            },
            delivery_fee: {
              type: 'number',
              description: 'Delivery fee'
            }
          }
        },
        Order: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Order ID'
            },
            user_id: {
              type: 'integer',
              nullable: true,
              description: 'User ID'
            },
            status: {
              type: 'string',
              enum: ['pending', 'paid', 'shipped', 'completed', 'cancelled'],
              description: 'Order status'
            },
            total: {
              type: 'number',
              description: 'Total order amount'
            },
            delivery_fee: {
              type: 'number',
              description: 'Delivery fee'
            },
            shipping_name: {
              type: 'string',
              description: 'Recipient name'
            },
            shipping_email: {
              type: 'string',
              description: 'Recipient email'
            },
            shipping_address: {
              type: 'string',
              description: 'Shipping address'
            },
            shipping_city: {
              type: 'string',
              description: 'Shipping city'
            },
            shipping_phone: {
              type: 'string',
              description: 'Recipient phone number'
            },
            coupon_code: {
              type: 'string',
              nullable: true,
              description: 'Applied coupon code'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  product_id: {
                    type: 'integer'
                  },
                  quantity: {
                    type: 'integer'
                  },
                  unit_price: {
                    type: 'number'
                  },
                  product_name: {
                    type: 'string'
                  },
                  product_image: {
                    type: 'string',
                    nullable: true
                  }
                }
              }
            }
          }
        },

        // Category schemas
        Category: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Category ID'
            },
            name: {
              type: 'string',
              description: 'Category name'
            },
            description: {
              type: 'string',
              description: 'Category description'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        CreateCategoryDTO: {
          type: 'object',
          required: ['name'],
          properties: {
            name: {
              type: 'string',
              description: 'Category name'
            },
            description: {
              type: 'string',
              description: 'Category description'
            }
          }
        },
        UpdateCategoryDTO: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Category name'
            },
            description: {
              type: 'string',
              description: 'Category description'
            }
          }
        },

        // Review schemas
        Review: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Review ID'
            },
            product_id: {
              type: 'integer',
              description: 'Product ID'
            },
            user_id: {
              type: 'integer',
              description: 'User ID'
            },
            rating: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
              description: 'Rating (1-5)'
            },
            comment: {
              type: 'string',
              description: 'Review comment'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        CreateReviewDTO: {
          type: 'object',
          required: ['product_id', 'rating'],
          properties: {
            product_id: {
              type: 'integer',
              description: 'Product ID'
            },
            rating: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
              description: 'Rating (1-5)'
            },
            comment: {
              type: 'string',
              description: 'Review comment'
            }
          }
        },
        UpdateReviewDTO: {
          type: 'object',
          properties: {
            rating: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
              description: 'Rating (1-5)'
            },
            comment: {
              type: 'string',
              description: 'Review comment'
            }
          }
        },

        // Coupon schemas
        Coupon: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Coupon ID'
            },
            code: {
              type: 'string',
              description: 'Coupon code'
            },
            discount_percent: {
              type: 'number',
              description: 'Discount percentage'
            },
            valid_from: {
              type: 'string',
              format: 'date-time',
              description: 'Validity start date'
            },
            valid_to: {
              type: 'string',
              format: 'date-time',
              description: 'Validity end date'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        CreateCouponDTO: {
          type: 'object',
          required: ['code', 'discount_percent', 'valid_from', 'valid_to'],
          properties: {
            code: {
              type: 'string',
              description: 'Coupon code'
            },
            discount_percent: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: 'Discount percentage (0-100)'
            },
            valid_from: {
              type: 'string',
              format: 'date-time',
              description: 'Validity start date'
            },
            valid_to: {
              type: 'string',
              format: 'date-time',
              description: 'Validity end date'
            }
          }
        },
        UpdateCouponDTO: {
          type: 'object',
          properties: {
            code: {
              type: 'string',
              description: 'Coupon code'
            },
            discount_percent: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: 'Discount percentage (0-100)'
            },
            valid_from: {
              type: 'string',
              format: 'date-time',
              description: 'Validity start date'
            },
            valid_to: {
              type: 'string',
              format: 'date-time',
              description: 'Validity end date'
            }
          }
        },

        // Auth schemas
        LoginDTO: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email'
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'User password'
            }
          }
        },
        RegisterDTO: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email'
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'User password'
            }
          }
        },

        // Settings schemas
        Setting: {
          type: 'object',
          properties: {
            key: {
              type: 'string',
              description: 'Setting key'
            },
            value: {
              type: 'string',
              description: 'Setting value'
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts', './src/services/*.ts'],
};

export const specs = swaggerJsdoc(options);
export const serve = swaggerUi.serve;
export const setup = swaggerUi.setup(specs);