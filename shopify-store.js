(() => {
  const shopRoot = document.getElementById("shop");
  if (!shopRoot) return;

  const get = (id) => document.getElementById(id);
  const productsElement = get("shop-products");
  const statusElement = get("shop-status");
  const retryButton = get("shop-retry");
  const loadMoreButton = get("shop-load-more");
  const searchInput = get("shop-search");
  const typeFilter = get("shop-type-filter");
  const cartToggle = get("shop-cart-toggle");
  const cartCount = get("shop-cart-count");
  const cartPanel = get("shop-cart-panel");
  const cartClose = get("shop-cart-close");
  const cartStatus = get("shop-cart-status");
  const cartEmpty = get("shop-cart-empty");
  const cartLinesElement = get("shop-cart-lines");
  const cartFooter = get("shop-cart-footer");
  const cartSubtotal = get("shop-cart-subtotal");
  const checkoutLink = get("shop-checkout");
  const config = window.BEAUTHY_SHOPIFY_CONFIG || {};
  const domain = normalizeDomain(config.shopDomain);
  const apiVersion = String(config.apiVersion || "");
  const accessToken = String(config.storefrontAccessToken || "");
  const endpoint = domain && apiVersion
    ? `https://${domain}/api/${encodeURIComponent(apiVersion)}/graphql.json`
    : "";
  const cartStorageKey = "beauthy.swells.shopify.cart-id.v1";

  const state = {
    products: [],
    endCursor: null,
    hasNextPage: true,
    catalogLoaded: false,
    productError: false,
    loadingProducts: false,
    loadingCart: false,
    cartBusy: false,
    cartId: null,
    cart: null,
    cartMessage: "",
    cartIsError: false,
    selectedVariantIds: new Map(),
    loadingVariantProductIds: new Set(),
    variantStatusByProductId: new Map(),
  };

  const PRODUCT_QUERY = `
    query BeauthyProducts($first: Int!, $after: String) {
      products(first: $first, after: $after, sortKey: TITLE) {
        edges {
          cursor
          node {
            id
            title
            productType
            availableForSale
            selectedOrFirstAvailableVariant { id title availableForSale price { amount currencyCode } }
            featuredImage { url altText }
            priceRange {
              minVariantPrice { amount currencyCode }
              maxVariantPrice { amount currencyCode }
            }
            variants(first: 20) {
              nodes {
                id
                title
                availableForSale
                price { amount currencyCode }
              }
              pageInfo { hasNextPage endCursor }
            }
          }
        }
        pageInfo { hasNextPage endCursor }
      }
    }
  `;

  const VARIANT_PAGE_QUERY = `
    query BeauthyProductVariantPage($id: ID!, $first: Int!, $after: String) {
      product(id: $id) {
        id
        variants(first: $first, after: $after) {
          nodes {
            id
            title
            availableForSale
            price { amount currencyCode }
          }
          pageInfo { hasNextPage endCursor }
        }
      }
    }
  `;

  const CART_FIELDS = `
    fragment BeauthyCartFields on Cart {
      id
      checkoutUrl
      totalQuantity
      cost { subtotalAmount { amount currencyCode } }
      lines(first: 100) {
        edges {
          node {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
                title
                product { title }
              }
            }
          }
        }
      }
    }
  `;

  const CART_QUERY = `
    query BeauthyCart($id: ID!) {
      cart(id: $id) { ...BeauthyCartFields }
    }
    ${CART_FIELDS}
  `;

  const CART_CREATE = `
    mutation BeauthyCartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart { ...BeauthyCartFields }
        userErrors { field message }
      }
    }
    ${CART_FIELDS}
  `;

  const CART_LINES_ADD = `
    mutation BeauthyCartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart { ...BeauthyCartFields }
        userErrors { field message }
      }
    }
    ${CART_FIELDS}
  `;

  const CART_LINES_UPDATE = `
    mutation BeauthyCartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart { ...BeauthyCartFields }
        userErrors { field message }
      }
    }
    ${CART_FIELDS}
  `;

  const CART_LINES_REMOVE = `
    mutation BeauthyCartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart { ...BeauthyCartFields }
        userErrors { field message }
      }
    }
    ${CART_FIELDS}
  `;

  function normalizeDomain(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    try {
      const url = new URL(/^https:\/\//i.test(raw) ? raw : `https://${raw}`);
      if (
        url.protocol !== "https:" ||
        url.username ||
        url.password ||
        url.port ||
        (url.pathname !== "/" && url.pathname !== "") ||
        url.search ||
        url.hash
      ) return "";
      return url.hostname.toLowerCase();
    } catch {
      return "";
    }
  }

  function setShopStatus(message, isError = false) {
    statusElement.textContent = message;
    statusElement.classList.toggle("is-error", isError);
  }

  function setCartMessage(message, isError = false) {
    state.cartMessage = message;
    state.cartIsError = isError;
    cartStatus.textContent = message;
    cartStatus.classList.toggle("is-error", isError);
  }

  function getCartLines(cart = state.cart) {
    return cart?.lines?.edges?.map((edge) => edge.node).filter(Boolean) || [];
  }

  function cartQuantity(cart = state.cart) {
    if (!cart) return 0;
    if (Number.isFinite(cart.totalQuantity)) return cart.totalQuantity;
    return getCartLines(cart).reduce((total, line) => total + Number(line.quantity || 0), 0);
  }

  function setCartPanel(open, moveFocus = false) {
    cartPanel.hidden = !open;
    cartToggle.setAttribute("aria-expanded", String(open));
    cartToggle.setAttribute(
      "aria-label",
      `${open ? "Close" : "Open"} shopping bag, ${cartQuantity()} ${cartQuantity() === 1 ? "item" : "items"}`,
    );
    if (moveFocus) (open ? cartClose : cartToggle).focus();
  }

  function safeReadCartId() {
    try {
      return window.localStorage.getItem(cartStorageKey);
    } catch {
      return null;
    }
  }

  function safeSaveCartId(cartId) {
    try {
      if (cartId) window.localStorage.setItem(cartStorageKey, cartId);
      else window.localStorage.removeItem(cartStorageKey);
    } catch {
      // The cart still works for this page view when browser storage is unavailable.
    }
  }

  function safeHttpsUrl(value) {
    try {
      const url = new URL(String(value || ""));
      if (url.protocol !== "https:" || url.username || url.password) return "";
      return url.href;
    } catch {
      return "";
    }
  }

  function money(amount, currencyCode) {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount)) return "Price shown at checkout";
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: currencyCode,
      }).format(numericAmount);
    } catch {
      return `${currencyCode || ""} ${numericAmount.toFixed(2)}`.trim();
    }
  }

  async function storefrontRequest(query, variables = {}) {
    if (!endpoint || !accessToken) {
      throw new Error("The connected storefront is not ready yet.");
    }

    let response;
    try {
      response = await fetch(endpoint, {
        method: "POST",
        mode: "cors",
        credentials: "omit",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": accessToken,
        },
        body: JSON.stringify({ query, variables }),
      });
    } catch {
      throw new Error("The Shopify storefront could not be reached. Please try again.");
    }

    let payload;
    try {
      payload = await response.json();
    } catch {
      throw new Error("Shopify returned an unreadable response. Please try again.");
    }

    if (!response.ok || payload.errors?.length) {
      throw new Error("The Shopify storefront is temporarily unavailable. Please try again.");
    }

    if (!payload.data) {
      throw new Error("The Shopify storefront did not return product data. Please try again.");
    }

    return payload.data;
  }

  function makeElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function renderTypeFilter() {
    const previous = typeFilter.value;
    const types = [...new Set(
      state.products
        .map((product) => String(product.productType || "").trim())
        .filter(Boolean),
    )].sort((a, b) => a.localeCompare(b));

    const allOption = makeElement("option", "", "All product types");
    allOption.value = "";
    typeFilter.replaceChildren(allOption);

    for (const type of types) {
      const option = makeElement("option", "", type);
      option.value = type;
      typeFilter.append(option);
    }

    typeFilter.value = types.includes(previous) ? previous : "";
  }

  function productImage(product) {
    const source = safeHttpsUrl(product.featuredImage?.url);
    const wrapper = makeElement("div", "shop-product-card__image");
    if (source) {
      const image = makeElement("img");
      image.src = source;
      image.alt = product.featuredImage?.altText || product.title || "Shopify product";
      image.loading = "lazy";
      image.decoding = "async";
      wrapper.append(image);
    } else {
      const placeholder = makeElement("span", "shop-product-card__placeholder", "Beauthy Swells");
      placeholder.setAttribute("aria-hidden", "true");
      wrapper.append(placeholder);
    }
    return wrapper;
  }

  function displayProductPrice(product, selectedVariant) {
    if (selectedVariant?.price) return money(selectedVariant.price.amount, selectedVariant.price.currencyCode);
    const minimum = product.priceRange?.minVariantPrice;
    const maximum = product.priceRange?.maxVariantPrice;
    if (!minimum) return "Price shown at checkout";
    const start = money(minimum.amount, minimum.currencyCode);
    if (maximum && Number(maximum.amount) > Number(minimum.amount)) return `From ${start}`;
    return start;
  }

  function createProductCard(product) {
    const card = makeElement("article", "shop-product-card");
    card.setAttribute("role", "listitem");
    card.dataset.productId = product.id || "";
    card.append(productImage(product));

    const body = makeElement("div", "shop-product-card__body");
    const type = String(product.productType || "").trim();
    if (type) body.append(makeElement("p", "shop-product-card__type", type));

    const title = makeElement("h3", "shop-product-card__title", product.title || "Beauthy Swells product");
    body.append(title);

    const variants = [...(product.variants?.nodes || [])];
    const preferredVariant = product.selectedOrFirstAvailableVariant;
    if (preferredVariant?.id && !variants.some((variant) => variant.id === preferredVariant.id)) {
      variants.unshift(preferredVariant);
    }
    const availableVariants = variants.filter((variant) => variant.availableForSale);
    const savedVariantId = state.selectedVariantIds.get(product.id);
    let selectedVariant = availableVariants.find((variant) => variant.id === savedVariantId)
      || availableVariants[0]
      || (preferredVariant?.availableForSale ? preferredVariant : null);
    if (selectedVariant?.id) state.selectedVariantIds.set(product.id, selectedVariant.id);
    const price = makeElement("p", "shop-product-card__price", displayProductPrice(product, selectedVariant));
    price.setAttribute("aria-live", "polite");
    body.append(price);

    let variantSelect = null;
    if (variants.length > 1) {
      const label = makeElement("label", "shop-product-card__variant-label", "Choose an option");
      variantSelect = makeElement("select", "shop-product-card__variant");
      variantSelect.setAttribute("aria-label", `Choose an option for ${product.title || "this product"}`);

      for (const variant of variants) {
        const isDefaultTitle = !variant.title || variant.title === "Default Title";
        const optionText = isDefaultTitle
          ? money(variant.price?.amount, variant.price?.currencyCode)
          : `${variant.title} — ${money(variant.price?.amount, variant.price?.currencyCode)}`;
        const option = makeElement("option", "", variant.availableForSale ? optionText : `${optionText} — Sold out`);
        option.value = variant.id;
        option.disabled = !variant.availableForSale;
        if (variant.id === selectedVariant?.id) option.selected = true;
        variantSelect.append(option);
      }

      label.append(variantSelect);
      body.append(label);
      variantSelect.addEventListener("change", () => {
        selectedVariant = variants.find((variant) => variant.id === variantSelect.value) || null;
        if (selectedVariant?.id) state.selectedVariantIds.set(product.id, selectedVariant.id);
        price.textContent = displayProductPrice(product, selectedVariant);
        const isAvailable = Boolean(selectedVariant?.availableForSale);
        addButton.disabled = !isAvailable || state.cartBusy || state.loadingCart;
        addButton.textContent = isAvailable ? "Add to bag" : "Sold out";
        addButton.setAttribute("aria-label", `${isAvailable ? "Add" : "Unavailable:"} ${product.title || "product"} ${isAvailable ? "to your bag" : ""}`.trim());
      });
    }

    if (product.variants?.pageInfo?.hasNextPage) {
      const loadingVariants = state.loadingVariantProductIds.has(product.id);
      const moreOptions = makeElement(
        "button",
        "shop-product-card__variant-more",
        loadingVariants ? "Loading options…" : "Load more options",
      );
      moreOptions.type = "button";
      moreOptions.disabled = loadingVariants;
      moreOptions.setAttribute("aria-label", `Load more options for ${product.title || "this product"}`);
      moreOptions.addEventListener("click", () => void loadMoreVariants(product, moreOptions));
      body.append(moreOptions);
    }

    const variantStatus = state.variantStatusByProductId.get(product.id);
    const loadingVariants = state.loadingVariantProductIds.has(product.id);
    if (loadingVariants || variantStatus) {
      const message = loadingVariants ? "Loading more product options…" : variantStatus.message;
      const status = makeElement(
        "p",
        variantStatus?.isError ? "shop-product-card__variant-status is-error" : "shop-product-card__variant-status",
        message,
      );
      status.setAttribute("role", variantStatus?.isError ? "alert" : "status");
      status.setAttribute("aria-live", variantStatus?.isError ? "assertive" : "polite");
      body.append(status);
    }

    const canAdd = Boolean(selectedVariant && selectedVariant.availableForSale);
    const addButton = makeElement("button", "button button-dark shop-product-card__add", canAdd ? "Add to bag" : "Sold out");
    addButton.type = "button";
    addButton.disabled = !canAdd || state.cartBusy || state.loadingCart;
    addButton.setAttribute("aria-label", `${canAdd ? "Add" : "Unavailable:"} ${product.title || "product"} ${canAdd ? "to your bag" : ""}`.trim());
    addButton.addEventListener("click", () => {
      if (selectedVariant?.id) void addVariantToCart(selectedVariant, product.title || "Product");
    });

    body.append(addButton);
    card.append(body);
    return card;
  }

  function focusVariantControl(productId) {
    const card = [...productsElement.querySelectorAll(".shop-product-card")]
      .find((candidate) => candidate.dataset.productId === productId);
    const target = card?.querySelector(".shop-product-card__variant-more")
      || card?.querySelector(".shop-product-card__variant")
      || card?.querySelector(".shop-product-card__add");
    target?.focus();
  }

  async function loadMoreVariants(product, triggerButton) {
    const productId = product?.id;
    const pageInfo = product?.variants?.pageInfo;
    if (!productId || !pageInfo?.hasNextPage || state.loadingVariantProductIds.has(productId)) return;

    const restoreFocus = document.activeElement === triggerButton;
    if (!pageInfo.endCursor) {
      state.variantStatusByProductId.set(productId, {
        message: "More product options could not be loaded. Please try again.",
        isError: true,
      });
      renderProducts();
      if (restoreFocus) focusVariantControl(productId);
      return;
    }

    state.loadingVariantProductIds.add(productId);
    state.variantStatusByProductId.delete(productId);
    renderProducts();

    try {
      const data = await storefrontRequest(VARIANT_PAGE_QUERY, {
        id: productId,
        first: 20,
        after: pageInfo.endCursor,
      });
      const updatedProduct = data.product;
      const connection = updatedProduct?.variants;
      if (!updatedProduct || updatedProduct.id !== productId || !connection?.pageInfo) {
        throw new Error("More product options could not be loaded. Please try again.");
      }

      const existingVariants = product.variants?.nodes || [];
      const existingIds = new Set(existingVariants.map((variant) => variant.id));
      const incomingVariants = [];
      for (const variant of connection.nodes || []) {
        if (!variant?.id || existingIds.has(variant.id)) continue;
        existingIds.add(variant.id);
        incomingVariants.push(variant);
      }
      if (connection.pageInfo.hasNextPage && !connection.pageInfo.endCursor) {
        throw new Error("More product options could not be loaded. Please try again.");
      }

      product.variants = {
        nodes: [...existingVariants, ...incomingVariants],
        pageInfo: connection.pageInfo,
      };
      state.variantStatusByProductId.set(productId, {
        message: incomingVariants.length
          ? `${incomingVariants.length} more ${incomingVariants.length === 1 ? "option" : "options"} loaded.`
          : "No additional options were returned.",
        isError: false,
      });
    } catch (error) {
      state.variantStatusByProductId.set(productId, {
        message: error.message || "More product options could not be loaded. Please try again.",
        isError: true,
      });
    } finally {
      state.loadingVariantProductIds.delete(productId);
      renderProducts();
      if (restoreFocus) focusVariantControl(productId);
    }
  }

  function renderProducts() {
    const search = searchInput.value.trim().toLocaleLowerCase();
    const selectedType = typeFilter.value;
    const filtered = state.products.filter((product) => {
      const title = String(product.title || "").toLocaleLowerCase();
      const type = String(product.productType || "").trim();
      const matchesSearch = !search || title.includes(search) || type.toLocaleLowerCase().includes(search);
      const matchesType = !selectedType || type === selectedType;
      return matchesSearch && matchesType;
    });

    productsElement.replaceChildren(...filtered.map(createProductCard));
    if (!filtered.length && state.products.length) {
      const empty = makeElement("p", "shop-empty-results", "No loaded products match that search. Load more products or try another term.");
      productsElement.append(empty);
    } else if (!filtered.length && state.catalogLoaded && state.products.length === 0) {
      productsElement.append(makeElement("p", "shop-empty-results", "No products are available in the connected Shopify catalog right now."));
    }

    loadMoreButton.hidden = !state.hasNextPage || (!state.catalogLoaded && state.products.length === 0) || state.productError;
    loadMoreButton.disabled = state.loadingProducts;
    loadMoreButton.textContent = state.loadingProducts && state.products.length ? "Loading more…" : "Load more products";

    for (const button of productsElement.querySelectorAll(".shop-product-card__add")) {
      if (state.cartBusy || state.loadingCart) button.disabled = true;
    }
  }

  async function loadProducts(append = false) {
    if (state.loadingProducts || (append && !state.hasNextPage)) return;
    state.loadingProducts = true;
    retryButton.hidden = true;
    setShopStatus(append ? "Loading more products from Shopify…" : "Loading the live Shopify catalog…");
    renderProducts();

    try {
      const data = await storefrontRequest(PRODUCT_QUERY, {
        first: 12,
        after: append ? state.endCursor : null,
      });
      const connection = data.products;
      const incoming = connection?.edges?.map((edge) => edge.node).filter(Boolean) || [];
      state.products = append ? [...state.products, ...incoming] : incoming;
      state.endCursor = connection?.pageInfo?.endCursor || null;
      state.hasNextPage = Boolean(connection?.pageInfo?.hasNextPage && state.endCursor);
      state.catalogLoaded = true;
      state.productError = false;
      renderTypeFilter();
      setShopStatus(
        state.hasNextPage
          ? `${state.products.length} products loaded. Search these results or load more.`
          : `${state.products.length} ${state.products.length === 1 ? "product" : "products"} loaded from Shopify.`,
      );
    } catch (error) {
      setShopStatus(error.message || "The Shopify catalog could not be loaded. Please try again.", true);
      retryButton.hidden = false;
      state.productError = true;
    } finally {
      state.loadingProducts = false;
      renderProducts();
    }
  }

  function cartUserMessage(errors) {
    if (!errors?.length) return "";
    const combined = errors.map((error) => String(error.message || "")).filter(Boolean).join(" ");
    return combined || "Shopify could not update this bag. Please try again.";
  }

  function setCartState(cart) {
    state.cart = cart || null;
    state.cartId = cart?.id || null;
    safeSaveCartId(state.cartId);
    renderCart();
  }

  function renderCart() {
    const lines = getCartLines();
    const quantity = cartQuantity();
    cartCount.textContent = String(quantity);
    cartToggle.setAttribute(
      "aria-label",
      `${cartPanel.hidden ? "Open" : "Close"} shopping bag, ${quantity} ${quantity === 1 ? "item" : "items"}`,
    );

    cartLinesElement.replaceChildren();
    for (const line of lines) {
      const merchandise = line.merchandise || {};
      const productTitle = merchandise.product?.title || "Shopify product";
      const variantTitle = merchandise.title && merchandise.title !== "Default Title" ? merchandise.title : "";
      const item = makeElement("li", "shop-cart-line");
      const details = makeElement("div", "shop-cart-line__details");
      details.append(makeElement("strong", "shop-cart-line__title", productTitle));
      if (variantTitle) details.append(makeElement("span", "shop-cart-line__variant", variantTitle));
      item.append(details);

      const controls = makeElement("div", "shop-cart-line__quantity");
      controls.setAttribute("aria-label", `Quantity for ${productTitle}`);
      const decrement = makeElement("button", "shop-cart-line__control", "−");
      decrement.type = "button";
      decrement.dataset.cartAction = "decrease";
      decrement.dataset.lineId = line.id;
      decrement.setAttribute("aria-label", `Decrease quantity of ${productTitle}`);
      decrement.disabled = state.cartBusy;
      const current = makeElement("span", "shop-cart-line__count", String(line.quantity));
      current.setAttribute("aria-label", `Quantity ${line.quantity}`);
      const increment = makeElement("button", "shop-cart-line__control", "+");
      increment.type = "button";
      increment.dataset.cartAction = "increase";
      increment.dataset.lineId = line.id;
      increment.setAttribute("aria-label", `Increase quantity of ${productTitle}`);
      increment.disabled = state.cartBusy;
      controls.append(decrement, current, increment);
      item.append(controls);

      const remove = makeElement("button", "shop-cart-line__remove", "Remove");
      remove.type = "button";
      remove.dataset.cartAction = "remove";
      remove.dataset.lineId = line.id;
      remove.setAttribute("aria-label", `Remove ${productTitle} from your bag`);
      remove.disabled = state.cartBusy;
      item.append(remove);
      cartLinesElement.append(item);
    }

    const hasLines = lines.length > 0;
    cartEmpty.hidden = hasLines;
    cartFooter.hidden = !hasLines;
    checkoutLink.hidden = !hasLines;

    const subtotal = state.cart?.cost?.subtotalAmount;
    cartSubtotal.textContent = subtotal
      ? money(subtotal.amount, subtotal.currencyCode)
      : "Calculated by Shopify at checkout";

    const checkoutUrl = safeHttpsUrl(state.cart?.checkoutUrl);
    if (checkoutUrl) checkoutLink.href = checkoutUrl;
    else checkoutLink.removeAttribute("href");
    checkoutLink.hidden = !hasLines || !checkoutUrl;

    cartStatus.textContent = state.cartMessage || (hasLines ? "Your bag is ready." : "Your bag is empty.");
    cartStatus.classList.toggle("is-error", state.cartIsError);
    if (state.cartBusy) {
      for (const button of cartLinesElement.querySelectorAll("button")) button.disabled = true;
    }
  }

  function focusCartControl(lineId, action) {
    const controls = [...cartLinesElement.querySelectorAll("button")];
    const target = controls.find((button) => button.dataset.lineId === lineId && button.dataset.cartAction === action)
      || controls[0]
      || cartToggle;
    target.focus();
  }

  async function mutateCart({ query, variables, operation, focusLineId = null, focusAction = null }) {
    if (state.cartBusy) return;
    state.cartBusy = true;
    setCartMessage("Updating your bag…");
    renderCart();
    renderProducts();

    try {
      const data = await storefrontRequest(query, variables);
      const result = data[operation];
      const userError = cartUserMessage(result?.userErrors);
      if (userError) throw new Error(userError);
      if (!result?.cart) throw new Error("Shopify could not update this bag. Please try again.");
      state.cart = result.cart;
      state.cartId = result.cart.id;
      safeSaveCartId(state.cartId);
      state.cartMessage = "Your bag was updated.";
      state.cartIsError = false;
    } catch (error) {
      state.cartMessage = error.message || "Shopify could not update this bag. Please try again.";
      state.cartIsError = true;
    } finally {
      state.cartBusy = false;
      renderCart();
      renderProducts();
      if (focusLineId && focusAction) focusCartControl(focusLineId, focusAction);
    }
  }

  async function addVariantToCart(variant, productTitle) {
    if (!variant?.id || !variant.availableForSale || state.cartBusy || state.loadingCart) return;
    state.cartBusy = true;
    setCartMessage("Adding item to your bag…");
    renderCart();
    renderProducts();

    try {
      if (!state.cartId) {
        const data = await storefrontRequest(CART_CREATE, {
          input: { lines: [{ merchandiseId: variant.id, quantity: 1 }] },
        });
        const result = data.cartCreate;
        const userError = cartUserMessage(result?.userErrors);
        if (userError) throw new Error(userError);
        if (!result?.cart) throw new Error("Shopify could not create a bag. Please try again.");
        state.cart = result.cart;
        state.cartId = result.cart.id;
        safeSaveCartId(state.cartId);
      } else {
        const data = await storefrontRequest(CART_LINES_ADD, {
          cartId: state.cartId,
          lines: [{ merchandiseId: variant.id, quantity: 1 }],
        });
        const result = data.cartLinesAdd;
        const userError = cartUserMessage(result?.userErrors);
        if (userError) throw new Error(userError);
        if (!result?.cart) throw new Error("Shopify could not add this item. Please try again.");
        state.cart = result.cart;
        state.cartId = result.cart.id;
        safeSaveCartId(state.cartId);
      }

      state.cartMessage = `${productTitle} added to your bag.`;
      state.cartIsError = false;
      renderCart();
      setCartPanel(true, true);
    } catch (error) {
      state.cartMessage = error.message || "Shopify could not add this item. Please try again.";
      state.cartIsError = true;
      setCartPanel(true, true);
    } finally {
      state.cartBusy = false;
      renderCart();
      renderProducts();
    }
  }

  async function changeCartLine(lineId, action) {
    const line = getCartLines().find((item) => item.id === lineId);
    if (!line || !state.cartId || state.cartBusy) return;

    if (action === "remove" || (action === "decrease" && Number(line.quantity) <= 1)) {
      await mutateCart({
        query: CART_LINES_REMOVE,
        variables: { cartId: state.cartId, lineIds: [lineId] },
        operation: "cartLinesRemove",
        focusLineId: lineId,
        focusAction: "remove",
      });
      return;
    }

    const quantity = Number(line.quantity) + (action === "increase" ? 1 : -1);
    await mutateCart({
      query: CART_LINES_UPDATE,
      variables: { cartId: state.cartId, lines: [{ id: lineId, quantity }] },
      operation: "cartLinesUpdate",
      focusLineId: lineId,
      focusAction: action,
    });
  }

  async function restoreCart() {
    const savedCartId = safeReadCartId();
    if (!savedCartId || !endpoint || !accessToken) {
      renderCart();
      return;
    }

    state.loadingCart = true;
    renderCart();
    renderProducts();
    try {
      const data = await storefrontRequest(CART_QUERY, { id: savedCartId });
      if (!data.cart) {
        state.cartId = null;
        state.cart = null;
        safeSaveCartId(null);
        state.cartMessage = "Your previous bag has expired. You can start a fresh one.";
        state.cartIsError = false;
      } else {
        state.cart = data.cart;
        state.cartId = data.cart.id;
        state.cartMessage = "Your saved bag is ready.";
        state.cartIsError = false;
      }
    } catch {
      state.cartId = null;
      state.cart = null;
      state.cartMessage = "Your saved bag could not be restored. Start a new bag or try again later.";
      state.cartIsError = true;
    } finally {
      state.loadingCart = false;
      renderCart();
      renderProducts();
    }
  }

  searchInput.addEventListener("input", renderProducts);
  typeFilter.addEventListener("change", renderProducts);
  retryButton.addEventListener("click", () => void loadProducts(state.products.length > 0));
  loadMoreButton.addEventListener("click", () => void loadProducts(true));

  cartToggle.addEventListener("click", () => {
    const open = cartPanel.hidden;
    setCartPanel(open, open);
  });
  cartClose.addEventListener("click", () => setCartPanel(false, true));
  cartPanel.addEventListener("click", (event) => {
    const button = event.target.closest("[data-cart-action]");
    if (button) void changeCartLine(button.dataset.lineId, button.dataset.cartAction);
  });

  setCartPanel(false);
  renderCart();
  void restoreCart();
  void loadProducts(false);
})();
