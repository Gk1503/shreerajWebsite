import { API_URL as BASE_URL } from '../config';

const API_URL = `${BASE_URL}/api`;

export const fetchCategories = async () => {
  try {
    const response = await fetch(`${API_URL}/categories?populate=products`);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

export const fetchProducts = async (categoryId = null) => {
  try {
    let url = `${API_URL}/products?populate=category&populate=images&pagination[limit]=100`;
    if (categoryId) {
      url = `${API_URL}/products?filters[category][id][$eq]=${categoryId}&populate=category&populate=images&pagination[limit]=100`;
    }
    const response = await fetch(url);
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const fetchProductById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/products/${id}?populate=category`);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
};

export const fetchCatalogues = async () => {
  try {
    const response = await fetch(`${API_URL}/catalogues`);
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching catalogues:', error);
    return [];
  }
};
