// Shared categories and products data
export const categoriesData = [
  {
    id: 1,
    name: 'Category 1',
    products: ['Product 1', 'Product 2', 'Product 3', 'Product 4']
  },
  {
    id: 2,
    name: 'Category 2',
    products: ['Product 1', 'Product 2', 'Product 3', 'Product 4']
  },
  {
    id: 3,
    name: 'Category 3',
    products: ['Product 1', 'Product 2', 'Product 3', 'Product 4']
  },
  {
    id: 4,
    name: 'Category 4',
    products: ['Product 1', 'Product 2', 'Product 3', 'Product 4']
  },
  {
    id: 5,
    name: 'Category 5',
    products: ['Product 1', 'Product 2', 'Product 3', 'Product 4']
  },
  {
    id: 6,
    name: 'Category 6',
    products: ['Product 1', 'Product 2', 'Product 3', 'Product 4']
  },
  {
    id: 7,
    name: 'Category 7',
    products: ['Product 1', 'Product 2', 'Product 3', 'Product 4']
  },
  {
    id: 8,
    name: 'Category 8',
    products: ['Product 1', 'Product 2', 'Product 3', 'Product 4']
  },
  {
    id: 9,
    name: 'Category 9',
    products: ['Product 1', 'Product 2', 'Product 3', 'Product 4']
  },
  {
    id: 10,
    name: 'Category 10',
    products: ['Product 1', 'Product 2', 'Product 3', 'Product 4']
  }
];

// Generate all products with proper structure
export const allProducts = categoriesData.flatMap((category) =>
  category.products.map((productName, index) => ({
    id: `${category.id}-${index + 1}`,
    name: productName,
    category: category.name,
    categoryId: category.id,
    image: 'https://via.placeholder.com/300x300'
  }))
);
