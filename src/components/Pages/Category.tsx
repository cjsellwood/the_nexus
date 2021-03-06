import { Flex, useToast } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { categories } from "../../categories";
import useAppDispatch from "../../hooks/useAppDispatch";
import useAppSelector from "../../hooks/useAppSelector";
import { getCategory } from "../../store/productThunks";
import PageButtons from "../Navigation/PageButtons";
import Loading from "../Parts/Loading";
import ProductCard from "../Parts/ProductCard";
import SearchBox from "../Parts/SearchBox";
import SortSelect from "../Parts/SortSelect";

const Category = () => {
  // Get page from url if included
  const [searchParams] = useSearchParams();

  // Set page whenever page in url changes
  useEffect(() => {
    setPage(Number(searchParams.get("page")) || 1);
  }, [searchParams]);

  const dispatch = useAppDispatch();
  const [page, setPage] = useState(1);

  // Get category_id from url
  const { category } = useParams();
  const category_id =
    1 +
    categories.findIndex(
      (el) => el.toLowerCase().split(" ").join("") === category
    );

  const { products, loading, error, count, sort } = useAppSelector(
    (state) => state.product
  );

  // Fetch products for a page
  useEffect(() => {
    dispatch(
      getCategory({
        category_id,
        page: Number(page),
        sort: sort,
        count: count === "0" ? undefined : count,
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, page, category_id, sort]);

  // Show any errors
  const toast = useToast();
  const toastId = "error-toast";
  useEffect(() => {
    if (error && !toast.isActive(toastId)) {
      toast({
        id: toastId,
        title: error,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  }, [error, toast]);

  // Show loading spinner
  if (loading) {
    return <Loading />;
  }

  return (
    <Flex justifyContent="center">
      <Flex maxWidth="860px" direction="column" p={{ base: "0.5", lg: "4" }}>
        <SearchBox initialCategory={category_id.toString()} />
        {products.length !== 0 && <SortSelect setPage={setPage} />}
        {products.map((product) => {
          return <ProductCard product={product} key={product.product_id} />;
        })}
        <Flex justifyContent="center" m="2">
          <PageButtons
            page={page}
            count={count}
            urlPrefix={`products/category/${category_id}`}
          />
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Category;
