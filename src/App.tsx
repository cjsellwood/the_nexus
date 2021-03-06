import { Box, Grid, useColorModeValue } from "@chakra-ui/react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/Pages/Home";
import Login from "./components/Pages/Login";
import Register from "./components/Pages/Register";
import Navbar from "./components/Navigation/NavBar";
import Product from "./components/Pages/Product";
import ScrollToTop from "./components/Navigation/ScrollToTop";
import Products from "./components/Pages/Products";
import Category from "./components/Pages/Category";
import Searched from "./components/Pages/Searched";
import NewProduct from "./components/Pages/NewProduct";
import EditProduct from "./components/Pages/EditProduct";
import { useEffect } from "react";
import useAppDispatch from "./hooks/useAppDispatch";
import { loadStoredUser } from "./store/authSlice";
import RedirectLogin from "./components/Navigation/RedirectLogin";
import UserProducts from "./components/Pages/UserProducts";
import useAppSelector from "./hooks/useAppSelector";
import "./App.css";
import NavDesktop from "./components/Navigation/NavDesktop";

const App = () => {
  const backgroundColor = useColorModeValue(
    "mainBackground",
    "mainBackgroundDark"
  );
  const dispatch = useAppDispatch();
  const { storageLoaded } = useAppSelector((state) => state.auth);

  // Load a previously logged in user
  useEffect(() => {
    dispatch(loadStoredUser());
  }, [dispatch]);
  if (!storageLoaded) {
    return null;
  }
  return (
    <Box minW="100%" minH="100vh" backgroundColor={backgroundColor}>
      <ScrollToTop />
      <Navbar />
      <Grid
        paddingTop="56px"
        gridTemplateColumns={{
          base: "1fr",
          lg: "320px 1fr",
          "2xl": "320px 1fr 320px",
        }}
      >
        <Box display={{ base: "none", lg: "block" }}>
          <NavDesktop />
        </Box>
        <Box>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/products" element={<Products />} />
            <Route path="/search" element={<Searched />} />
            <Route
              path="/new"
              element={
                <RedirectLogin>
                  <NewProduct />
                </RedirectLogin>
              }
            />
            <Route
              path="/products/yours"
              element={
                <RedirectLogin>
                  <UserProducts />
                </RedirectLogin>
              }
            />
            <Route
              path="/products/:id/edit"
              element={
                <RedirectLogin>
                  <EditProduct />
                </RedirectLogin>
              }
            />
            <Route path="/products/:id" element={<Product />} />
            <Route path="/:category" element={<Category />} />
          </Routes>
        </Box>
      </Grid>
    </Box>
  );
};

export default App;
