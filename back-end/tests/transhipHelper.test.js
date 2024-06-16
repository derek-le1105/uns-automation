const { compare } = require("../helper/transhipHelper");

describe("Single Variant Testing", () => {
  const map = {
    P625: {
      id: "gid://shopify/ProductVariant/42858880172223",
      inventoryPolicy: "CONTINUE",
      exists: true,
    },
  };
  const product = {
    id: "gid://shopify/Product/7661149159615",
    status: "ACTIVE",
    title: "Anubias Heterophylla Supernova",
    variants: [
      {
        id: "gid://shopify/ProductVariant/42858880172223",
        barcode: "P625",
        inventoryPolicy: "CONTINUE",
      },
    ],
  };

  const changeMap = (policyChanges = null, exists = null) => {
    /**
     * @param policyChanges Array of policies to be changed
     * @param exists Array of booleans to be changed within barcode mapping
     */
    if (policyChanges !== null) {
      for (let i = 0; i < Object.keys(map).length; ++i)
        Object.values(map)[i]["inventoryPolicy"] = policyChanges[i];
    }
    if (exists !== null) {
      for (let i = 0; i < Object.keys(map).length; ++i)
        Object.values(map)[i]["exists"] = exists[i];
    }
  };

  const changeProduct = (status = null, policyChanges = null) => {
    /**
     * @param status String (ACTIVE / DRAFT) that the product will be changed to
     * @param policyChanges Array of policies to be changed
     */
    console.log(status, policyChanges);
    if (status !== null) product["status"] = status;
    if (policyChanges !== null) {
      product["variants"] = product.variants.map((variant, idx) => {
        return { ...variant, inventoryPolicy: policyChanges[idx] };
      });
    }
  };

  describe("Single variant available", () => {
    test("ACTIVE product and CONTINUE inventoryPolicy", () => {
      expect(compare(product, map)).toStrictEqual([
        {
          ...product,
          status: "ACTIVE",
          variants: [{ ...product.variants[0], inventoryPolicy: "CONTINUE" }],
        },
        [],
      ]);
    });
    test("DRAFT product and CONTINUE inventoryPolicy", () => {
      changeProduct("DRAFT", ["CONTINUE"]);
      changeMap(["CONTINUE"], [true]);
      expect(compare(product, map)).toStrictEqual([
        {
          ...product,
          status: "ACTIVE",
          variants: [{ ...product.variants[0], inventoryPolicy: "CONTINUE" }],
        },
        [],
      ]);
    });

    test("ACTIVE product and DENY inventoryPolicy", () => {
      changeProduct("ACTIVE", ["DENY"]);
      changeMap(["DENY"], [true]);
      expect(compare(product, map)).toStrictEqual([
        {
          ...product,
          status: "ACTIVE",
          variants: [{ ...product.variants[0], inventoryPolicy: "CONTINUE" }],
        },
        [],
      ]);
    });
    test("DRAFT product and DENY inventoryPolicy", () => {
      changeProduct("DRAFT", ["DENY"]);
      changeMap(["DENY"], [true]);
      expect(compare(product, map)).toStrictEqual([
        {
          ...product,
          status: "ACTIVE",
          variants: [{ ...product.variants[0], inventoryPolicy: "CONTINUE" }],
        },
        [],
      ]);
    });
  });

  describe("Single variant unavailable", () => {
    test("ACTIVE product and CONTINUE inventoryPolicy", () => {
      changeProduct("ACTIVE", ["CONTINUE"]);
      changeMap(["CONTINUE"], [false]);
      expect(compare(product, map)).toStrictEqual([
        {
          ...product,
          status: "DRAFT",
          variants: [{ ...product.variants[0], inventoryPolicy: "DENY" }],
        },
        [],
      ]);
    });

    test("DRAFT product and CONTINUE inventoryPolicy", () => {
      changeProduct("DRAFT", ["CONTINUE"]);
      changeMap(["CONTINUE"], [false]);
      expect(compare(product, map)).toStrictEqual([
        {
          ...product,
          status: "DRAFT",
          variants: [{ ...product.variants[0], inventoryPolicy: "DENY" }],
        },
        [],
      ]);
    });

    test("ACTIVE product and DENY inventoryPolicy", () => {
      changeProduct("ACTIVE", ["CONTINUE"]);
      changeMap(["CONTINUE"], [false]);
      expect(compare(product, map)).toStrictEqual([
        {
          ...product,
          status: "DRAFT",
          variants: [{ ...product.variants[0], inventoryPolicy: "DENY" }],
        },
        [],
      ]);
    });

    test("DRAFT product and DENY inventoryPolicy", () => {
      changeProduct("DRAFT", ["CONTINUE"]);
      changeMap(["CONTINUE"], [false]);
      expect(compare(product, map)).toStrictEqual([
        {
          ...product,
          status: "DRAFT",
          variants: [{ ...product.variants[0], inventoryPolicy: "DENY" }],
        },
        [],
      ]);
    });
  });
});

describe("Multiple Variant Testing", () => {
  const map = {
    P020: {
      id: "gid://shopify/ProductVariant/42259672629439",
      inventoryPolicy: "CONTINUE",
      exists: true,
    },
    L020: {
      id: "gid://shopify/ProductVariant/42259672662207",
      inventoryPolicy: "CONTINUE",
      exists: true,
    },
    M009: {
      id: "gid://shopify/ProductVariant/42259672694975",
      inventoryPolicy: "CONTINUE",
      exists: true,
    },
  };
  const product = {
    id: "gid://shopify/Product/7455314903231",
    status: "ACTIVE",
    title: "Anubias Short and Sharp",
    variants: [
      {
        id: "gid://shopify/ProductVariant/42259672629439",
        barcode: "P020",
        inventoryPolicy: "CONTINUE",
      },
      {
        id: "gid://shopify/ProductVariant/42259672662207",
        barcode: "L020",
        inventoryPolicy: "CONTINUE",
      },
      {
        id: "gid://shopify/ProductVariant/42259672694975",
        barcode: "M009",
        inventoryPolicy: "CONTINUE",
      },
    ],
  };

  const changeMap = (policyChanges = null, exists = null) => {
    /**
     * @param policyChanges Array of policies to be changed
     * @param exists Array of booleans to be changed within barcode mapping
     */
    if (policyChanges !== null) {
      for (let i = 0; i < Object.keys(map).length; ++i)
        Object.values(map)[i]["inventoryPolicy"] = policyChanges[i];
    }
    if (exists !== null) {
      for (let i = 0; i < Object.keys(map).length; ++i)
        Object.values(map)[i]["exists"] = exists[i];
    }
  };

  const changeProduct = (status = null, policyChanges = null) => {
    /**
     * @param status String (ACTIVE / DRAFT) that the product will be changed to
     * @param policyChanges Array of policies to be changed
     */
    console.log(status, policyChanges);
    if (status !== null) product["status"] = status;
    if (policyChanges !== null) {
      product["variants"] = product.variants.map((variant, idx) => {
        return { ...variant, inventoryPolicy: policyChanges[idx] };
      });
    }
  };

  describe("All variants AVAILABLE", () => {
    test("ACTIVE product and CONTINUE inventoryPolicy", () => {
      expect(compare(product, map)).toStrictEqual([
        { ...product, status: "ACTIVE" },
        [
          {
            id: "gid://shopify/ProductVariant/42259672629439",
            barcode: "P020",
            inventoryPolicy: "CONTINUE",
          },
          {
            id: "gid://shopify/ProductVariant/42259672662207",
            barcode: "L020",
            inventoryPolicy: "CONTINUE",
          },
          {
            id: "gid://shopify/ProductVariant/42259672694975",
            barcode: "M009",
            inventoryPolicy: "CONTINUE",
          },
        ],
      ]);
    });
    test("DRAFT product and CONTINUE inventoryPolicy", () => {
      changeProduct("DRAFT", ["CONTINUE", "CONTINUE", "CONTINUE"]);
      changeMap(["CONTINUE", "CONTINUE", "CONTINUE"], [true, true, true]);
      expect(compare(product, map)).toStrictEqual([
        { ...product, status: "ACTIVE" },
        product.variants.map((variant) => {
          return { ...variant, inventoryPolicy: "CONTINUE" };
        }),
      ]);
    });
    test("ACTIVE product and DENY inventoryPolicy", () => {
      changeProduct("ACTIVE", ["DENY", "DENY", "DENY"]);
      changeMap(["DENY", "DENY", "DENY"], [true, true, true]);
      expect(compare(product, map)).toStrictEqual([
        { ...product, status: "ACTIVE" },
        product.variants.map((variant) => {
          return { ...variant, inventoryPolicy: "CONTINUE" };
        }),
      ]);
    });
    test("DRAFT product and DENY inventoryPolicy", () => {
      changeProduct("DRAFT", ["DENY", "DENY", "DENY"]);
      changeMap(["DENY", "DENY", "DENY"], [true, true, true]);
      expect(compare(product, map)).toStrictEqual([
        { ...product, status: "ACTIVE" },
        product.variants.map((variant) => {
          return { ...variant, inventoryPolicy: "CONTINUE" };
        }),
      ]);
    });
    test("ACTIVE product and VARY inventoryPolicy", () => {
      changeProduct("ACTIVE", ["CONTINUE", "DENY", "CONTINUE"]);
      changeMap(["CONTINUE", "DENY", "CONTINUE"], [true, true, true]);
      expect(compare(product, map)).toStrictEqual([
        { ...product, status: "ACTIVE" },
        product.variants.map((variant) => {
          return { ...variant, inventoryPolicy: "CONTINUE" };
        }),
      ]);
    });
    test("DRAFT product and VARY inventoryPolicy", () => {
      changeProduct("DRAFT", ["CONTINUE", "DENY", "CONTINUE"]);
      changeMap(["CONTINUE", "DENY", "CONTINUE"], [true, true, true]);
      expect(compare(product, map)).toStrictEqual([
        { ...product, status: "ACTIVE" },
        product.variants.map((variant) => {
          return { ...variant, inventoryPolicy: "CONTINUE" };
        }),
      ]);
    });
  });

  describe("All variants UNAVAILABLE", () => {
    test("ACTIVE product and CONTINUE inventoryPolicy", () => {
      changeProduct("ACTIVE", ["CONTINUE", "CONTINUE", "CONTINUE"]);
      changeMap(["CONTINUE", "CONTINUE", "CONTINUE"], [false, false, false]);
      expect(compare(product, map)).toStrictEqual([
        { ...product, status: "DRAFT" },
        product.variants.map((variant) => {
          return { ...variant, inventoryPolicy: "DENY" };
        }),
      ]);
    });

    test("DRAFT product and CONTINUE inventoryPolicy", () => {
      changeProduct("DRAFT", ["CONTINUE", "CONTINUE", "CONTINUE"]);
      changeMap(["CONTINUE", "CONTINUE", "CONTINUE"], [false, false, false]);
      expect(compare(product, map)).toStrictEqual([
        { ...product, status: "DRAFT" },
        product.variants.map((variant) => {
          return { ...variant, inventoryPolicy: "DENY" };
        }),
      ]);
    });

    test("ACTIVE product and DENY inventoryPolicy", () => {
      changeProduct("ACTIVE", ["DENY", "DENY", "DENY"]);
      changeMap(["DENY", "DENY", "DENY"], [false, false, false]);
      expect(compare(product, map)).toStrictEqual([
        { ...product, status: "DRAFT" },
        [
          {
            id: "gid://shopify/ProductVariant/42259672629439",
            barcode: "P020",
            inventoryPolicy: "DENY",
          },
          {
            id: "gid://shopify/ProductVariant/42259672662207",
            barcode: "L020",
            inventoryPolicy: "DENY",
          },
          {
            id: "gid://shopify/ProductVariant/42259672694975",
            barcode: "M009",
            inventoryPolicy: "DENY",
          },
        ],
      ]);
    });

    test("DRAFT product and DENY inventoryPolicy", () => {
      changeProduct("DRAFT", ["DENY", "DENY", "DENY"]);
      changeMap(["DENY", "DENY", "DENY"], [false, false, false]);
      expect(compare(product, map)).toStrictEqual([
        { ...product, status: "DRAFT" },
        product.variants.map((variant) => {
          return { ...variant, inventoryPolicy: "DENY" };
        }),
      ]);
    });
    test("ACTIVE product and VARY inventoryPolicy", () => {
      changeProduct("ACTIVE", ["CONTINUE", "DENY", "CONTINUE"]);
      changeMap(["CONTINUE", "DENY", "CONTINUE"], [false, false, false]);
      expect(compare(product, map)).toStrictEqual([
        { ...product, status: "DRAFT" },
        product.variants.map((variant) => {
          return { ...variant, inventoryPolicy: "DENY" };
        }),
      ]);
    });
    test("DRAFT product and VARY inventoryPolicy", () => {
      changeProduct("DRAFT", ["CONTINUE", "DENY", "CONTINUE"]);
      changeMap(["CONTINUE", "DENY", "CONTINUE"], [false, false, false]);
      expect(compare(product, map)).toStrictEqual([
        { ...product, status: "DRAFT" },
        product.variants.map((variant) => {
          return { ...variant, inventoryPolicy: "DENY" };
        }),
      ]);
    });
  });

  describe("All variants vary", () => {
    test("ACTIVE product and CONTINUE inventoryPolicy", () => {
      changeProduct("ACTIVE", ["CONTINUE", "CONTINUE", "CONTINUE"]);
      changeMap(["CONTINUE", "CONTINUE", "CONTINUE"], [true, false, false]);
      expect(compare(product, map)).toStrictEqual([
        { ...product, status: "ACTIVE" },
        product.variants.map((variant, idx) => {
          let policies = ["CONTINUE", "DENY", "DENY"];
          return { ...variant, inventoryPolicy: policies[idx] };
        }),
      ]);
    });

    test("DRAFT product and CONTINUE inventoryPolicy", () => {
      changeProduct("DRAFT", ["CONTINUE", "CONTINUE", "CONTINUE"]);
      changeMap(["CONTINUE", "CONTINUE", "CONTINUE"], [true, false, false]);
      expect(compare(product, map)).toStrictEqual([
        { ...product, status: "ACTIVE" },
        product.variants.map((variant, idx) => {
          let policies = ["CONTINUE", "DENY", "DENY"];
          return { ...variant, inventoryPolicy: policies[idx] };
        }),
      ]);
    });

    test("ACTIVE product and DENY inventoryPolicy", () => {
      changeProduct("ACTIVE", ["DENY", "DENY", "DENY"]);
      changeMap(["DENY", "DENY", "DENY"], [true, false, false]);
      expect(compare(product, map)).toStrictEqual([
        { ...product, status: "ACTIVE" },
        product.variants.map((variant, idx) => {
          let policies = ["CONTINUE", "DENY", "DENY"];
          return { ...variant, inventoryPolicy: policies[idx] };
        }),
      ]);
    });

    test("DRAFT product and DENY inventoryPolicy", () => {
      changeProduct("DRAFT", ["DENY", "DENY", "DENY"]);
      changeMap(["DENY", "DENY", "DENY"], [true, false, false]);
      expect(compare(product, map)).toStrictEqual([
        { ...product, status: "ACTIVE" },
        product.variants.map((variant, idx) => {
          let policies = ["CONTINUE", "DENY", "DENY"];
          return { ...variant, inventoryPolicy: policies[idx] };
        }),
      ]);
    });

    test("ACTIVE product and vary inventoryPolicy 1", () => {
      changeProduct("ACTIVE", ["CONTINUE", "CONTINUE", "DENY"]);
      changeMap(["CONTINUE", "CONTINUE", "DENY"], [true, false, false]);
      expect(compare(product, map)).toStrictEqual([
        { ...product, status: "ACTIVE" },
        product.variants.map((variant, idx) => {
          let policies = ["CONTINUE", "DENY", "DENY"];
          return { ...variant, inventoryPolicy: policies[idx] };
        }),
      ]);
    });
    test("ACTIVE product and vary inventoryPolicy 2", () => {
      changeProduct("ACTIVE", ["CONTINUE", "DENY", "CONTINUE"]);
      changeMap(["CONTINUE", "DENY", "CONTINUE"], [false, true, false]);
      expect(compare(product, map)).toStrictEqual([
        { ...product, status: "ACTIVE" },
        product.variants.map((variant, idx) => {
          let policies = ["DENY", "CONTINUE", "DENY"];
          return { ...variant, inventoryPolicy: policies[idx] };
        }),
      ]);
    });

    test("DRAFT product and vary inventoryPolicy 1", () => {
      changeProduct("DRAFT", ["DENY", "DENY", "CONTINUE"]);
      changeMap(["DENY", "DENY", "CONTINUE"], [false, true, false]);
      expect(compare(product, map)).toStrictEqual([
        { ...product, status: "ACTIVE" },
        product.variants.map((variant, idx) => {
          let policies = ["DENY", "CONTINUE", "DENY"];
          return { ...variant, inventoryPolicy: policies[idx] };
        }),
      ]);
    });
  });
});
