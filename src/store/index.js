import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/slices/authSlice";
import uiReducer from "@/store/slices/uiSlice";
import roleReducer from "@/store/slices/roleSlice";
import userReducer from "@/store/slices/userSlice";
import productReducer from "@/store/slices/productSlice";
import categoryReducer from "@/store/slices/categorySlice";
import typeReducer from "@/store/slices/typeSlice";
import addonReducer from "@/store/slices/addonSlice";
import variantReducer from "@/store/slices/variantSlice";
import orderReducer from "@/store/slices/orderSlice";
import reportReducer from "@/store/slices/reportSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    roles: roleReducer,
    users: userReducer,
    products: productReducer,
    categories: categoryReducer,
    types: typeReducer,
    addons: addonReducer,
    variants: variantReducer,
    orders: orderReducer,
    reports: reportReducer,
  },
});