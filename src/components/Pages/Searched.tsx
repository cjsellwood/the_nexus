import { Flex, Text, useToast } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import useAppDispatch from "../../hooks/useAppDispatch";
import useAppSelector from "../../hooks/useAppSelector";
import { getSearch } from "../../store/productThunks";
import PageButtons from "../Navigation/PageButtons";
import Loading from "../Parts/Loading";
import ProductCard from "../Parts/ProductCard";
import SearchBox from "../Parts/SearchBox";
import SortSelect from "../Parts/SortSelect";

const Searched = () => {
  // Get page from url if included
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState<string | null>("");
  const [category_id, setCategory_id] = useState<string | null>("");

  // Set page whenever page in url changes
  useEffect(() => {
    setPage(Number(searchParams.get("page")) || 1);
    setQuery(searchParams.get("q"));
    setCategory_id(searchParams.get("category"));
  }, [searchParams]);

  const dispatch = useAppDispatch();
  const { products, loading, error, count, sort } = useAppSelector(
    (state) => state.product
  );

  // Fetch products for a page
  useEffect(() => {
    if (query) {
      dispatch(
        getSearch({
          q: query,
          page: Number(page),
          sort: sort,
          count: count === "0" ? undefined : count,
          category_id: Number(category_id),
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, page, query, category_id, sort]);

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
      <Flex
        maxWidth="860px"
        width="100%"
        direction="column"
        p={{ base: "0.5", lg: "4" }}
      >
        <SearchBox
          initialCategory={category_id || undefined}
          initialSearch={query || undefined}
        />
        {products.length !== 0 && <SortSelect setPage={setPage} />}
        {!query && (
          <Flex justifyContent="center" p="4">
            <Text fontSize="lg">Search for a product</Text>
          </Flex>
        )}
        {query && !products.length && !error && (
          <Flex justifyContent="center" p="4">
            <Text fontSize="lg">No results</Text>
          </Flex>
        )}
        {query &&
          products.map((product) => {
            return <ProductCard product={product} key={product.product_id} />;
          })}
        <Flex justifyContent="center" m="2">
          {query ? (
            <PageButtons
              page={page}
              count={count}
              urlPrefix={"search"}
              query={query}
              category={category_id ? category_id : undefined}
            />
          ) : null}
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Searched;
