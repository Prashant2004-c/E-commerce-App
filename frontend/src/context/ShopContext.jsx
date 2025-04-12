import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {

  const currency = '$';
  const delivery_fee = 10;
  const backend_url = import.meta.env.VITE_BACKEND_URL;
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState('');
  const navigate = useNavigate();

  const addToCart = async (itemId, size) => {
    if(!size) {
      toast.error('Select Product Size');
      return;
    }
    let cartData = structuredClone(cartItems);

    if(cartData[itemId]) {
      if(cartData[itemId][size]) {
        cartData[itemId][size] += 1;
        toast.success('Item Added to Cart!');
      }
      else {
        cartData[itemId][size] = 1;
        toast.success('Item Added to Cart!');
      }
    }
    else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
      toast.success('Item Added to Cart!');
    }
    setCartItems(cartData);

    // db things
    if(token) {
      try {
        const response = await axios.post(backend_url + '/api/cart/add', {itemId, size}, {headers: {token} });
        console.log(response.data);
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    }
  }

  const getCartCount = () => {
    let totalCount = 0;
    for(const items in cartItems) {
      for(const item in cartItems[items]) {
        try {
          if(cartItems[items][item] > 0) {
            totalCount += cartItems[items][item];
          }
        } catch (error) {
          console.log(error);
          toast.error(error.message);
        }
      }
    }
    return totalCount;
  }

  const updateQuantity = async (itemId, size, quantity) => {
    let cartData = structuredClone(cartItems);
    cartData[itemId][size] = quantity;
    setCartItems(cartData);

    if(token) {
      try {
        await axios.post(backend_url + '/api/cart/update', {itemId, size, quantity}, {headers: {token} });
      } catch (error) {
        
      }
    }
  }

  const getCartAmount = () => {
    let totalAmount = 0;
    for(const items in cartItems) {
      let itemInfo = products.find((product) => product._id === items);
      for(const item in cartItems[items]) {
        try {
          if(cartItems[items][item] > 0) {
            totalAmount += itemInfo.price * cartItems[items][item];
          }
        } catch (error) {
          
        }
      }
    }
    return totalAmount;
  }

  const getProductsData = async () => {
    try {
      const response = await axios.get(backend_url + '/api/product/list');
      if(response.data.success) {
        setProducts(response.data.products);
      } else {
        toast.error(response.data.message);
      }
      
    } catch (error) {
      console.log(error);
      toast.error(error.message);
      
    }
  }

  const getUserCart = async (token) => {
    try {
      const response = await axios.post(backend_url + '/api/cart/get', {}, {headers: {token}});
      if(response.data.success) {
        setCartItems(response.data.cartData);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  }

  useEffect(() => {
    getProductsData();
  }, []);

  useEffect(() => {
    if(!token && localStorage.getItem('token')) {
      setToken(localStorage.getItem('token'));
      getUserCart(localStorage.getItem('token'));
    }
  }, []);

  const value = {
    products,
    currency,
    delivery_fee,
    search, setSearch,
    showSearch, setShowSearch,
    cartItems, setCartItems,
    addToCart,
    getCartCount,
    updateQuantity,
    getCartAmount,
    navigate,
    backend_url,
    token, setToken,
  }

  return (
    <ShopContext.Provider value={value}>
    {props.children}
    </ShopContext.Provider>
  )
}

export default ShopContextProvider;