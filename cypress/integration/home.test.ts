import {
  allProducts,
  category1Products,
  randomProducts,
  searchCategory,
  searchProducts,
  searchProducts2,
} from "../../src/tests/helpers";

describe("Visit product pages", () => {
  beforeEach(() => {
    cy.viewport(360, 640);
    cy.intercept("http://localhost:5000/products/random", randomProducts);
    cy.intercept("http://localhost:5000/products/29", randomProducts[0]);
    cy.intercept("http://localhost:5000/products/23", randomProducts[0]);
    cy.intercept("http://localhost:5000/products?page=1", allProducts);
    cy.intercept("http://localhost:5000/products?page=2&count=50", {
      products: searchCategory.products,
      count: "50",
    });
    cy.intercept(
      "http://localhost:5000/products/category/1?page=1",
      category1Products
    );
    cy.intercept(
      "http://localhost:5000/products/category/7?page=1",
      category1Products
    );
    cy.intercept(
      "http://localhost:5000/products/search?q=the&page=1",
      searchProducts
    );
    cy.intercept(
      "http://localhost:5000/products/search?q=the&page=2&count=38",
      searchProducts2
    );
    cy.intercept(
      "http://localhost:5000/products/search?q=the&page=1&category=1",
      searchCategory
    );
  });
  it("Navigates to home screen and uses navigation menu", () => {
    cy.visit("/");

    cy.contains("Market");

    cy.get("[aria-label='open menu']").click();

    cy.contains("Login");
    cy.contains("Register");

    cy.contains("All Products").click();
    cy.url().should("include", "products");
    cy.contains("All Products").should("not.exist");

    cy.get("[aria-label='open menu']").click();
    cy.contains("a", "Sports").click();
    cy.url().should("include", "sports");
    cy.contains("a", "All Products").should("not.exist");

    cy.get("[aria-label='open menu']").click();
    cy.contains("Register").click();
    cy.url().should("include", "register");
    cy.contains("a", "All Products").should("not.exist");

    cy.contains("Market").click();
    cy.url().should("eq", "http://localhost:3000/#/");
  });

  it("Displays the 20 random listings and navigates to more listings", () => {
    cy.visit("/");

    cy.contains("Ergonomic Frozen Towels");

    cy.get("img").should("exist");

    cy.contains("Fantastic Frozen Bike");

    cy.contains("See more").click();

    cy.url().should("eq", "http://localhost:3000/#/products");

    cy.visit("/");

    cy.contains("Ergonomic Frozen Towels").click();

    cy.url().should("eq", "http://localhost:3000/#/products/29");
  });

  it("Displays a single product", () => {
    cy.visit("/#/products/29");

    cy.contains("Ergonomic Frozen Towels");
    cy.contains("Cars");
    cy.contains("Funkville");

    cy.get("img").should("have.length", 3);

    cy.get("img").first().should("be.visible");
    cy.get("img").last().should("not.be.visible");
  });

  it("Shows all products page and navigate to next page", () => {
    cy.visit("/#/products");

    cy.contains("Refined Cotton Ball");
    cy.get("img").should("have.length", 20);

    cy.contains("Refined Cotton Ball").click();

    cy.url().should("eq", "http://localhost:3000/#/products/23");

    cy.go("back");

    cy.get("button[aria-label='Page 2']").click();

    // Not in all products page 1
    cy.contains("Licensed Concrete Fish");
    cy.window().its("scrollY").should("eq", 0);
    cy.url().should("eq", "http://localhost:3000/#/products?page=2");

    cy.go("back");

    cy.url().should("eq", "http://localhost:3000/#/products");
    cy.contains("Refined Cotton Ball");

    cy.go("forward");

    // Displays without page in url
    cy.contains("Licensed Concrete Fish");
    cy.contains("<").click();
    cy.url().should("eq", "http://localhost:3000/#/products");
  });

  it("Navigates to a categories page and displays products", () => {
    cy.visit("/");

    cy.get("[aria-label='open menu']").click();

    cy.contains("a", "Cars").click();

    cy.url().should("eq", "http://localhost:3000/#/cars");

    cy.contains("Handcrafted Wooden Fish");
  });

  it("Navigates to search results and displays them", () => {
    // cy.visit("/#/search?q=the");
    cy.visit("/");
    cy.get("input").type("the");
    cy.get("[aria-label='submit search']").click();

    cy.url().should("eq", "http://localhost:3000/#/search?q=the");

    cy.contains("Sleek Plastic Chips");

    // Go to second page
    cy.contains(">").click();

    cy.contains("Licensed Granite Cheese");
    cy.url().should("eq", "http://localhost:3000/#/search?page=2&q=the");

    cy.visit("/#/search");
    cy.contains("Search for a product");

    cy.get("input").clear().type("the");
    cy.get("select").select("Cars");
    cy.get("[aria-label='submit search']").click();
    cy.url().should("eq", "http://localhost:3000/#/search?q=the&category=1");

    // Text not in previous search page
    cy.contains("Awesome Concrete Hat");
  });

  it.only("Can create a new product", () => {
    cy.intercept("POST", "http://localhost:5000/products/new", { id: 99 });

    cy.visit("/#/new");
    cy.contains("New Product");

    cy.get("#title").type("New Product");
    cy.get("#title").should("have.value", "New Product");

    cy.get("select").select("Cars");
    cy.get("select").should("have.value", "1");

    cy.get("#description").type(
      "This is a new product. \nIt is a great product. \nIt is in great condition"
    );
    cy.get("#description").should(
      "have.value",
      "This is a new product. \nIt is a great product. \nIt is in great condition"
    );

    cy.get("#price").type("499");
    cy.get("#price").should("have.value", "499");

    cy.get("#location").type("Melbourne");
    cy.get("#location").should("have.value", "Melbourne");

    cy.contains("Submit").click();
    cy.url().should("eq", "http://localhost:3000/#/products/99");
  });
});
