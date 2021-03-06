import {
  allProducts,
  category1Products,
  messagedProduct,
  messagedProductAuthor,
  product23,
  product29,
  randomProducts,
  searchCategory,
  searchProducts,
  searchProducts2,
} from "../../src/tests/helpers";
import "cypress-file-upload";

describe("Visit product pages", () => {
  beforeEach(() => {
    cy.viewport(360, 640);
    cy.intercept("http://10.0.0.6:5000/products/random", randomProducts).as(
      "random"
    );
    cy.intercept("GET", "http://10.0.0.6:5000/products/29", product29).as(
      "get29"
    );
    cy.intercept("http://10.0.0.6:5000/products/23", product23);
    cy.intercept("http://10.0.0.6:5000/products?page=1&sort=no", allProducts);
    cy.intercept("http://10.0.0.6:5000/products?page=2&sort=no&count=50", {
      products: searchCategory.products,
      count: "50",
    });
    cy.intercept(
      "http://10.0.0.6:5000/products/category/1?page=1&sort=no",
      category1Products
    );
    cy.intercept(
      "http://10.0.0.6:5000/products/category/7?page=1&sort=no",
      category1Products
    );
    cy.intercept(
      "http://10.0.0.6:5000/products/search?q=the&page=1&sort=no",
      searchProducts
    );
    cy.intercept(
      "http://10.0.0.6:5000/products/search?q=the&page=2&sort=no&count=38",
      searchProducts2
    );
    cy.intercept(
      "http://10.0.0.6:5000/products/search?q=the&page=1&sort=no&category=1",
      searchCategory
    );
    cy.intercept("http://10.0.0.6:5000/auth/login", {
      email: "cypress@email.com",
      username: "cypress",
      userId: randomProducts[0].user_id,
      token: "2f4dfd",
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    }).as("login");
  });
  it("Navigates to home screen and uses navigation menu", () => {
    cy.visit("/");

    cy.contains("THE NEXUS");

    cy.get("[aria-label='open menu']").click();

    cy.get("[data-testid=drawer]").contains("Login");
    cy.get("[data-testid=drawer]").contains("Register");

    cy.get("[data-testid=drawer]").contains("All Products").click();
    cy.url().should("include", "products");
    cy.get("[data-testid=drawer]").contains("All Products").should("not.exist");

    cy.get("[aria-label='open menu']").click();
    cy.get("[data-testid=drawer]").contains("a", "Sports").click();
    cy.url().should("include", "sports");
    cy.get("[data-testid=drawer]")
      .contains("a", "All Products")
      .should("not.exist");

    cy.get("[aria-label='open menu']").click();
    cy.get("[data-testid=drawer]").contains("Register").click();
    cy.url().should("include", "register");
    cy.get("[data-testid=drawer]")
      .contains("a", "All Products")
      .should("not.exist");

    cy.contains("THE NEXUS").click();
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

    cy.get("[data-testid=drawer]").contains("a", "Cars and Vehicles").click();

    cy.url().should("eq", "http://localhost:3000/#/carsandvehicles");

    cy.contains("Handcrafted Wooden Fish");
  });

  it("Navigates to search results and displays them", () => {
    // cy.visit("/#/search?q=the");
    cy.visit("/");
    cy.wait("@random");
    cy.contains("Ergonomic Frozen Towels");

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
    cy.get("select").first().select("Cars and Vehicles");
    cy.get("[aria-label='submit search']").click();
    cy.url().should("eq", "http://localhost:3000/#/search?q=the&category=1");

    // Text not in previous search page
    cy.contains("Awesome Concrete Hat");
  });

  it("Can create a new product", () => {
    cy.intercept("POST", "http://10.0.0.6:5000/products/new", {
      product_id: 29,
    });
    cy.intercept("http://10.0.0.6:5000/products/29", product29);

    cy.visit("/#/new");

    // Login
    cy.get("#email").type("test@email.com");
    cy.get("#password").type("password");
    cy.contains("Submit").click();

    cy.contains("NEW PRODUCT");

    cy.get("#title").type("New Product");
    cy.get("#title").should("have.value", "New Product");

    cy.get("select").select("Cars and Vehicles");
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

    cy.get("img").should("not.exist");
    cy.get("input[type='file']").attachFile("test.jpg");
    cy.get("img").should("exist");

    cy.contains("Submit").click();
    cy.url().should("eq", "http://localhost:3000/#/products/29");
    cy.contains("Ergonomic Frozen Towels");
  });

  it("Can delete a product", () => {
    cy.intercept("DELETE", "http://10.0.0.6:5000/products/29", {
      message: "Deleted",
    });

    cy.visit("/#/login");
    cy.get("#email").type("test@email.com");
    cy.get("#password").type("password");
    cy.contains("Submit").click();
    cy.wait("@login");

    cy.visit("/#/products/29");
    cy.wait("@get29");
    cy.contains("Ergonomic Frozen Towels");
    cy.get("button[aria-label='delete product']").click();

    cy.url().should("eq", "http://localhost:3000/#/products/yours");
    cy.intercept("http://10.0.0.6:5000/products/29", {
      statusCode: 404,
      body: {
        error: "Product not found",
      },
    });

    cy.visit("/#/products/29");
    cy.contains("Product not found");
  });

  it("Can update a product", () => {
    // Login
    cy.visit("#/login");
    cy.get("#email").type("test@email.com");
    cy.get("#password").type("password");
    cy.contains("Submit").click();
    cy.wait("@login");

    cy.visit("/#/products/29");
    cy.contains("Ergonomic Frozen Towels");
    cy.contains("Edit").click();

    cy.url().should("eq", "http://localhost:3000/#/products/29/edit");

    cy.get("#title").clear();
    cy.get("#title").type("Updated Product");
    cy.get("#title").should("have.value", "Updated Product");

    cy.get("select").select("Food and Drink");
    cy.get("select").should("have.value", "5");

    cy.get("#description").clear();
    cy.get("#description").type("updated description");
    cy.get("#description").should("have.value", "updated description");

    cy.get("#price").clear();
    cy.get("#price").type("999");
    cy.get("#price").should("have.value", "999");

    cy.get("#location").clear();
    cy.get("#location").type("Sydney");
    cy.get("#location").should("have.value", "Sydney");

    cy.get("img")
      .first()
      .should("have.attr", "src")
      .should("eq", "https://placeimg.com/500/500/tech");
    cy.get("input[type='file']").attachFile("test.jpg");
    cy.get("img").first().should("have.attr", "src").should("contain", "blob");

    cy.intercept("PUT", "http://10.0.0.6:5000/products/29", {
      product_id: 29,
    });
    cy.intercept("http://10.0.0.6:5000/products/29", {
      product_id: 29,
      user_id: 5,
      title: "Updated Product",
      description: "updated description",
      price: 999,
      images: [
        "https://placeimg.com/500/500/tech",
        "https://placeimg.com/500/500/arch",
        "https://placeimg.com/500/500/animals",
      ],
      listed: "2022-02-28T13:00:00.000Z",
      location: "Sydney",
      category: "Food and Drink",
    });

    cy.contains("Submit").click();
    cy.url().should("eq", "http://localhost:3000/#/products/29");
    cy.contains("Updated Product");
  });

  it("Displays messages about a product to a logged in user", () => {
    cy.intercept("GET", "http://10.0.0.6:5000/products/29", messagedProduct);
    cy.intercept("POST", "http://10.0.0.6:5000/products/29", {
      message: "Success",
    });
    cy.intercept("http://10.0.0.6:5000/auth/login", {
      email: "cypress@email.com",
      username: "cypress",
      userId: 2,
      token: "2f4dfd",
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    });

    cy.visit("/#/products/29");

    cy.contains("Login to send a message").click();
    cy.get("#email").type("test@email.com");
    cy.get("#password").type("password");
    cy.contains("Submit").click();

    cy.get("#message").type("Lorem Ipsum");

    cy.contains("Send").click();

    cy.get("#message").should("have.value", "");

    cy.contains("Lorem Ipsum");
  });

  it("Displays messages to the author and replies", () => {
    cy.intercept(
      "GET",
      "http://10.0.0.6:5000/products/29",
      messagedProductAuthor
    );
    cy.intercept("POST", "http://10.0.0.6:5000/products/29", {
      message: "Success",
    });
    cy.intercept("http://10.0.0.6:5000/auth/login", {
      email: "cypress@email.com",
      username: "cypress",
      userId: messagedProductAuthor.user_id,
      token: "2f4dfd",
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    });

    cy.visit("/#/products/29");

    cy.contains("Login to send a message").click();
    cy.get("#email").type("test@email.com");
    cy.get("#password").type("password");
    cy.contains("Submit").click();

    cy.contains(messagedProductAuthor.messages[0].text);

    cy.contains("Username 9");
    cy.get("#message").type("New reply");
    cy.contains("Send").click();

    cy.get("#message").should("have.value", "");

    cy.contains("New reply");
  });
});
