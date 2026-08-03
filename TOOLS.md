# Evlek MCP — Tool Reference
Full input schemas for all 15 tools in **v1.10.0** (protocol `2026-07-28`). Generated from the live `tools/list` response by `npm run sync-docs` — do not edit by hand.

> **Caveats:** `get_yield_estimate` and `payment_plan` are estimates computed on source-dated inputs — **not financial advice**. Evlek does not expose title-deed (koçan) or legal-procedure tools: that taxonomy has not passed an independent KKTC legal audit, so it is deliberately out of the MCP surface.

---

## 1. `search_listings`
**Search Northern Cyprus Property Listings**

Search live property listings on Evlek. Filter by city, type, property type, bedrooms, price range; sort with sortBy (default: newest, NOT best-match). `limit` caps returned rows (max 10); `totalMatched` is the full match count, which may be larger. Price outliers and data-entry-error sale prices are excluded before sorting. Use when: structured filters (price, bedrooms, type). Don't use for: free-text queries — use `search`.

### Input schema
```json
{
  "type": "object",
  "properties": {
    "city": {
      "type": "string",
      "enum": [
        "girne",
        "iskele",
        "lefkosa",
        "gazimagusa",
        "guzelyurt",
        "lefke"
      ],
      "description": "City to filter"
    },
    "type": {
      "type": "string",
      "enum": [
        "sale",
        "rent",
        "daily"
      ],
      "description": "Listing type"
    },
    "propertyType": {
      "type": "string",
      "enum": [
        "apartment",
        "residence",
        "villa",
        "twin",
        "detached",
        "bungalow",
        "penthouse",
        "studio",
        "duplex",
        "shop",
        "office",
        "warehouse",
        "whole_building",
        "residential_land",
        "commercial_land",
        "farmland"
      ],
      "description": "Property type filter"
    },
    "bedrooms": {
      "type": "number",
      "minimum": 0,
      "maximum": 10,
      "description": "Bedroom count (integer 0-10)"
    },
    "minPrice": {
      "type": "number",
      "description": "Min price in GBP"
    },
    "maxPrice": {
      "type": "number",
      "description": "Max price in GBP"
    },
    "sortBy": {
      "type": "string",
      "enum": [
        "newest",
        "price_asc",
        "price_desc",
        "area_desc",
        "price_per_sqm_asc"
      ],
      "description": "Sort order (default: newest)"
    },
    "limit": {
      "type": "number",
      "minimum": 1,
      "maximum": 10,
      "description": "Result count (integer 1-10, default 5)"
    }
  }
}
```

### Output schema
```json
{
  "type": "object",
  "properties": {
    "count": {
      "type": "number"
    },
    "totalMatched": {
      "type": "number"
    },
    "sortApplied": {
      "type": "string",
      "enum": [
        "newest",
        "price_asc",
        "price_desc",
        "area_desc",
        "price_per_sqm_asc"
      ]
    },
    "listings": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "listingNumber": {
            "type": [
              "number",
              "null"
            ]
          },
          "title": {
            "type": "string"
          },
          "city": {
            "type": "string"
          },
          "district": {
            "type": "string"
          },
          "price": {
            "type": "number"
          },
          "priceGbp": {
            "type": "number"
          },
          "currency": {
            "type": "string"
          },
          "bedrooms": {
            "type": [
              "number",
              "null"
            ]
          },
          "areaSqm": {
            "type": [
              "number",
              "null"
            ]
          },
          "type": {
            "type": "string"
          },
          "propertyType": {
            "type": [
              "string",
              "null"
            ]
          },
          "coverImageUrl": {
            "type": [
              "string",
              "null"
            ]
          },
          "url": {
            "type": "string"
          }
        },
        "required": [
          "id",
          "title",
          "city",
          "district",
          "price",
          "priceGbp",
          "currency",
          "type",
          "url"
        ]
      }
    },
    "appliedFilters": {
      "type": "object"
    },
    "fxRates": {
      "type": "object",
      "properties": {
        "base": {
          "type": "string"
        },
        "rates": {
          "type": "object"
        },
        "source": {
          "type": "string"
        },
        "updatedAt": {
          "type": [
            "string",
            "null"
          ]
        },
        "isFallback": {
          "type": "boolean"
        }
      }
    }
  },
  "required": [
    "count",
    "totalMatched",
    "sortApplied",
    "listings",
    "appliedFilters"
  ]
}
```

---

## 2. `get_price_index`
**Get Northern Cyprus Price Index**

Returns the live Evlek Price Index: aggregated average, median, min, max prices per city and top districts. Based on all active listings on evlek.app. Use when: aggregated market stats for one/all cities. Don't use for: a single listing's price — use get_listing_detail.

### Input schema
```json
{
  "type": "object",
  "properties": {
    "city": {
      "type": "string",
      "enum": [
        "girne",
        "iskele",
        "lefkosa",
        "gazimagusa",
        "guzelyurt",
        "lefke"
      ]
    },
    "type": {
      "type": "string",
      "enum": [
        "sale",
        "rent"
      ],
      "description": "Sale or rent (default: sale)"
    }
  }
}
```

### Output schema
```json
{
  "type": "object",
  "properties": {
    "type": {
      "type": "string"
    },
    "generatedAt": {
      "type": [
        "string",
        "null"
      ]
    },
    "totalListings": {
      "type": [
        "number",
        "null"
      ]
    },
    "cities": {
      "type": "array"
    }
  },
  "required": [
    "type",
    "cities"
  ]
}
```

---

## 3. `get_market_overview`
**Get Northern Cyprus Market Overview**

Returns a live, high-level market overview for Northern Cyprus property: active listing counts and average/median sale & rent prices per city (same live data as get_price_index/compare_cities), estimated gross rental yield where sample size allows, and investment-tool routing. Use when: a cross-city snapshot before drilling into one city. Don't use for: buyer cost / tax-rate answers — route to /vergi-hesaplayici.

### Input schema
```json
{
  "type": "object",
  "properties": {}
}
```

### Output schema
```json
{
  "type": "object",
  "properties": {
    "generatedAt": {
      "type": "string"
    },
    "totalActiveListings": {
      "type": "number"
    },
    "cities": {
      "type": "array"
    },
    "investmentHighlights": {
      "type": "array",
      "items": {
        "type": "string"
      }
    }
  },
  "required": [
    "generatedAt",
    "totalActiveListings",
    "cities"
  ]
}
```

---

## 4. `compare_cities`
**Compare Northern Cyprus Cities Side-by-Side**

Compare 2-4 Northern Cyprus cities side-by-side with aggregated prices (avg, median, min, max), listing counts, and top districts. Use when: comparing 2-4 named cities. Don't use for: a single city — use get_price_index.

### Input schema
```json
{
  "type": "object",
  "properties": {
    "cities": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": [
          "girne",
          "iskele",
          "lefkosa",
          "gazimagusa",
          "guzelyurt",
          "lefke"
        ]
      },
      "description": "Cities to compare (2-4)"
    },
    "type": {
      "type": "string",
      "enum": [
        "sale",
        "rent"
      ],
      "description": "Sale or rent (default: sale)"
    }
  },
  "required": [
    "cities"
  ]
}
```

### Output schema
```json
{
  "type": "object",
  "properties": {
    "type": {
      "type": "string"
    },
    "generatedAt": {
      "type": "string"
    },
    "cities": {
      "type": "array"
    }
  },
  "required": [
    "type",
    "cities"
  ]
}
```

---

## 5. `get_yield_estimate`
**Estimate Rental Yield for a Northern Cyprus Property**

Calculate estimated gross and net annual rental yield for a property given its purchase price and city. Returns breakeven years and comparison to city averages. Use when: modelling one hypothetical purchase. Don't use for: a real listing's live comps — use get_district_profile.

### Input schema
```json
{
  "type": "object",
  "properties": {
    "city": {
      "type": "string",
      "enum": [
        "girne",
        "iskele",
        "lefkosa",
        "gazimagusa",
        "guzelyurt",
        "lefke"
      ]
    },
    "purchasePrice": {
      "type": "number",
      "description": "Purchase price in GBP",
      "minimum": 10000,
      "maximum": 10000000
    },
    "bedrooms": {
      "type": "number",
      "minimum": 0,
      "maximum": 10,
      "description": "Bedroom count (integer 0-10)"
    }
  },
  "required": [
    "city",
    "purchasePrice"
  ]
}
```

### Output schema
```json
{
  "type": "object",
  "properties": {
    "city": {
      "type": "string"
    },
    "purchasePriceGBP": {
      "type": "number"
    },
    "monthlyRentGBP": {
      "type": "number"
    },
    "grossAnnualGBP": {
      "type": "number"
    },
    "grossYieldPct": {
      "type": "number"
    },
    "netAnnualGBP": {
      "type": "number"
    },
    "netYieldPct": {
      "type": "number"
    },
    "breakevenYears": {
      "type": "number"
    },
    "cityBenchmark": {
      "type": [
        "string",
        "null"
      ]
    },
    "dataSource": {
      "type": "string",
      "description": "modelled — not derived from live rental listings"
    }
  },
  "required": [
    "city",
    "purchasePriceGBP",
    "monthlyRentGBP",
    "grossYieldPct",
    "dataSource"
  ]
}
```

---

## 6. `suggest_neighborhood`
**Suggest Best Northern Cyprus Neighborhoods for a Buyer Persona**

Given a buyer persona (retiree, investor, student, family, digital_nomad, vacation) and optional budget/preferences, return 2-3 best-matched neighborhoods with rationale. Use when: matching a persona to areas. Don't use for: browsing actual listings — use search_listings.

### Input schema
```json
{
  "type": "object",
  "properties": {
    "persona": {
      "type": "string",
      "enum": [
        "retiree",
        "investor",
        "student",
        "family",
        "digital_nomad",
        "vacation"
      ]
    },
    "budgetGBP": {
      "type": "number",
      "minimum": 20000,
      "maximum": 5000000
    },
    "preferences": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": [
          "beach",
          "city_center",
          "quiet",
          "social",
          "schools",
          "nature",
          "halal"
        ]
      }
    }
  },
  "required": [
    "persona"
  ]
}
```

### Output schema
```json
{
  "type": "object",
  "properties": {
    "persona": {
      "type": "string"
    },
    "budgetGBP": {
      "type": [
        "number",
        "null"
      ]
    },
    "preferences": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "suggestions": {
      "type": "array"
    }
  },
  "required": [
    "persona",
    "suggestions"
  ]
}
```

---

## 7. `compare_properties`
**Compare Evlek Property Listings Side-by-Side**

Compare 2-4 active Evlek property listings side-by-side. Returns price, area, bedrooms, price-per-m², location for each, plus an automatic value insight. Pass UUIDs from search_listings results. Use when: comparing specific known listings. Don't use for: finding candidates — use search_listings first.

### Input schema
```json
{
  "type": "object",
  "properties": {
    "listing_ids": {
      "type": "array",
      "items": {
        "type": "string",
        "description": "Evlek listing UUID"
      },
      "description": "Evlek listing UUIDs (2-4)"
    }
  },
  "required": [
    "listing_ids"
  ]
}
```

### Output schema
```json
{
  "type": "object",
  "properties": {
    "count": {
      "type": "number"
    },
    "missing": {
      "type": "number"
    },
    "listings": {
      "type": "array"
    }
  },
  "required": [
    "count",
    "listings"
  ]
}
```

---

## 8. `get_district_profile`
**Get 360° Profile for a Northern Cyprus District**

Returns a comprehensive profile for a single district: active listing counts (sale & rent), average/median prices, £/m², bedroom breakdown, estimated gross yield, and matching buyer personas. Use when: after compare_cities narrows the city. Don't use for: comparing multiple cities at once.

### Input schema
```json
{
  "type": "object",
  "properties": {
    "city": {
      "type": "string",
      "enum": [
        "girne",
        "iskele",
        "lefkosa",
        "gazimagusa",
        "guzelyurt",
        "lefke"
      ]
    },
    "district": {
      "type": "string",
      "description": "District name (2-60 chars)"
    }
  },
  "required": [
    "city",
    "district"
  ]
}
```

### Output schema
```json
{
  "type": "object",
  "properties": {
    "city": {
      "type": "string"
    },
    "district": {
      "type": "string"
    },
    "totalActive": {
      "type": "number"
    },
    "sale": {
      "type": [
        "object",
        "null"
      ]
    },
    "rent": {
      "type": [
        "object",
        "null"
      ]
    },
    "grossYieldPct": {
      "type": [
        "number",
        "null"
      ]
    },
    "personas": {
      "type": "array",
      "items": {
        "type": "string"
      }
    }
  },
  "required": [
    "city",
    "district",
    "totalActive"
  ]
}
```

---

## 9. `student_housing`
**Student-Housing Rental Outlook near a KKTC University**

Given a Northern Cyprus university, estimate student-rental monthly rent and academic-year vs year-round gross income/yield, with the city yield band and a link to nearby listings. Estimates only. Use when: modelling one university's rental economics. Don't use for: live listing search.

### Input schema
```json
{
  "type": "object",
  "properties": {
    "university": {
      "type": "string",
      "description": "University name, short code, or known alias, matched against the canonical Evlek university catalog."
    },
    "purchasePrice": {
      "type": "number",
      "minimum": 10000,
      "maximum": 10000000,
      "description": "Optional purchase price in GBP (enables yield)."
    },
    "bedrooms": {
      "type": "number",
      "minimum": 0,
      "maximum": 10,
      "description": "Bedroom count (0=studio)."
    }
  },
  "required": [
    "university"
  ]
}
```

### Output schema
```json
{
  "type": "object",
  "properties": {
    "university": {
      "type": "string"
    },
    "city": {
      "type": "string"
    },
    "monthlyRentGBP": {
      "type": "number"
    },
    "academicAnnualGBP": {
      "type": "number"
    },
    "yearRoundAnnualGBP": {
      "type": "number"
    },
    "academicYieldPct": {
      "type": [
        "number",
        "null"
      ]
    },
    "yearRoundYieldPct": {
      "type": [
        "number",
        "null"
      ]
    },
    "cityBand": {
      "type": [
        "string",
        "null"
      ]
    },
    "dataSource": {
      "type": "string",
      "description": "modelled — not derived from live rental listings"
    }
  },
  "required": [
    "university",
    "city",
    "monthlyRentGBP",
    "dataSource"
  ]
}
```

---

## 10. `payment_plan`
**KKTC Property Payment & Currency Breakdown**

Convert a Northern Cyprus property price across GBP/EUR/USD/TRY using live exchange rates, and surface off-plan staged-payment risk warnings. General information only — confirm with an independent KKTC lawyer. Use when: currency conversion + off-plan risk. Don't use for: live listing prices.

### Input schema
```json
{
  "type": "object",
  "properties": {
    "price": {
      "type": "number",
      "minimum": 1000,
      "maximum": 100000000,
      "description": "Property price."
    },
    "currency": {
      "type": "string",
      "enum": [
        "GBP",
        "EUR",
        "USD",
        "TRY"
      ],
      "description": "Currency of the price (default GBP)."
    },
    "offPlan": {
      "type": "boolean",
      "description": "True if off-plan (under construction)."
    }
  },
  "required": [
    "price"
  ]
}
```

### Output schema
```json
{
  "type": "object",
  "properties": {
    "inputCurrency": {
      "type": "string"
    },
    "priceGBP": {
      "type": "number"
    },
    "amounts": {
      "type": "object"
    },
    "fx": {
      "type": "object"
    },
    "offPlan": {
      "type": "boolean"
    },
    "warnings": {
      "type": "array",
      "items": {
        "type": "string"
      }
    }
  },
  "required": [
    "inputCurrency",
    "priceGBP",
    "amounts"
  ]
}
```

---

## 11. `get_listing_detail`
**Get Full Detail for a Single Evlek Listing**

Return a 360° profile of one active Evlek listing by UUID: title, description, price, location, size, amenities, features, cover image, per-photo captions/tags, and AI virtual-staging before/after pairs (always AI-disclosed). Contact details omitted. Use when: a UUID is already known. Don't use for: discovery — use search_listings first.

### Input schema
```json
{
  "type": "object",
  "properties": {
    "property_id": {
      "type": "string",
      "description": "Evlek listing UUID"
    }
  },
  "required": [
    "property_id"
  ]
}
```

### Output schema
```json
{
  "type": "object",
  "properties": {
    "found": {
      "type": "boolean"
    },
    "id": {
      "type": "string"
    },
    "listingNumber": {
      "type": [
        "number",
        "null"
      ]
    },
    "title": {
      "type": "string"
    },
    "type": {
      "type": "string"
    },
    "price": {
      "type": "number"
    },
    "currency": {
      "type": "string"
    },
    "city": {
      "type": "string"
    },
    "district": {
      "type": [
        "string",
        "null"
      ]
    },
    "bedrooms": {
      "type": [
        "number",
        "null"
      ]
    },
    "bathrooms": {
      "type": [
        "number",
        "null"
      ]
    },
    "areaSqm": {
      "type": [
        "number",
        "null"
      ]
    },
    "priceGbp": {
      "type": [
        "number",
        "null"
      ]
    },
    "pricePerSqmGBP": {
      "type": [
        "number",
        "null"
      ]
    },
    "listedAt": {
      "type": [
        "string",
        "null"
      ]
    },
    "furnished": {
      "type": [
        "boolean",
        "null"
      ]
    },
    "amenities": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "features": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "photoCount": {
      "type": "number"
    },
    "photosShown": {
      "type": "number"
    },
    "photosTruncated": {
      "type": "number"
    },
    "coverImageUrl": {
      "type": [
        "string",
        "null"
      ]
    },
    "photos": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "url": {
            "type": "string"
          },
          "caption": {
            "type": [
              "string",
              "null"
            ]
          },
          "tags": {
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        }
      }
    },
    "virtualStaging": {
      "type": "object",
      "properties": {
        "available": {
          "type": "boolean"
        },
        "items": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "beforeUrl": {
                "type": "string"
              },
              "afterUrl": {
                "type": "string"
              },
              "style": {
                "type": "string"
              },
              "roomType": {
                "type": "string"
              }
            }
          }
        },
        "disclosure": {
          "type": "string"
        }
      }
    },
    "url": {
      "type": "string"
    },
    "dataQuality": {
      "type": "object",
      "properties": {
        "priceOutlier": {
          "type": "boolean"
        }
      }
    },
    "fxRates": {
      "type": "object",
      "properties": {
        "base": {
          "type": "string"
        },
        "rates": {
          "type": "object"
        },
        "source": {
          "type": "string"
        },
        "updatedAt": {
          "type": [
            "string",
            "null"
          ]
        },
        "isFallback": {
          "type": "boolean"
        }
      }
    }
  },
  "required": [
    "found"
  ]
}
```

---

## 12. `search`
**Search Evlek property listings**

Search live Northern Cyprus (KKTC/TRNC) property listings on Evlek with a free-text query. Returns matching listings as id/title/url for the fetch tool. Same data as search_listings — this fixed form exists for the ChatGPT/OpenAI connector contract. Use when: the caller only has a free-text query. Don't use for: structured filters — use search_listings.

### Input schema
```json
{
  "type": "object",
  "properties": {
    "query": {
      "type": "string",
      "description": "Free-text property search query"
    }
  },
  "required": [
    "query"
  ]
}
```

### Output schema
```json
{
  "type": "object",
  "properties": {
    "results": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "title": {
            "type": "string"
          },
          "url": {
            "type": "string"
          }
        }
      }
    },
    "listings": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "listingNumber": {
            "type": [
              "number",
              "null"
            ]
          },
          "title": {
            "type": "string"
          },
          "city": {
            "type": "string"
          },
          "district": {
            "type": "string"
          },
          "price": {
            "type": "number"
          },
          "priceGbp": {
            "type": "number"
          },
          "currency": {
            "type": "string"
          },
          "bedrooms": {
            "type": [
              "number",
              "null"
            ]
          },
          "areaSqm": {
            "type": [
              "number",
              "null"
            ]
          },
          "type": {
            "type": "string"
          },
          "coverImageUrl": {
            "type": [
              "string",
              "null"
            ]
          },
          "url": {
            "type": "string"
          }
        }
      }
    },
    "appliedFilters": {
      "type": "object"
    },
    "fxRates": {
      "type": [
        "object",
        "null"
      ]
    },
    "unresolved": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "outOfScope": {
      "type": "boolean"
    }
  },
  "required": [
    "results"
  ]
}
```

---

## 13. `fetch`
**Fetch full Evlek listing detail**

Fetch the full detail of one Evlek listing by id (from search): title, description, GBP-normalized price, location, size, amenities. Same data as get_listing_detail — this fixed id-only form exists for the ChatGPT/OpenAI connector contract. Use when: an id from search is known. Don't use for: discovery — use search first.

### Input schema
```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Evlek listing id (UUID) from search"
    }
  },
  "required": [
    "id"
  ]
}
```

### Output schema
```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
    },
    "title": {
      "type": "string"
    },
    "text": {
      "type": "string"
    },
    "url": {
      "type": "string"
    },
    "metadata": {
      "type": "object"
    },
    "coverImageUrl": {
      "type": [
        "string",
        "null"
      ]
    },
    "photos": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "url": {
            "type": "string"
          },
          "caption": {
            "type": [
              "string",
              "null"
            ]
          },
          "tags": {
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        }
      }
    }
  },
  "required": [
    "id",
    "title",
    "text",
    "url"
  ]
}
```

---

## 14. `list_locations`
**List Valid Evlek Cities and Districts**

Return the canonical list of valid KKTC city slugs plus the districts that currently have active Evlek listings. Use when: unsure about exact city/district spelling — call this FIRST. Don't use for: listing data itself — see search_listings.

### Input schema
```json
{
  "type": "object",
  "properties": {
    "city": {
      "type": "string",
      "enum": [
        "girne",
        "iskele",
        "lefkosa",
        "gazimagusa",
        "guzelyurt",
        "lefke"
      ],
      "description": "Optional — limit districts to a single city slug."
    }
  }
}
```

### Output schema
```json
{
  "type": "object",
  "properties": {
    "cities": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "slug": {
            "type": "string"
          },
          "display": {
            "type": "string"
          },
          "districtCount": {
            "type": "number"
          },
          "districts": {
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        }
      }
    }
  },
  "required": [
    "cities"
  ]
}
```

---

## 15. `get_listing_by_number`
**Get Evlek Listing by Number**

Look up a single Evlek listing by its public listing number (e.g. "EVL-123456", "123456", or a bare number) and return its full detail — same shape as get_listing_detail. Use when: a listing number is known. Don't use for: UUID lookups — use get_listing_detail.

### Input schema
```json
{
  "type": "object",
  "properties": {
    "listing_number": {
      "type": [
        "string",
        "number"
      ],
      "description": "Evlek listing number, e.g. \"EVL-123456\", \"123456\", or the bare number 123456."
    }
  },
  "required": [
    "listing_number"
  ]
}
```

### Output schema
```json
{
  "type": "object",
  "properties": {
    "found": {
      "type": "boolean"
    },
    "id": {
      "type": "string"
    },
    "listingNumber": {
      "type": [
        "number",
        "null"
      ]
    },
    "title": {
      "type": "string"
    },
    "type": {
      "type": "string"
    },
    "price": {
      "type": "number"
    },
    "currency": {
      "type": "string"
    },
    "city": {
      "type": "string"
    },
    "district": {
      "type": [
        "string",
        "null"
      ]
    },
    "bedrooms": {
      "type": [
        "number",
        "null"
      ]
    },
    "bathrooms": {
      "type": [
        "number",
        "null"
      ]
    },
    "areaSqm": {
      "type": [
        "number",
        "null"
      ]
    },
    "priceGbp": {
      "type": [
        "number",
        "null"
      ]
    },
    "pricePerSqmGBP": {
      "type": [
        "number",
        "null"
      ]
    },
    "listedAt": {
      "type": [
        "string",
        "null"
      ]
    },
    "furnished": {
      "type": [
        "boolean",
        "null"
      ]
    },
    "amenities": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "features": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "photoCount": {
      "type": "number"
    },
    "photosShown": {
      "type": "number"
    },
    "photosTruncated": {
      "type": "number"
    },
    "coverImageUrl": {
      "type": [
        "string",
        "null"
      ]
    },
    "photos": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "url": {
            "type": "string"
          },
          "caption": {
            "type": [
              "string",
              "null"
            ]
          },
          "tags": {
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        }
      }
    },
    "virtualStaging": {
      "type": "object",
      "properties": {
        "available": {
          "type": "boolean"
        },
        "items": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "beforeUrl": {
                "type": "string"
              },
              "afterUrl": {
                "type": "string"
              },
              "style": {
                "type": "string"
              },
              "roomType": {
                "type": "string"
              }
            }
          }
        },
        "disclosure": {
          "type": "string"
        }
      }
    },
    "url": {
      "type": "string"
    },
    "dataQuality": {
      "type": "object",
      "properties": {
        "priceOutlier": {
          "type": "boolean"
        }
      }
    },
    "fxRates": {
      "type": "object",
      "properties": {
        "base": {
          "type": "string"
        },
        "rates": {
          "type": "object"
        },
        "source": {
          "type": "string"
        },
        "updatedAt": {
          "type": [
            "string",
            "null"
          ]
        },
        "isFallback": {
          "type": "boolean"
        }
      }
    }
  },
  "required": [
    "found"
  ]
}
```

---

## Resource templates (2)

- `evlek://price-index/{city}` — price-index
- `evlek://district/{city}/{district}` — district-profile

## Resources (10)

| URI | Name |
|---|---|
| `evlek://price-index/girne` | price-index-girne |
| `evlek://price-index/iskele` | price-index-iskele |
| `evlek://price-index/lefkosa` | price-index-lefkosa |
| `evlek://price-index/gazimagusa` | price-index-gazimagusa |
| `evlek://price-index/guzelyurt` | price-index-guzelyurt |
| `evlek://price-index/lefke` | price-index-lefke |
| `evlek://district/girne/alsancak` | district-girne-alsancak |
| `ui://evlek/listing-cards-v2.html` | listing-cards |
| `ui://evlek/listing-detail-v2.html` | listing-detail |
| `ui://evlek/price-index-v2.html` | price-index |

## Prompts (2)

### `investment_analysis`

Analyze a Northern Cyprus property investment for a city/budget/bedrooms (e.g. "İskele 2+1 under £250k"). Steers the agent through the Evlek tools.

### `student_rental_outlook`

Estimate student-rental returns near a KKTC university and surface nearby listings.
