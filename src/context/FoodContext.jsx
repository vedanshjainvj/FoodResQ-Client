import { createContext, useState, useContext, useCallback } from 'react';
import { foodService } from '../services/api';

const FoodContext = createContext();

export const FoodProvider = ({ children }) => {
  const [foods, setFoods] = useState([]);
  const [food, setFood] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});

  // Get all food listings
  const getAllFood = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await foodService.getAllFood(params);
      setFoods(response.data);
      setPagination(response.pagination || {});
      setIsLoading(false);
      return response;
    } catch (err) {
      setError(err.response?.data?.error || 'Error fetching food listings');
      setIsLoading(false);
      throw err;
    }
  }, []);

  // Get single food listing
  const getFood = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await foodService.getFood(id);
      setFood(response.data);
      setIsLoading(false);
      return response;
    } catch (err) {
      setError(err.response?.data?.error || 'Error fetching food listing');
      setIsLoading(false);
      throw err;
    }
  }, []);

  // Create food listing
  const createFood = useCallback(async (foodData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await foodService.createFood(foodData);
      setFoods(prevFoods => [response.data, ...prevFoods]);
      setIsLoading(false);
      return response;
    } catch (err) {
      setError(err.response?.data?.error || 'Error creating food listing');
      setIsLoading(false);
      throw err;
    }
  }, []);

  // Update food listing
  const updateFood = useCallback(async (id, foodData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await foodService.updateFood(id, foodData);
      setFoods(prevFoods => 
        prevFoods.map((item) => (item._id === id ? response.data : item))
      );
      setFood(response.data);
      setIsLoading(false);
      return response;
    } catch (err) {
      setError(err.response?.data?.error || 'Error updating food listing');
      setIsLoading(false);
      throw err;
    }
  }, []);

  // Delete food listing
  const deleteFood = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      await foodService.deleteFood(id);
      setFoods(prevFoods => prevFoods.filter((item) => item._id !== id));
      setIsLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Error deleting food listing');
      setIsLoading(false);
      throw err;
    }
  }, []);

  // Accept food with partial quantity
  const acceptFood = useCallback(async (id, quantity) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await foodService.acceptFood(id, quantity);
      
      // Update foods list
      setFoods(prevFoods => 
        prevFoods.map((item) => (item._id === id ? response.data : item))
      );
      
      // If we're viewing a single food item, update it
      if (food && food._id === id) {
        setFood(response.data);
      }
      
      setIsLoading(false);
      return response;
    } catch (err) {
      console.error('Food context accept error:', err);
      setError(err?.response?.data?.error || 'Error accepting food');
      setIsLoading(false);
      throw err;
    }
  }, [food]);

  // Get food listings by user
  const getFoodByUser = useCallback(async (userId, params = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      // Add userId to params object
      const queryParams = { ...params, createdBy: userId };
      const response = await foodService.getAllFood(queryParams);
      setFoods(response.data);
      setPagination(response.pagination || {});
      setIsLoading(false);
      return response;
    } catch (err) {
      setError(err.response?.data?.error || 'Error fetching your food listings');
      setIsLoading(false);
      throw err;
    }
  }, []);

  return (
    <FoodContext.Provider
      value={{
        foods,
        food,
        isLoading,
        error,
        pagination,
        getAllFood,
        getFood,
        createFood,
        updateFood,
        deleteFood,
        acceptFood,
        getFoodByUser
      }}
    >
      {children}
    </FoodContext.Provider>
  );
};

export const useFood = () => useContext(FoodContext);

export default FoodContext; 