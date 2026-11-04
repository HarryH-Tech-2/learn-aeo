// Lesson 9, The Market: products and shopping in AI answers.
// Every claim about ChatGPT, Google (Search, Merchant Center, AI Mode, Gemini,
// the Universal Commerce Protocol), Microsoft Copilot, Perplexity and the
// Agentic Commerce Protocol is tied to a primary source checked on the
// `accessed` date. Programs here change quickly: checkout inside assistants is
// limited by country, application or waitlist, and the lesson says so rather
// than promising availability. The Shopping Graph figures are Google's own, as
// of its November 2025 post. Larkfield Tea is the made-up shop from Lesson 4;
// its products, prices, identifiers and feed rows are invented, and its GTIN is
// a made-up number with a valid check digit, not one assigned to a real product.

import type { LessonContent, Source } from "../lesson-types";

const ACCESSED = "2026-11-04";

const OPENAI_SHOPPING: Source = {
  title: "Shopping with ChatGPT search",
  publisher: "OpenAI Help Center",
  url: "https://help.openai.com/en/articles/11128490-shopping-with-chatgpt-search",
  accessed: ACCESSED,
};

const OPENAI_MERCHANTS: Source = {
  title: "Power product discovery in ChatGPT",
  publisher: "OpenAI",
  url: "https://chatgpt.com/merchants",
  accessed: ACCESSED,
};

const OPENAI_FEED_START: Source = {
  title: "Agentic Commerce: Get started",
  publisher: "OpenAI Developers",
  url: "https://developers.openai.com/commerce/guides/get-started",
  accessed: ACCESSED,
};

const OPENAI_FEED_SPEC: Source = {
  title: "Agentic Commerce: Products (file upload)",
  publisher: "OpenAI Developers",
  url: "https://developers.openai.com/commerce/specs/file-upload/products",
  accessed: ACCESSED,
};

const OPENAI_ACP_CONCEPTS: Source = {
  title: "Agentic Commerce: Key concepts",
  publisher: "OpenAI Developers",
  url: "https://developers.openai.com/commerce/guides/key-concepts",
  accessed: ACCESSED,
};

const ACP_SITE: Source = {
  title: "Agentic Commerce Protocol",
  publisher: "Agentic Commerce Protocol (OpenAI and Stripe)",
  url: "https://www.agenticcommerce.dev/",
  accessed: ACCESSED,
};

const GOOGLE_PRODUCT_INTRO: Source = {
  title: "Introduction to Product structured data",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/appearance/structured-data/product",
  date: "2025-12-10",
  dateKind: "updated",
  accessed: ACCESSED,
};

const GOOGLE_MERCHANT_LISTING: Source = {
  title: "Merchant listing (Product, Offer) structured data",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/appearance/structured-data/merchant-listing",
  date: "2026-09-08",
  dateKind: "updated",
  accessed: ACCESSED,
};

const GOOGLE_REVIEW_SNIPPET: Source = {
  title: "Review snippet (Review, AggregateRating) structured data",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/appearance/structured-data/review-snippet",
  date: "2026-09-08",
  dateKind: "updated",
  accessed: ACCESSED,
};

const GOOGLE_RETURN_POLICY: Source = {
  title: "Merchant return policy (MerchantReturnPolicy) structured data",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/appearance/structured-data/return-policy",
  date: "2026-09-08",
  dateKind: "updated",
  accessed: ACCESSED,
};

const GOOGLE_AI_FEATURES: Source = {
  title: "AI features and your website",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/appearance/ai-features",
  date: "2025-12-10",
  dateKind: "updated",
  accessed: ACCESSED,
};

const GOOGLE_AI_GUIDE: Source = {
  title: "Optimizing your website for generative AI features on Google Search",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/fundamentals/ai-optimization-guide",
  date: "2026-07-10",
  dateKind: "updated",
  accessed: ACCESSED,
};

const GOOGLE_SHARE_PRODUCT_DATA: Source = {
  title: "Share your product data with Google",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/specialty/ecommerce/share-your-product-data-with-google",
  date: "2025-12-10",
  dateKind: "updated",
  accessed: ACCESSED,
};

const GOOGLE_BLOG_HOLIDAY: Source = {
  title: "Let AI do the hard parts of your holiday shopping",
  publisher: "Google (The Keyword)",
  url: "https://blog.google/products-and-platforms/products/shopping/agentic-checkout-holiday-ai-shopping/",
  date: "2025-11-13",
  dateKind: "published",
  accessed: ACCESSED,
};

const GOOGLE_UCP: Source = {
  title: "Getting started with Universal Commerce Protocol on Google",
  publisher: "Google for Developers",
  url: "https://developers.google.com/merchant/ucp",
  accessed: ACCESSED,
};

const GOOGLE_UCP_FAQ: Source = {
  title: "Google Universal Commerce Protocol (UCP) guide: FAQ",
  publisher: "Google for Developers",
  url: "https://developers.google.com/merchant/ucp/faq",
  date: "2026-11-03",
  dateKind: "updated",
  accessed: ACCESSED,
};

const MC_FREE_LISTINGS: Source = {
  title: "Free listings for products",
  publisher: "Google Merchant Center Help",
  url: "https://support.google.com/merchants/answer/13889434",
  accessed: ACCESSED,
};

const MC_SPEC: Source = {
  title: "Product data specification",
  publisher: "Google Merchant Center Help",
  url: "https://support.google.com/merchants/answer/7052112",
  accessed: ACCESSED,
};

const MC_PRICE: Source = {
  title: "Price [price]",
  publisher: "Google Merchant Center Help",
  url: "https://support.google.com/merchants/answer/6324371",
  accessed: ACCESSED,
};

const MC_AUTOMATIONS: Source = {
  title: "Allow Merchant Center to update product information automatically",
  publisher: "Google Merchant Center Help",
  url: "https://support.google.com/merchants/answer/12157888",
  accessed: ACCESSED,
};

const MC_PRODUCT_RATINGS: Source = {
  title: "About product ratings",
  publisher: "Google Merchant Center Help",
  url: "https://support.google.com/merchants/answer/14620705",
  accessed: ACCESSED,
};

const MS_AGENTIC: Source = {
  title: "Agentic commerce",
  publisher: "Microsoft Advertising",
  url: "https://about.ads.microsoft.com/en/solutions/technology/agentic-commerce",
  accessed: ACCESSED,
};

const PPLX_SHOP_LIKE_A_PRO: Source = {
  title: "Shop like a Pro: Perplexity's new AI-powered shopping assistant",
  publisher: "Perplexity Blog",
  url: "https://www.perplexity.ai/hub/blog/shop-like-a-pro",
  date: "2024-11-18",
  dateKind: "published",
  accessed: ACCESSED,
};

const PPLX_SHOPPING_PAYPAL: Source = {
  title: "Shopping that puts you first",
  publisher: "Perplexity Blog",
  url: "https://www.perplexity.ai/hub/blog/shopping-that-puts-you-first",
  date: "2025-11-25",
  dateKind: "published",
  accessed: ACCESSED,
};

export const LESSON_9: LessonContent = {
  intro:
    "You have reached The Market, the ninth district of the City of Answers. Here people don't only ask questions, they buy things. AI assistants now answer shopping questions with product cards, prices, review summaries and, on some platforms, a buy button. In this district you learn where those products come from: the markup on your pages, the feeds you send to Google, Microsoft and OpenAI, your reviews, and how accurate your prices and stock are. You'll also meet the new checkout protocols that let an assistant complete the purchase.",

  outro:
    "You leave The Market knowing how ChatGPT, Google's AI Mode and Gemini, Copilot and Perplexity find products, which markup makes a product page a merchant listing, which feeds to send and what they need, why a price that drifts out of date costs you, and what the checkout protocols ask of a merchant. The common thread: one accurate product record, published the same way on your page and in every feed.",

  groups: [
    {
      id: "g-market-surfaces",
      title: "Where products show up in AI answers",
      concepts: [
        {
          id: "c-chatgpt-products",
          term: "ChatGPT product results",
          summary: "For shopping questions ChatGPT can show product cards with prices, review summaries and a list of merchants; OpenAI says these results are not ads.",
          explanation:
            "When a question suggests shopping intent, ChatGPT can show product options with images, details and links to places to buy. OpenAI says: \"Product results are selected independently by ChatGPT and are not ads, nor influenced by any OpenAI partnerships.\"\n\nOpenAI lists what it considers when choosing products, including \"Structured metadata from first-party and third-party providers (e.g., price, product description) and other third-party content.\" Three details matter for merchants:\n\n- **Titles can be rewritten.** ChatGPT may generate simplified titles and descriptions, because merchants often use different titles for the same product.\n- **Review summaries** are written by the model from reviews on public websites, and OpenAI adds: \"Reviews and ratings are not verified by OpenAI.\"\n- **Merchant order.** When several shops sell the same item, merchants \"are ranked based on factors like availability, price, quality, and whether they are the maker or primary seller of that item.\"",
          whyItMatters:
            "Price, availability and whether you are the maker or primary seller all feed into which merchant is listed first. Those are facts about your business you control, not copy you polish.",
          pitfall:
            "Assuming shoppers see the product title you wrote. ChatGPT may simplify it, so put the facts that decide a purchase (size, material, compatibility) in structured fields and the description, not only in a long title.",
          sources: [OPENAI_SHOPPING],
        },
        {
          id: "c-shopping-graph",
          term: "Google's Shopping Graph in AI Mode and Gemini",
          summary: "Google's AI shopping answers in AI Mode and the Gemini app draw on the Shopping Graph, which merchants feed through Merchant Center.",
          explanation:
            "Google's shopping answers in AI Mode combine Gemini models with the **Shopping Graph**, Google's store of product listings. In November 2025 Google said the Shopping Graph \"includes more than 50 billion product listings, 2 billion of which are updated every hour\". The same post says a shopping answer in AI Mode brings together \"rich visuals and all the details you need (like price, reviews and inventory info)\", and that shopping features were added to the Gemini app in the US.\n\nGoogle's guide to its AI features tells merchants how to get into that data: \"using products like Merchant Center (such as Merchant Center feeds) and Google Business Profiles can help your products and services to be visible in both AI responses and other Google Search results.\"\n\nMerchant Center's free listings are the no-cost route: eligible products can appear on Search, Images, Lens, YouTube, Gemini, the Shopping tab and more.",
          whyItMatters:
            "In Google's AI shopping answers the product facts come from a database you can feed directly. A complete, current Merchant Center feed is the most direct lever you have.",
          pitfall:
            "Thinking Merchant Center is only for advertisers. Free listings need no ad spend, and Google says in most cases the feature is turned on by default; check the free listings page in your account to be sure.",
          sources: [GOOGLE_BLOG_HOLIDAY, GOOGLE_AI_GUIDE, MC_FREE_LISTINGS],
        },
        {
          id: "c-perplexity-copilot",
          term: "Perplexity and Microsoft Copilot",
          summary: "Perplexity and Copilot answer shopping questions too, drawing on the web plus merchant data: a merchant program and PayPal checkout at Perplexity, Microsoft Merchant Center feeds at Copilot.",
          explanation:
            "**Perplexity** launched shopping in November 2024 with product cards it said were not sponsored, and announced a free Perplexity Merchant Program for large retailers to share product specs. Its pitch to merchants: a better chance of being a recommended product, because \"when we have more robust details, we can better determine if a product is high quality and relevant to a user's query.\" In November 2025 it launched a new shopping experience for US users with checkout powered by PayPal, where \"retailers stay at the center of the transaction as the merchant of record.\"\n\n**Microsoft Copilot** answers shopping questions too. Asked what it uses to surface products in organic results, Microsoft says: \"We leverage both information found on the web and from a merchant's feed in the Microsoft Merchant Center.\"",
          whyItMatters:
            "Each assistant has its own route for product data, but they lean on the same raw material: your pages, your feeds and what others say about your products. One clean product record can serve all of them.",
          pitfall:
            "Assuming one platform's program covers the others. Google Merchant Center, Microsoft Merchant Center and OpenAI's product feed are separate sign-ups, and Perplexity's merchant program was announced on its own; check each one's current terms before you plan around it.",
          sources: [PPLX_SHOP_LIKE_A_PRO, PPLX_SHOPPING_PAYPAL, MS_AGENTIC],
        },
      ],
      check: [
        {
          kind: "choice",
          id: "q-market-not-ads",
          prompt: "What does OpenAI say about the product results ChatGPT shows?",
          options: [
            "They are sponsored placements sold to merchants",
            "They are selected independently, are not ads, and aren't influenced by OpenAI partnerships",
            "They only include Shopify stores",
            "They always show the lowest price first",
          ],
          answer: 1,
          explanation:
            "OpenAI's help page says product results are selected independently and are not ads. Ads in ChatGPT are separate. The first price shown is typically the first merchant listed, which may not be the lowest.",
        },
        {
          kind: "match",
          id: "q-market-routes",
          prompt: "Match each assistant to the merchant data route its maker documents.",
          pairs: [
            { term: "Google AI Mode and Gemini", definition: "Merchant Center feeds and free listings, feeding the Shopping Graph" },
            { term: "Microsoft Copilot", definition: "Web information plus a feed in Microsoft Merchant Center" },
            { term: "ChatGPT", definition: "A direct product feed by application, or an existing Shopify or Etsy catalog" },
          ],
          explanation:
            "Google points merchants to Merchant Center, Microsoft to Microsoft Merchant Center, and OpenAI to its own product feed, with Shopify and Etsy catalogs already integrated.",
        },
      ],
    },
    {
      id: "g-market-markup",
      title: "Product markup on your pages",
      concepts: [
        {
          id: "c-snippet-vs-merchant",
          term: "Product snippet or merchant listing",
          summary: "Google has two classes of product markup: product snippets for pages that review or describe products, and merchant listings for pages where people can buy.",
          explanation:
            "Google splits product structured data into two classes. Product snippets are \"for product pages where people can't directly purchase the product\", such as an editorial review. Merchant listings are \"for pages where customers can purchase products from you\".\n\nThe rules differ. Merchant listings need an `Offer`, because Google says they \"require an Offer as the merchant has to be the seller of the product in order to be eligible for merchant listing experiences.\" And: \"Unlike product snippets, merchant listing experiences require a price greater than zero.\"\n\nThe good news for shops: \"adding the required product information properties for merchant listings means that your product pages can also be eligible for product snippets.\"",
          whyItMatters:
            "Merchant listing experiences include the Shopping knowledge panel, Google Images and popular product results. Choosing the right class decides which of them a page can qualify for.",
          pitfall:
            "Adding merchant listing markup to a page that only links out to other sellers. Google says only pages where a shopper can buy are eligible, \"not pages with links to other sites that sell the product.\"",
          sources: [GOOGLE_PRODUCT_INTRO, GOOGLE_MERCHANT_LISTING],
        },
        {
          id: "c-merchant-markup",
          term: "Merchant listing markup",
          summary: "A merchant listing needs a Product with name, image and an Offer with a price and ISO currency code; availability, identifiers, shipping and returns are recommended.",
          explanation:
            "Google's required properties for a merchant listing:\n\n- **Product**: `name`, `image`, and `offers` (a nested `Offer`).\n- **Offer**: `price` (above zero) and `priceCurrency`, the currency \"in three-letter ISO 4217 format\", such as GBP or USD.\n\nRecommended properties add the detail shoppers compare: `availability`, `description`, `brand`, global identifiers such as `gtin13`, `aggregateRating`, `shippingDetails` and `hasMerchantReturnPolicy`.\n\nTwo cautions from Google. It \"may attempt to verify merchant listing product data before showing the information in search results.\" And its advice for AI features includes \"making sure your structured data matches the visible text on the page\". There is no special AI markup to add on top.",
          whyItMatters:
            "Markup states your product facts in a form machines don't have to guess at, and Google may check those facts against the page and your feed. Accurate markup is the cheapest product data you can publish.",
          example: {
            kind: "code",
            language: "json",
            caption: "Merchant listing markup for a Larkfield Tea product page (made up)",
            code: "{\n  \"@context\": \"https://schema.org\",\n  \"@type\": \"Product\",\n  \"name\": \"Breakfast Blend loose-leaf tea, 250 g tin\",\n  \"image\": \"https://larkfieldtea.example/img/breakfast-250.jpg\",\n  \"description\": \"Assam and Ceylon black tea blend, 250 g in a resealable tin.\",\n  \"brand\": { \"@type\": \"Brand\", \"name\": \"Larkfield Tea\" },\n  \"sku\": \"LK-BRK-250\",\n  \"gtin13\": \"5012345678900\",\n  \"aggregateRating\": { \"@type\": \"AggregateRating\", \"ratingValue\": 4.7, \"reviewCount\": 212 },\n  \"offers\": {\n    \"@type\": \"Offer\",\n    \"url\": \"https://larkfieldtea.example/shop/breakfast-blend\",\n    \"price\": 24.00,\n    \"priceCurrency\": \"GBP\",\n    \"availability\": \"https://schema.org/InStock\",\n    \"itemCondition\": \"https://schema.org/NewCondition\"\n  }\n}",
          },
          pitfall:
            "Trusting a plugin's markup without checking it. Validate with the Rich Results Test, and compare the price, currency and stock in the markup with what the page shows.",
          sources: [GOOGLE_MERCHANT_LISTING, GOOGLE_AI_FEATURES],
        },
        {
          id: "c-reviews-ratings",
          term: "Reviews and ratings",
          summary: "Ratings reach AI shopping answers through page markup, Merchant Center's product ratings, feeds and reviews on other sites; identifiers decide whether they get matched to your product.",
          explanation:
            "Every AI shopping surface shows ratings, but each gets them differently:\n\n- **On your page**: `aggregateRating` is a recommended merchant listing property, following Google's review snippet guidelines.\n- **Google Merchant Center**: the product ratings add-on shows stars in ads and free listings. To activate it \"you need at least 50 reviews across all your products\", and reviews are matched to products mainly by identifier, so Google says to \"use globally unique product identifiers such as GTINs\".\n- **ChatGPT**: its review summaries \"are based on reviews from public websites\". OpenAI's feed spec also has optional `review_count` and `star_rating` fields, and OpenAI says recommended attributes \"like rich media, reviews, and performance signals\" improve ranking, relevance and user trust.",
          whyItMatters:
            "Assistants compare products on what buyers say about them. Genuine reviews, matched to the right product, are one of the few signals that work on every platform.",
          pitfall:
            "Inventing or buying reviews to lift the numbers. Google's rule is plain: \"Don't include fake or undisclosed incentivized reviews on your page or in your structured data markup.\"",
          sources: [GOOGLE_MERCHANT_LISTING, GOOGLE_REVIEW_SNIPPET, MC_PRODUCT_RATINGS, OPENAI_SHOPPING, OPENAI_ACP_CONCEPTS],
        },
        {
          id: "c-policies-markup",
          term: "Shipping and return policies",
          summary: "State shipping costs and your return policy in markup and in Merchant Center, because shoppers and checkout protocols both depend on them.",
          explanation:
            "A shopper comparing products wants the total cost and what happens if it doesn't suit. Google lets you state both:\n\n- **Returns**: a standard policy for the whole business as `MerchantReturnPolicy`, \"nested under the Organization structured data type using the hasMerchantReturnPolicy property\". Override it for one product under that product's `Offer`.\n- **Shipping**: `shippingDetails` on the `Offer`, with rate, destination and delivery time.\n\nOther platforms ask for the same facts. OpenAI tells ChatGPT users to confirm return and warranty policies with the merchant before buying. Google's checkout protocol FAQ tells merchants to keep their \"product feeds, brand assets, return policies, and business contact information\" complete and up to date in Merchant Center.",
          whyItMatters:
            "Free shipping or a 30-day return window is a reason to choose you. If it isn't stated where machines read it, it can't count in a comparison.",
          example: {
            kind: "before-after",
            before: "The returns policy is a PDF linked from the footer. No markup, and the Merchant Center account has no return policy set.",
            after: "One MerchantReturnPolicy under the Organization markup (30 days, return by mail, free returns), the same policy entered in Merchant Center, and shippingDetails on every Offer.",
            note: "Larkfield Tea's policy is made up. The point is that the page, the markup and Merchant Center all state the same policy.",
          },
          pitfall:
            "Stating different policies in different places: 30 days on the page, 14 in Merchant Center. Pick one source of truth and publish from it.",
          sources: [GOOGLE_RETURN_POLICY, GOOGLE_MERCHANT_LISTING, OPENAI_SHOPPING, GOOGLE_UCP_FAQ],
        },
      ],
      check: [
        {
          kind: "spot",
          id: "q-markup-currency",
          prompt: "This Offer is from Larkfield Tea's product page. Which line breaks Google's merchant listing requirements?",
          language: "json",
          lines: [
            "\"offers\": {",
            "  \"@type\": \"Offer\",",
            "  \"price\": 24.00,",
            "  \"priceCurrency\": \"£\",",
            "  \"availability\": \"https://schema.org/InStock\"",
            "}",
          ],
          answer: 3,
          explanation:
            "priceCurrency must be a three-letter ISO 4217 code, so \"GBP\", not the £ symbol. The price is above zero and the availability value is valid.",
        },
        {
          kind: "choice",
          id: "q-markup-class",
          prompt: "A tea blog reviews ten kettles and links to the shops that sell them. Which product markup fits?",
          options: [
            "Merchant listing, because the page mentions prices",
            "Product snippet, because readers can't buy on the page",
            "No product markup is allowed on blogs",
            "MerchantReturnPolicy",
          ],
          answer: 1,
          explanation:
            "Product snippets are for pages where people can't buy directly, such as editorial reviews. Merchant listings need the site to be the seller.",
        },
        {
          kind: "blank",
          id: "q-markup-zero",
          prompt: "Complete Google's rule.",
          text: "Unlike product snippets, merchant listing experiences require a price greater than ___.",
          answers: ["zero"],
          distractors: ["one", "the list price", "the sale price"],
          explanation: "A merchant listing describes something you actually sell, so a price of zero doesn't qualify.",
        },
      ],
    },
    {
      id: "g-market-feeds",
      title: "Product feeds",
      concepts: [
        {
          id: "c-merchant-center-feed",
          term: "Google Merchant Center feeds",
          summary: "A Merchant Center feed tells Google about every product directly, including data that isn't on your pages; Google recommends using it alongside markup.",
          explanation:
            "Google recommends both routes: \"Providing both structured data on web pages and a Merchant Center feed maximizes your eligibility to experiences and helps Google correctly understand and verify your data.\"\n\nWhat a feed adds:\n\n- **Coverage**: \"Web crawling is not guaranteed to find all products on your site.\" A feed lists them all.\n- **Data that isn't on the page**, such as store-level inventory.\n- **Access to some surfaces**: \"Participation in Google Merchant Center is required to appear in the Google Shopping tab.\"\n\nOnce products are in Merchant Center, free listings can show them on Search, Maps, Gemini, YouTube, the Shopping tab, Images and Lens.",
          whyItMatters:
            "The feed is how your catalog reaches the Shopping Graph that Google's AI shopping answers draw on. For a shop, it is the AI visibility work with the most direct effect.",
          pitfall:
            "Treating the free listings switch as a promise. Google says the setting \"doesn't guarantee that your products will be shown to customers.\" Your data still has to match what people are looking for.",
          sources: [GOOGLE_PRODUCT_INTRO, GOOGLE_SHARE_PRODUCT_DATA, MC_FREE_LISTINGS],
        },
        {
          id: "c-openai-feed",
          term: "OpenAI's product feed",
          summary: "Merchants can apply to send ChatGPT a product feed built on the Agentic Commerce Protocol: one row per item, nine required fields, a full snapshot at least daily.",
          explanation:
            "OpenAI takes product feeds directly. Access is by application: \"Onboarding product feeds in ChatGPT is currently available to approved partners.\" Its merchant page adds: \"If you sell through Shopify or Etsy, your catalog is already integrated, and no additional setup or application is required.\" It also says shopping is currently live for ChatGPT users in the US.\n\nThe file spec asks for one row per purchasable item or variant, with nine required fields: `item_id`, `title`, `description`, `url`, `brand`, `seller_name`, `image_url`, `availability` and `price`. Then keep it fresh: \"We recommend uploading a full snapshot at least once a day.\"\n\nOpenAI also lists prohibited products, such as age-restricted goods like alcohol, which can't be listed this way.",
          whyItMatters:
            "OpenAI says prices in ChatGPT come from third-party providers and can lag. A direct feed is how a merchant makes sure ChatGPT has its own, current data.",
          example: {
            kind: "code",
            language: "json",
            caption: "One row of Larkfield Tea's ChatGPT feed (made up)",
            code: "{\n  \"item_id\": \"LK-BRK-250\",\n  \"title\": \"Breakfast Blend loose-leaf tea, 250 g tin\",\n  \"description\": \"Assam and Ceylon black tea blend, 250 g in a resealable tin.\",\n  \"url\": \"https://larkfieldtea.example/shop/breakfast-blend\",\n  \"brand\": \"Larkfield Tea\",\n  \"seller_name\": \"Larkfield Tea\",\n  \"image_url\": \"https://larkfieldtea.example/img/breakfast-250.jpg\",\n  \"availability\": \"in_stock\",\n  \"price\": \"31.00 USD\"\n}",
          },
          pitfall:
            "Filling gaps with placeholders. The spec says not to use placeholder strings such as null, unknown or N/A; leave optional fields out instead. Only fields that list it, such as availability, accept unknown.",
          sources: [OPENAI_FEED_START, OPENAI_MERCHANTS, OPENAI_FEED_SPEC, OPENAI_SHOPPING],
        },
        {
          id: "c-microsoft-merchant-center",
          term: "Microsoft Merchant Center for Copilot",
          summary: "Copilot uses the web and Microsoft Merchant Center feeds for organic product results; Microsoft calls a UCP-ready feed the first step.",
          explanation:
            "Microsoft says Copilot's organic product results use web information and the merchant's feed in Microsoft Merchant Center. Its agentic commerce page calls a feed the foundation: \"The first step is to improve product visibility in Microsoft Merchant Center (MMC) with a UCP-ready feed.\"\n\nIt lists what that involves: store settings for return policy, customer support and Copilot Checkout, and extra feed attributes for native checkout eligibility, product warnings and a unique merchant item ID.\n\nMicrosoft explains the split this way: \"feeds primarily enable discovery (products showing up in AI responses), while UCP enables transactions\".",
          whyItMatters:
            "If your shop only maintains a Google feed, Copilot has only the web to go on. A second feed from the same product record costs little.",
          pitfall:
            "Assuming Copilot reads your Google Merchant Center account. Microsoft names its own Merchant Center as the onboarding path.",
          sources: [MS_AGENTIC],
        },
        {
          id: "c-identifiers-variants",
          term: "Identifiers and variants",
          summary: "Stable IDs, real GTINs and grouped variants let every platform tell your products apart and attach the right reviews and offers to each.",
          explanation:
            "Platforms have to work out which listings are the same product. Identifiers do that work:\n\n- **GTINs**: Google's merchant listing guide says to \"include all applicable global identifiers\", and Merchant Center matches reviews to products mainly by GTIN.\n- **Stable item IDs**: OpenAI's spec says of `item_id`: \"Never reuse it for a different item.\" And for offer IDs: \"Never include price in an offer ID.\"\n- **Variants**: Google says variant markup \"can help Google better understand which products are variations of the same parent product.\" OpenAI wants one row per variant, each with its own `item_id` and a shared `group_id`.\n\nIf a product has no GTIN, don't make one up. OpenAI's spec says of `mpn`: \"do not invent a value to replace a missing GTIN.\"",
          whyItMatters:
            "When identifiers match, your reviews, prices and stock join up across sources into one strong product record. When they don't, the same tea looks like several weak ones.",
          pitfall:
            "Changing IDs during a site migration or a platform switch. A new ID looks like a new product, and the history attached to the old one, such as reviews, can be lost.",
          sources: [GOOGLE_MERCHANT_LISTING, GOOGLE_PRODUCT_INTRO, MC_PRODUCT_RATINGS, OPENAI_FEED_SPEC],
        },
      ],
      check: [
        {
          kind: "order",
          id: "q-feeds-openai-path",
          prompt: "Put OpenAI's integration path for a product feed in order (after approval).",
          items: [
            "Review the file upload guide and product file schema",
            "Validate the required fields for every record",
            "Upload the catalog over SFTP",
            "Keep the feed current with a full snapshot at least once a day",
          ],
          explanation:
            "OpenAI's Get started guide lists the same four steps: review, validate, upload, keep current.",
        },
        {
          kind: "match",
          id: "q-feeds-fields",
          prompt: "Match each OpenAI feed field to what it holds.",
          pairs: [
            { term: "item_id", definition: "A stable ID for one item or variant, never reused" },
            { term: "group_id", definition: "The parent listing ID shared by all variants" },
            { term: "seller_name", definition: "The name of the seller supplying the offer" },
            { term: "availability", definition: "in_stock, out_of_stock, pre_order, backorder or unknown" },
          ],
          explanation: "These descriptions follow OpenAI's product file spec.",
        },
        {
          kind: "choice",
          id: "q-feeds-why-both",
          prompt: "Why does Google recommend a Merchant Center feed as well as markup?",
          options: [
            "Markup is ignored once you have a feed",
            "Both together maximize eligibility and help Google understand and verify your data",
            "Feeds are required for organic web results",
            "Markup only works for paid Shopping ads",
          ],
          answer: 1,
          explanation:
            "Google says providing both maximizes eligibility and helps it verify your data. Some experiences combine the two, for example taking a price from the feed when the markup lacks one.",
        },
      ],
    },
    {
      id: "g-market-accuracy",
      title: "Accuracy and agentic checkout",
      concepts: [
        {
          id: "c-price-accuracy",
          term: "Price accuracy",
          summary: "Your feed, markup, landing page and checkout must show the same price; mismatches get products disapproved and stale prices mislead shoppers.",
          explanation:
            "Merchant Center's minimum requirement is direct: \"Submit an amount and currency that match the price on your landing page and the checkout pages.\" It also says not to change a product's price on the landing page based on a user's location. If you break the requirements, Google disapproves the product.\n\nTwo safety nets exist, and neither replaces a good process:\n\n- Merchant Center **automations** can update price and availability from the structured data on your pages, but Google warns: \"Automations aren't a replacement for regular updates of your product data.\"\n- In ChatGPT, OpenAI admits a lag: \"When merchants update their pricing or shipping terms, there may be some delay before it is reflected in the information you see.\"\n\nThe fix is upstream: generate the page, the markup and every feed from one product record, and send updates as often as prices change.",
          whyItMatters:
            "An assistant that quotes the wrong price sends a shopper who then feels misled at checkout. On Google, a mismatch can take the product out of listings entirely.",
          example: {
            kind: "before-after",
            before: "Larkfield raises the Breakfast Blend from £24 to £26 on the site. The feed is a spreadsheet updated by hand each month, and the markup is typed into the page template.",
            after: "The price changes once in the product record. The page, its markup and the Merchant Center and ChatGPT feeds are all generated from that record, and the feeds are sent daily.",
            note: "Larkfield Tea and its prices are made up.",
          },
          pitfall:
            "Showing \"view price in cart\" or a location-based price. Merchant Center's price rules forbid both; use the regional pricing program where it's available.",
          sources: [MC_PRICE, MC_AUTOMATIONS, OPENAI_SHOPPING],
        },
        {
          id: "c-availability",
          term: "Availability and stock",
          summary: "Stock status must match across feed, page and markup, and if checkout happens inside an assistant, you still check stock in real time.",
          explanation:
            "Availability is a required Merchant Center attribute, and Google asks you to match it with \"your landing page, checkout pages, and structured data\". One detail people miss: \"If an item is out of stock, the price must still be clearly visible on the landing page.\"\n\nOpenAI's feed treats availability carefully too. It accepts `unknown`, but notes that \"unknown does not assert that the item is in stock.\"\n\nWhen an assistant handles checkout, stock becomes a live question. Google's checkout protocol FAQ is clear about whose job it is: \"As the merchant of record, it is your responsibility to perform real-time inventory checks.\" If an item sells out mid-checkout, your system returns an out-of-stock error and Google shows the shopper a message.",
          whyItMatters:
            "Recommending something that can't be bought wastes the shopper's time and the assistant's trust in your data. Accurate stock keeps you in the answers that lead to sales.",
          pitfall:
            "Removing out-of-stock products from the feed and the page entirely. Mark them out of stock, keep the price visible, and use preorder or backorder with an availability date where that's true.",
          sources: [MC_SPEC, OPENAI_FEED_SPEC, GOOGLE_UCP_FAQ],
        },
        {
          id: "c-agentic-checkout",
          term: "Agentic checkout protocols",
          summary: "OpenAI and Stripe's ACP, Google's UCP, Microsoft's Copilot Checkout and Perplexity's PayPal checkout let shoppers buy inside an assistant, with the merchant as merchant of record.",
          explanation:
            "Several platforms now document a way for the assistant to complete the purchase. They share one design choice: you stay the seller.\n\n- **Agentic Commerce Protocol (ACP)**, developed by Stripe and OpenAI: \"An open standard for programmatic commerce flows between buyers, AI agents, and businesses.\" OpenAI's docs say \"OpenAI is not the merchant of record in the Agentic Commerce Protocol.\" Its merchant page says shoppers are sent to your site or app by default, \"with no fees for purchases made on your site or app.\"\n- **Universal Commerce Protocol (UCP)**, Google's open standard, lets merchants \"enable agentic actions on AI Mode in Google Search and Gemini, starting with direct buying\". Entry is through a waitlist, and Google says the native integration \"doesn't influence how we rank your offers in product listings.\"\n- **Copilot Checkout** from Microsoft: for now \"only English-language merchants who sell to US buyers are eligible\".\n- **Perplexity** runs checkout through PayPal, with retailers as the merchant of record.",
          whyItMatters:
            "Checkout inside an assistant runs on your product data in real time. The groundwork in this lesson (accurate feeds, policies and stock) is what these protocols build on.",
          pitfall:
            "Rebuilding checkout before the basics are right. Google says its native integration doesn't change ranking, so a clean feed and accurate pages come first; the protocols are worth planning once those are in place.",
          sources: [ACP_SITE, OPENAI_ACP_CONCEPTS, OPENAI_MERCHANTS, GOOGLE_UCP, GOOGLE_UCP_FAQ, MS_AGENTIC, PPLX_SHOPPING_PAYPAL],
        },
      ],
      check: [
        {
          kind: "choice",
          id: "q-checkout-mor",
          prompt: "When a shopper buys through ChatGPT using the Agentic Commerce Protocol, who is the merchant of record?",
          options: ["OpenAI", "Stripe", "The merchant", "The shopper's bank"],
          answer: 2,
          explanation:
            "OpenAI's docs say it is not the merchant of record: the merchant accepts or declines the order and charges payment with its own processor. Google, Microsoft and Perplexity describe the same arrangement.",
        },
        {
          kind: "blank",
          id: "q-checkout-price",
          prompt: "Complete Merchant Center's price requirement.",
          text: "Submit an amount and ___ that match the price on your ___ page and the checkout pages.",
          answers: ["currency", "landing"],
          distractors: ["tax", "home", "category"],
          explanation: "The price in your product data must match the landing page and checkout, in the same currency.",
        },
        {
          kind: "passage",
          id: "q-checkout-stock",
          prompt: "Larkfield's Jasmine Pearls have sold out. Which approach follows the guidance in this lesson?",
          passages: [
            "Delete the product from the feed and take the page down until new stock arrives.",
            "Set availability to out of stock in the feed and markup, keep the page live with the price visible, and switch to backorder with an availability date if restocking is confirmed.",
          ],
          answer: 1,
          explanation:
            "Merchant Center says an out-of-stock item's price must still be clearly visible on the landing page, and backorder needs an availability date. Keeping the page keeps its history and reviews.",
        },
      ],
    },
  ],

  exercise: {
    id: "x-larkfield-market",
    title: "Put Larkfield Tea on the shelf",
    brief:
      "Larkfield Tea (made up) sells loose-leaf tea from its own site, in pounds to UK shoppers and in dollars to US shoppers. It wants its Breakfast Blend to show up when people ask AI assistants for tea. You'll choose the markup, fix it, write a feed row and set up the price process.",
    steps: [
      {
        kind: "choice",
        id: "x-step-class",
        prompt: "Shoppers can buy the Breakfast Blend directly on its product page. Which Google markup class should the page use?",
        options: [
          "Product snippet, because it has reviews",
          "Merchant listing, with a Product and a nested Offer",
          "Organization only",
          "No markup: Google says AI features need none",
        ],
        answer: 1,
        explanation:
          "The site is the seller, so the page qualifies for merchant listing experiences, and its required properties also make it eligible for product snippets. Google says no special markup is needed for AI features, but merchant listing markup is ordinary product markup that helps Google read and verify the page.",
      },
      {
        kind: "spot",
        id: "x-step-markup",
        prompt: "Here's Larkfield's first draft of the markup. Which line stops the page qualifying for merchant listings?",
        language: "json",
        lines: [
          "\"@type\": \"Product\",",
          "\"name\": \"Breakfast Blend loose-leaf tea, 250 g tin\",",
          "\"image\": \"https://larkfieldtea.example/img/breakfast-250.jpg\",",
          "\"offers\": { \"@type\": \"Offer\", \"price\": 0, \"priceCurrency\": \"GBP\" }",
        ],
        answer: 3,
        explanation:
          "Merchant listing experiences require a price greater than zero. The page shows £24.00, so the markup should say 24.00, generated from the same record as the page.",
      },
      {
        kind: "blank",
        id: "x-step-feed",
        prompt: "Larkfield is approved for ChatGPT's product feed. Fill in the row for the US price of $31.00, in stock.",
        text: "\"availability\": \"___\", \"price\": \"___\"",
        mono: true,
        answers: ["in_stock", "31.00 USD"],
        distractors: ["InStock", "$31", "N/A"],
        explanation:
          "OpenAI's spec uses the values in_stock, out_of_stock, pre_order, backorder or unknown, and a price in major currency units with an ISO code, like \"79.99 USD\" in its example. Placeholders like N/A aren't allowed.",
      },
      {
        kind: "order",
        id: "x-step-price-change",
        prompt: "Larkfield is raising the Breakfast Blend price. Put the steps in order so no surface shows a stale price for long.",
        items: [
          "Change the price once, in the product record",
          "Publish the page and its markup from that record",
          "Send the new price in the next Merchant Center and ChatGPT feed updates",
          "Check Merchant Center diagnostics for price mismatch issues",
        ],
        explanation:
          "One record feeds everything, so the page, markup and feeds can't disagree. Merchant Center's diagnostics then catch anything that slipped through.",
      },
      {
        kind: "match",
        id: "x-step-routes",
        prompt: "Match each job to the place Larkfield does it.",
        pairs: [
          { term: "Get products into Google's Shopping Graph", definition: "Google Merchant Center feed, with free listings on" },
          { term: "Give Copilot its feed", definition: "Microsoft Merchant Center" },
          { term: "Set a business-wide return policy in markup", definition: "MerchantReturnPolicy nested under Organization" },
        ],
        explanation:
          "Google and Microsoft each have their own Merchant Center, and Google's return policy markup sits under the Organization with hasMerchantReturnPolicy.",
      },
    ],
    debrief:
      "Larkfield now has a product page that qualifies as a merchant listing, a feed row ChatGPT can take as it is, feeds for Google and Microsoft, and one product record behind all of them. None of this is special AI markup. It is ordinary product data, kept accurate and published everywhere assistants read, which is what every shopping surface in this lesson depends on.",
  },

  example: {
    title: "How ChatGPT selects products",
    context:
      "The \"How product results are selected\" and \"Pricing\" sections of OpenAI's help page on shopping with ChatGPT search, fetched on 4 November 2026.",
    excerpt: {
      kind: "quote",
      text: "When determining which products to surface, ChatGPT considers: Structured metadata from first-party and third-party providers (e.g., price, product description) and other third-party content. […] Prices shown in ChatGPT's initial response typically reflect the price from the first merchant listed, which may not be the lowest available price. […] When merchants update their pricing or shipping terms, there may be some delay before it is reflected in the information you see.",
    },
    points: [
      {
        label: "Structured data first",
        text: "The first thing OpenAI lists is structured metadata such as price and product description, from first-party and third-party providers. Your feed and your markup are both kinds of that data.",
      },
      {
        label: "Merchant order matters",
        text: "The first price shown typically comes from the first merchant listed, and merchants are ranked on factors like availability, price, quality and whether they are the maker or primary seller.",
      },
      {
        label: "Lag is admitted",
        text: "OpenAI says price and shipping changes can take time to show. A direct, daily feed narrows that gap for your own products.",
      },
      {
        label: "Dated documentation",
        text: "Shopping features change month to month. Note the date you checked each platform's documentation, as this lesson does.",
      },
    ],
    source: OPENAI_SHOPPING,
  },

  audit: [
    {
      kind: "choice",
      id: "a-market-not-ads",
      prompt: "According to OpenAI, how are ChatGPT's product results chosen?",
      options: [
        "Merchants bid for placement",
        "Independently by ChatGPT, not as ads, using signals such as structured metadata, price and reviews",
        "Only from OpenAI's partner retailers",
        "Alphabetically by brand",
      ],
      answer: 1,
      explanation:
        "OpenAI says product results are selected independently and are not ads, and lists structured metadata from first-party and third-party providers among the inputs.",
    },
    {
      kind: "choice",
      id: "a-market-merchant-listing",
      prompt: "Which page is eligible for Google's merchant listing experiences?",
      options: [
        "A buying guide that links to other shops",
        "A category page listing 40 teas",
        "A product page where shoppers can buy that product from you",
        "A blog post reviewing a competitor's kettle",
      ],
      answer: 2,
      explanation:
        "Only pages where a shopper can buy the product qualify, not pages linking to other sellers, and Google recommends marking up product pages rather than category pages.",
    },
    {
      kind: "match",
      id: "a-market-protocols",
      prompt: "Match each checkout protocol or feature to who runs it.",
      pairs: [
        { term: "Agentic Commerce Protocol", definition: "Developed by Stripe and OpenAI, first used in ChatGPT" },
        { term: "Universal Commerce Protocol", definition: "Google's standard for buying in AI Mode and Gemini" },
        { term: "Copilot Checkout", definition: "Microsoft, for US buyers through approved onboarding paths" },
      ],
      explanation:
        "ACP comes from Stripe and OpenAI, UCP from Google, and Copilot Checkout from Microsoft. In all three, the merchant stays merchant of record.",
    },
    {
      kind: "blank",
      id: "a-market-ratings",
      prompt: "Complete the Merchant Center rule for the product ratings add-on.",
      text: "To activate the product ratings add-on, you need at least ___ reviews across all your products.",
      answers: ["50"],
      distractors: ["5", "10", "500"],
      explanation: "Google also says reviews are matched to products mainly by GTIN, so accurate identifiers matter as much as the count.",
    },
    {
      kind: "spot",
      id: "a-market-feed",
      prompt: "Which line of this ChatGPT feed row breaks OpenAI's spec?",
      language: "json",
      lines: [
        "\"item_id\": \"LK-JAS-100\",",
        "\"title\": \"Jasmine Pearls green tea, 100 g\",",
        "\"brand\": \"Larkfield Tea\",",
        "\"gtin\": \"N/A\",",
        "\"availability\": \"in_stock\",",
        "\"price\": \"18.00 USD\"",
      ],
      answer: 3,
      explanation:
        "OpenAI says not to use placeholder strings such as N/A. If a product has no GTIN, omit the field; never invent one.",
    },
    {
      kind: "passage",
      id: "a-market-price-process",
      prompt: "Which pricing process is better?",
      passages: [
        "Prices live in one product record; the page, markup and all feeds are generated from it, and feeds are sent daily.",
        "Prices are typed into the page, the markup and a feed spreadsheet separately, and the spreadsheet is uploaded monthly.",
      ],
      answer: 0,
      explanation:
        "Merchant Center requires the feed price to match the landing page and checkout, and OpenAI recommends a full feed snapshot at least daily. One record and frequent updates keep everything in step.",
    },
    {
      kind: "order",
      id: "a-market-openai-feed",
      prompt: "Put the steps for getting products into ChatGPT through a direct feed in order.",
      items: [
        "Apply for feed access",
        "Review the product file schema",
        "Validate the required fields for every record",
        "Upload the catalog over SFTP",
        "Upload a full snapshot at least once a day",
      ],
      explanation:
        "Feed onboarding is for approved partners, so applying comes first. Then follow OpenAI's path: review, validate, upload, keep current. (Shopify and Etsy merchants are already integrated.)",
    },
    {
      kind: "choice",
      id: "a-market-return-policy",
      prompt: "Where does Google say a standard, business-wide return policy goes in structured data?",
      options: [
        "MerchantReturnPolicy nested under Organization, using hasMerchantReturnPolicy",
        "In the Product name",
        "In a separate FAQPage",
        "Nowhere: return policies can only be set in ads",
      ],
      answer: 0,
      explanation:
        "Google puts the standard policy under Organization, with product-specific overrides under the Offer.",
    },
    {
      kind: "choice",
      id: "a-market-gtin",
      prompt: "Why do GTINs matter for AI shopping visibility?",
      options: [
        "They are a ranking bonus in ChatGPT",
        "They let platforms match reviews, offers and listings to the right product",
        "They replace the need for a price",
        "They are required for all product snippets",
      ],
      answer: 1,
      explanation:
        "Merchant Center matches reviews mainly by GTIN, and Google asks for all applicable global identifiers in merchant listing markup. Matching joins your data into one product record.",
    },
    {
      kind: "choice",
      id: "a-market-ai-markup",
      prompt: "What does Google say you need to add to appear in AI Overviews and AI Mode?",
      options: [
        "A special AI schema.org type",
        "An llms.txt file listing your products",
        "Nothing special: follow SEO fundamentals, keep markup matching the page and Merchant Center up to date",
        "A Universal Commerce Protocol integration",
      ],
      answer: 2,
      explanation:
        "Google's AI features page says there is no special schema.org markup or machine-readable file to add, and lists keeping structured data matching the page and Merchant Center information up to date among its best practices.",
    },
    {
      kind: "choice",
      id: "a-market-ucp-rank",
      prompt: "Does adopting Google's UCP native checkout improve how Google ranks your offers?",
      options: [
        "Yes, it is a strong ranking signal",
        "No, Google says it doesn't influence ranking; integrated offers get a direct purchase option",
        "Only in the Gemini app",
        "Only for Shopify stores",
      ],
      answer: 1,
      explanation:
        "Google's UCP FAQ says the native integration doesn't influence how offers are ranked in product listings, though integrated offers feature the direct purchase option.",
    },
  ],
};
