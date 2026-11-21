// Lesson 10: local businesses and reviews in AI answers.
// Every claim about Google Business Profile, Google Search, Apple Business,
// Bing Places, ChatGPT search, schema.org and the FTC is tied to a source
// checked on the `accessed` date. Where a platform doesn't document something
// (which listings ChatGPT uses, how Copilot picks local businesses), the lesson
// says so instead of guessing. "NAP" is local SEO shorthand, not a platform
// term. Fernhill Bakery is a made-up shop; its address, phone number,
// coordinates, reviews and replies are invented, its phone number is from the
// 555-01xx fictional range, and its domain uses the reserved .example TLD.

import type { LessonContent, Source } from "../lesson-types";

const ACCESSED = "2026-11-04";

const GBP_LOCAL_RANKING: Source = {
  title: "Tips to improve your local ranking on Google",
  publisher: "Google Business Profile Help",
  url: "https://support.google.com/business/answer/7091",
  accessed: ACCESSED,
};

const GBP_GUIDELINES: Source = {
  title: "Guidelines for representing your business on Google",
  publisher: "Google Business Profile Help",
  url: "https://support.google.com/business/answer/3038177",
  accessed: ACCESSED,
};

const GBP_INFO_SOURCES: Source = {
  title: "Understand how Google sources & uses info in Business Profiles & local search results",
  publisher: "Google Business Profile Help",
  url: "https://support.google.com/business/answer/2721884",
  accessed: ACCESSED,
};

const GBP_MANAGE_REVIEWS: Source = {
  title: "Manage customer reviews",
  publisher: "Google Business Profile Help",
  url: "https://support.google.com/business/answer/3474050",
  accessed: ACCESSED,
};

const GBP_REVIEW_TIPS: Source = {
  title: "Tips to get more reviews",
  publisher: "Google Business Profile Help",
  url: "https://support.google.com/business/answer/3474122",
  accessed: ACCESSED,
};

const GBP_REVIEW_LINK: Source = {
  title: "Create a Google link or QR code to request reviews",
  publisher: "Google Business Profile Help",
  url: "https://support.google.com/business/answer/16816815",
  accessed: ACCESSED,
};

const GBP_REPORT_REVIEWS: Source = {
  title: "Report inappropriate reviews on your Business Profile",
  publisher: "Google Business Profile Help",
  url: "https://support.google.com/business/answer/4596773",
  accessed: ACCESSED,
};

const GBP_THIRD_PARTY: Source = {
  title: "About third-party reviews",
  publisher: "Google Business Profile Help",
  url: "https://support.google.com/business/answer/10286840",
  accessed: ACCESSED,
};

const MAPS_CONTENT_POLICY: Source = {
  title: "Prohibited & restricted content",
  publisher: "Maps User Generated Content Policy Help",
  url: "https://support.google.com/contributionpolicy/answer/7400114",
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

const GOOGLE_LOCAL_BUSINESS: Source = {
  title: "Local business (LocalBusiness) structured data",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/appearance/structured-data/local-business",
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

const GOOGLE_TOP_PLACES: Source = {
  title: "Top Places List",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/appearance/top-places-list",
  date: "2025-12-10",
  dateKind: "updated",
  accessed: ACCESSED,
};

const SCHEMA_BAKERY: Source = {
  title: "Bakery",
  publisher: "Schema.org",
  url: "https://schema.org/Bakery",
  accessed: ACCESSED,
};

const OPENAI_SEARCH_HELP: Source = {
  title: "Searching the web with ChatGPT",
  publisher: "OpenAI Help Center",
  url: "https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt",
  accessed: ACCESSED,
};

const APPLE_CONNECT_GUIDE: Source = {
  title: "Apple Business Connect User Guide: Apple Business Connect is now Apple Business",
  publisher: "Apple Support",
  url: "https://support.apple.com/guide/apple-business-connect/welcome/web",
  accessed: ACCESSED,
};

const APPLE_LOCATION_ATTRIBUTES: Source = {
  title: "Configure location attributes in Apple Business",
  publisher: "Apple Business User Guide",
  url: "https://support.apple.com/guide/business/configure-location-attributes-abcbdc543423/web",
  accessed: ACCESSED,
};

const APPLE_ADD_LOCATION: Source = {
  title: "Add a single location in Apple Business",
  publisher: "Apple Business User Guide",
  url: "https://support.apple.com/guide/business/add-a-single-location-abcb98816a34/web",
  accessed: ACCESSED,
};

const BING_LISTING: Source = {
  title: "Add and manage your business listing",
  publisher: "Microsoft Support",
  url: "https://support.microsoft.com/en-us/bing/add-and-manage-your-business-listing",
  accessed: ACCESSED,
};

const FTC_FINAL_RULE: Source = {
  title: "Federal Trade Commission Announces Final Rule Banning Fake Reviews and Testimonials",
  publisher: "Federal Trade Commission",
  url: "https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials",
  date: "2024-08-14",
  dateKind: "published",
  accessed: ACCESSED,
};

const FTC_RULE_QA: Source = {
  title: "The Consumer Reviews and Testimonials Rule: Questions and Answers",
  publisher: "Federal Trade Commission",
  url: "https://www.ftc.gov/business-guidance/resources/consumer-reviews-testimonials-rule-questions-answers",
  accessed: ACCESSED,
};

export const LESSON_10: LessonContent = {
  intro:
    "This lesson covers questions about a place: a bakery near me, a plumber open now, somewhere to eat tonight. Answers to these questions lean less on articles and more on listings: business profiles, map place cards, structured data and reviews. In this lesson you learn where each platform gets its local facts, how to make those facts consistent, and how to earn and answer reviews without breaking Google's rules or the FTC's.",

  outro:
    "You now know how Google ranks local results and where its AI features get local information, what ChatGPT documents about nearby results, how to claim and clean up your listings on Google, Apple and Bing, how to mark up each location, and how to ask for and answer reviews within the rules. Add a few local questions to your prompt set from Lesson 7, so you can see whether the fixes show up in the answers.",

  groups: [
    {
      id: "g-local-answers",
      title: "How AI answers handle local questions",
      concepts: [
        {
          id: "c-local-ranking",
          quiz: {"kind": "choice", "id": "cq-local-ranking", "prompt": "Which of these does Google say can't improve your local ranking?", "options": ["Requesting or paying for a better ranking", "Adding complete, detailed business information", "Earning more links and reviews", "Becoming better known (prominence)"], "answer": 0, "explanation": "Google says there's no way to request or pay for a better local ranking. Relevance, distance and prominence are what count."},
          term: "Local ranking: relevance, distance, prominence",
          summary:
            "Google says local results are mainly based on how well a business matches the search, how far it is from the searcher, and how well known it is.",
          explanation:
            "When someone searches for a kind of business near them, Google shows local results on Maps and Search. Its Business Profile help explains the ranking in a single line: \"Local results are mainly based on relevance, distance, and popularity.\" The same page then describes three factors:\n\n- **Relevance**: \"how well a Business Profile matches what someone is searching for.\" Complete, detailed business information helps here.\n- **Distance**: how far each business is from the searcher. \"If a customer doesn't share where they are, Google uses what it knows about their location.\"\n- **Prominence**: \"how well-known a business is\", based partly on \"how many websites link to your business and how many reviews you have.\"\n\nThe page uses *popularity* in its summary and *Prominence* as the heading; read them as the same factor. Google is also blunt about shortcuts: \"There's no way to request or pay for a better local ranking on Google.\"",
          whyItMatters:
            "Distance is out of your hands for any one searcher. The work is on the other two: a profile complete enough to match the right searches, and a reputation built from links and reviews.",
          pitfall:
            "Paying anyone who promises a guaranteed spot in local results. Google says there is no way to request or pay for a better local ranking.",
          sources: [GBP_LOCAL_RANKING],
        },
        {
          id: "c-google-ai-local",
          quiz: {"kind": "choice", "id": "cq-google-ai-local", "prompt": "Which tool does Google's AI guide name for helping local businesses be visible in AI responses?", "options": ["Google Business Profiles", "A separate AI Overviews local listing", "A special local AI markup", "A paid AI Mode placement"], "answer": 0, "explanation": "Google's guide names Business Profiles (and Merchant Center for products). It doesn't describe a separate local system for AI Overviews or AI Mode."},
          term: "Local businesses in Google's AI features",
          summary:
            "Google says its generative AI responses can include information about local businesses, and names Business Profiles as a way to be visible in them.",
          explanation:
            "Google's guide to its generative AI features (AI Overviews and AI Mode) has a short section on local businesses. It says: \"Where appropriate, generative AI responses can include product listings, product information, and information about local businesses.\" And it names the tools: \"Using products like Merchant Center (such as Merchant Center feeds) and Google Business Profiles can help your products and services to be visible in both AI responses and other Google Search results.\"\n\nThe guide doesn't describe a separate local ranking system for AI Overviews or AI Mode. What Google does document is how widely profiles travel: it displays them \"on Google Search and Google Maps, as well as third-party websites and applications via APIs such as those on the Google Maps Platform.\"\n\nSo the profile that drives your map results is also the documented route into Google's AI answers for local questions.",
          whyItMatters:
            "For a local business, the Business Profile isn't a side project next to AEO. It is the source Google itself points to for local information in AI responses.",
          pitfall:
            "Treating AI Overviews as a separate channel that needs separate tricks. Google's guide sends local businesses to the same Business Profile they already use for Maps.",
          sources: [GOOGLE_AI_GUIDE, GBP_INFO_SOURCES],
        },
        {
          id: "c-chatgpt-local",
          quiz: {"kind": "choice", "id": "cq-chatgpt-local", "prompt": "Someone in the San Francisco area asks ChatGPT for good restaurants near me. What does OpenAI say ChatGPT may search for?", "options": ["top restaurants San Francisco", "The user's exact street address, taken from their device without asking", "Every restaurant's Google Business Profile", "restaurants near me, with no location"], "answer": 0, "explanation": "OpenAI's example: ChatGPT may estimate a general location from the IP address and rewrite the prompt as top restaurants San Francisco. Precise device location is optional and off by default."},
          term: "Local results in ChatGPT",
          summary:
            "ChatGPT search can use an approximate or shared location to find nearby businesses, may show a map, and gets business listings from third-party providers it doesn't name.",
          explanation:
            "OpenAI's help page on ChatGPT search says it \"can also use location information to find local results, including restaurants, news, and weather.\" What it documents:\n\n- **Location**: ChatGPT may estimate a general location from the IP address. OpenAI's example: for *what are some good restaurants near me* from someone in the San Francisco area, it may rewrite the prompt into the search query *top restaurants San Francisco*. Sharing precise device location is optional and off by default.\n- **Maps**: \"On iOS and Android, relevant results may also include a map.\"\n- **Listings**: \"ChatGPT may share your location with trusted third-party providers that help provide more local information, such as nearby business listings or weather reports.\" The page doesn't name the providers.\n- **Reservations**: for restaurants, it \"may show availability from OpenTable, Resy, or Yelp\", depending on the restaurant.\n\nBecause OpenAI doesn't say which listings database it uses, this lesson doesn't name one. The practical response is to keep your details accurate everywhere listings are drawn from.",
          whyItMatters:
            "Notice the rewrite: a near-me question becomes an ordinary search for a category and a city. A business that is clearly described as that category in that city, across its listings, is easier to find in that search.",
          pitfall:
            "Telling a client that ChatGPT reads their Google Business Profile directly. OpenAI's help page doesn't say where its business listings come from, so any single-source claim is a guess.",
          sources: [OPENAI_SEARCH_HELP],
        },
        {
          id: "c-info-sources",
          quiz: {"kind": "choice", "id": "cq-info-sources", "prompt": "Which of these is NOT among the sources Google lists for building a business profile?", "options": ["How much the business spends on Google Ads", "Crawled content from the business's website", "Licensed data from third parties", "Photos and reviews contributed by users"], "answer": 0, "explanation": "Google lists public web content, licensed third-party data, user contributions and its own interactions with the business. Ad spend isn't one of them."},
          term: "Where business information comes from",
          summary:
            "Google builds business profiles from websites, licensed data, user contributions and its own interactions with the business, not only from what the owner enters.",
          explanation:
            "Google lists where profile information is compiled from:\n\n- \"Publicly-available information, such as crawled web content (e.g., information from a business' official website)\"\n- \"Licensed data from third parties\"\n- Users who contribute facts and content such as photos and reviews, \"including business owners who claim profiles through Google Business Profile\"\n- \"Information based on Google's interactions with a local place or business\"\n\nSo a profile can show things you never added. Google's example is \"a link to your menu or photos customers have uploaded of meals they've enjoyed.\" Categories work the same way: \"Google can also detect category information from your website and from mentions about your business throughout the web.\"",
          whyItMatters:
            "Your website and other listings feed the profile. If they disagree with what you entered, you are asking Google to choose between your own sources.",
          pitfall:
            "Fixing the profile and leaving an old address in the website footer or on a directory. Crawled web content and licensed third-party data are both sources Google names.",
          sources: [GBP_INFO_SOURCES, GBP_GUIDELINES],
        },
      ],
      check: [
        {
          kind: "choice",
          id: "q-local-factors",
          prompt: "Which three factors does Google say local results are mainly based on?",
          options: [
            "Relevance, distance and prominence",
            "Ad spend, review count and page speed",
            "Distance, opening hours and price",
            "Relevance, schema markup and domain age",
          ],
          answer: 0,
          explanation:
            "Google's Business Profile help names relevance, distance and prominence (called popularity in its summary line), and says there's no way to request or pay for a better local ranking.",
        },
        {
          kind: "match",
          id: "q-local-platforms",
          prompt: "Match each surface to what its owner documents about local information.",
          pairs: [
            {
              term: "Google AI Overviews and AI Mode",
              definition: "Business Profiles can help you be visible in AI responses",
            },
            {
              term: "ChatGPT search",
              definition: "Location from IP or device; listings from unnamed third-party providers",
            },
            {
              term: "Google local results",
              definition: "Mainly relevance, distance and prominence",
            },
            {
              term: "Google Business Profile data",
              definition: "Compiled from websites, licensed data, users and Google's own interactions",
            },
          ],
          explanation:
            "Google's AI guide points to Business Profiles, OpenAI's help page describes location use and third-party listings providers, and Google's help pages describe local ranking factors and where profile data comes from.",
        },
        {
          kind: "choice",
          id: "q-chatgpt-source",
          prompt: "A client says ChatGPT pulls local results straight from Google Business Profile. What does OpenAI's help page actually say?",
          options: [
            "It confirms that ChatGPT uses Google Business Profile",
            "It says ChatGPT may share location with trusted third-party providers for business listings, without naming them",
            "It says ChatGPT doesn't show local results",
            "It says ChatGPT uses Bing Places only",
          ],
          answer: 1,
          explanation:
            "OpenAI documents that ChatGPT may share location with trusted third-party providers that supply things like nearby business listings, but it doesn't name them. Anything more specific is unconfirmed.",
        },
      ],
    },
    {
      id: "g-listings",
      title: "Your listings on Google, Apple and Bing",
      concepts: [
        {
          id: "c-gbp-basics",
          quiz: {"kind": "passage", "id": "cq-gbp-basics", "prompt": "A plumber works from home and travels to customers. Which setup follows Google's guidelines?", "passages": ["Hide the home address and set a service area instead, with one profile for the business.", "Show the home address, and add a second profile in the next town to reach more customers."], "answer": 0, "explanation": "A service-area business that travels to customers should hide a home address and set a service area, and Google allows only one profile per business."},
          term: "Google Business Profile basics",
          summary:
            "Verify the profile, then make it complete and accurate: address or service area, hours, category and attributes, with one profile per business.",
          explanation:
            "Google's local ranking tips start with two steps. **Verify your business**: it \"tells Google that you're authorized to represent the business, so it's more likely to show up in search results.\" Then **keep it complete and accurate**: \"Businesses with complete and accurate info are more likely to show up in local search results.\" Google lists the details to add: your full address if customers can visit, hours including special hours, your category, and attributes such as parking or Wi-Fi.\n\nThe guidelines add rules that keep a profile live:\n\n- \"There should only be one profile per business\".\n- Pick categories that complete the statement *This business IS a*, not *this business HAS a*, and use \"as few categories as possible\" to describe the core business.\n- A service-area business that travels to customers should hide a home address and set a service area instead.\n- A rented virtual office isn't eligible, and a business that shows its address should keep permanent signage there.",
          whyItMatters:
            "Every AI surface that leans on Google's local data inherits whatever the profile says. A wrong category or missing hours becomes a wrong answer.",
          pitfall:
            "Creating a second profile for the same location to target another keyword or neighborhood. Google allows one profile per business, and duplicates can cause problems with how your information displays on Maps and Search.",
          sources: [GBP_LOCAL_RANKING, GBP_GUIDELINES],
        },
        {
          id: "c-business-name",
          quiz: {"kind": "choice", "id": "cq-business-name", "prompt": "What does Google say can happen if you include unnecessary information, such as keywords, in your business name?", "options": ["Your Business Profile can be suspended", "Your profile ranks higher for those keywords", "Google moves the keywords into the description for you", "Nothing, as long as the real name comes first"], "answer": 0, "explanation": "Google says unnecessary information in the name isn't permitted and could result in suspension of the profile."},
          term: "The business name field",
          summary:
            "Use the real-world name only. Keywords, taglines, locations and hours in the name break Google's rules, and Apple's display name rules say the same.",
          explanation:
            "Google says the name \"should reflect your business's real-world name, as used consistently on your storefront, website, stationery, and as known to customers.\" Its list of what a name must not include covers marketing taglines, store codes, trademark signs, fully capitalized words, hours, phone numbers or URLs, service or product information, and location information. The other details belong in their own fields.\n\nThe penalty is stated plainly: \"Including unnecessary information in your business name isn't permitted, and could result in the suspension of your Business Profile.\"\n\nApple's display name rules match. The name \"Needs to match the name on the storefront, signage, or official website\" and \"Can't contain descriptions or any other strings.\"",
          whyItMatters:
            "Keyword-stuffed names are the classic local spam move. They risk suspension, and a suspended profile can't feed any answer.",
          example: {
            kind: "before-after",
            before: "Fernhill Bakery | Best Sourdough in Portland | Open 7am",
            after: "Fernhill Bakery",
            note: "Fernhill Bakery is made up. Sourdough belongs in the description and products, Portland in the address, and 7am in the hours.",
          },
          pitfall:
            "Copying a competitor whose keyword-stuffed name hasn't been caught yet. The rule applies to you either way, and so does the suspension risk.",
          sources: [GBP_GUIDELINES, APPLE_LOCATION_ATTRIBUTES],
        },
        {
          id: "c-apple-business",
          quiz: {"kind": "choice", "id": "cq-apple-business", "prompt": "Another organization already manages your location in Apple Business. What does Apple let you do?", "options": ["Request a transfer, with documents such as a business license or utility bill", "Create a second place card for the same location", "Move the map pin to your parking lot entrance", "Nothing: a managed location can't change hands"], "answer": 0, "explanation": "Apple says you can request a transfer of a location another organization manages, with documents such as a business license or utility bill."},
          term: "Apple Business (formerly Business Connect)",
          summary:
            "Apple Business Connect is now part of Apple Business, where you claim each location and manage the place card shown in Maps, Siri and other Apple apps.",
          explanation:
            "Apple has folded Business Connect into one product: the Business Connect user guide now says it is part of Apple Business. Locations are managed under Brands > Locations.\n\nThe place card is the listing. Apple says it \"appears in many parts of Apple's software, from Maps to Siri to Calendar, Messages, and more.\" For each location you set:\n\n- **Display name**, following the rules in the previous concept.\n- **Address**: \"The address officially listed on your website\", and the one customers use to find you.\n- **Coordinates**: \"on top of the building, centered over your location\", not on the sidewalk, the road or the parking lot entrance.\n- **Hours** (including special hours), phone, website and primary category.\n\nIf a location already exists on Maps, you may be able to verify it by a phone call to the number Apple has on record. If another organization already manages it, you can request a transfer with documents such as a business license or utility bill.",
          whyItMatters:
            "The place card is what Apple shows for your business across its apps. Apple says place cards display content based on data from the Apple ecosystem and related partners, so an unclaimed card shows what others supplied, not what you checked.",
          pitfall:
            "Dropping the map pin on the front door or the parking lot. Apple wants the coordinates on top of the building, centered over the location.",
          sources: [APPLE_CONNECT_GUIDE, APPLE_LOCATION_ATTRIBUTES, APPLE_ADD_LOCATION],
        },
        {
          id: "c-bing-places",
          quiz: {"kind": "choice", "id": "cq-bing-places", "prompt": "What does Microsoft's support page say Bing Places for Business is for?", "options": ["Claiming or updating your listing in Bing Maps search results", "Choosing which local businesses Copilot recommends", "Sending a product feed to Copilot", "Reporting reviews on Google Maps"], "answer": 0, "explanation": "Microsoft's page only says Bing Places is how you claim or update your listing in Bing Maps results. How Copilot picks local businesses isn't explained there."},
          term: "Bing Places",
          summary: "Microsoft says to use Bing Places for Business to claim or update the listing that appears in Bing Maps results.",
          explanation:
            "Microsoft's support page is short: \"To add or change information about your business in Bing Maps search results, use Bing Places for Business to claim or update your business listing.\" It adds that \"Some features and functionality described here may not be available in your country or region.\"\n\nThat is the Microsoft listing to claim. The Microsoft pages checked for this lesson don't explain how Copilot chooses local businesses, or whether it reads Bing Places directly, so treat claims about that as unconfirmed. What you can control is that the Bing Maps listing matches your website and your Google and Apple listings.",
          whyItMatters:
            "It takes a few minutes to check, and it removes one more place where an old phone number or old hours can live on.",
          pitfall:
            "Repeating vendor claims about how Copilot uses Bing Places as if Microsoft had said them. Microsoft's support page only says Bing Places manages the listing in Bing Maps results.",
          sources: [BING_LISTING],
        },
        {
          id: "c-nap",
          quiz: {"kind": "spot", "id": "cq-nap", "prompt": "Which of these (made-up) listings breaks NAP consistency?", "language": "text", "lines": ["Website footer: Fernhill Bakery, 214 Alder Street, (503) 555-0142", "Google: Fernhill Bakery, 214 Alder Street, (503) 555-0142", "Apple Maps: Fernhill Bakery, 212 Alder Street, (503) 555-0142", "Bing Maps: Fernhill Bakery, 214 Alder Street, (503) 555-0142"], "answer": 2, "explanation": "The Apple Maps listing gives 212 Alder Street instead of 214. A wrong street number is exactly the kind of detail an answer could repeat."},
          term: "Consistent name, address and phone (NAP)",
          summary:
            "Use the same name, address and phone number on your site, your profiles and directories, because platforms build listings from all of them.",
          explanation:
            "Local SEO calls this NAP consistency: the same name, address and phone number everywhere. NAP is industry shorthand, not a term Google or Apple uses, but both ask for the same thing:\n\n- Google: \"Represent your business as it's consistently represented and recognized in the real world across signage, stationery, and other branding.\"\n- Google on phone numbers: give one that connects to the individual location, and \"Use a local phone number instead of a central call center helpline number whenever possible.\"\n- Apple: the address should be \"The address officially listed on your website\".\n\nGoogle also says it \"determines how best to display your business address based on your business information and information from other sources.\" When those other sources disagree with you, you lose some control of that decision.",
          whyItMatters:
            "Answers repeat the facts they find. If three sources give three phone numbers, any of them can end up in front of a customer.",
          example: {
            kind: "before-after",
            before:
              "Website footer: Fernhill Bakery Co., 214 Alder St, Suite B, (503) 555-0199\nGoogle: Fernhill Bakery, 214 Alder Street, (503) 555-0142\nApple Maps: Fern Hill Bakery, 212 Alder Street, (503) 555-0142",
            after:
              "Website footer: Fernhill Bakery, 214 Alder Street, (503) 555-0142\nGoogle: Fernhill Bakery, 214 Alder Street, (503) 555-0142\nApple Maps: Fernhill Bakery, 214 Alder Street, (503) 555-0142",
            note: "All made up. The old suite, the old phone number and the wrong street number are exactly the details an answer could repeat.",
          },
          pitfall:
            "Moving or changing the phone number and updating only Google. Update the website, Apple, Bing and the main directories on the same day, from a written list of everywhere the business is listed.",
          sources: [GBP_GUIDELINES, APPLE_LOCATION_ATTRIBUTES],
        },
      ],
      check: [
        {
          kind: "spot",
          id: "q-listings-name",
          prompt: "Which Business Profile name breaks Google's guidelines?",
          language: "text",
          lines: ["Fernhill Bakery", "Shelly's Coffee", "Fernhill Bakery - Best Sourdough Portland", "Regal Pizzeria"],
          answer: 2,
          explanation:
            "Google doesn't allow service or product information or location information in the name. Shelly's Coffee and Regal Pizzeria are examples from Google's own guidelines of names entered correctly.",
        },
        {
          kind: "blank",
          id: "q-listings-category",
          prompt: "Complete Google's test for choosing a category.",
          text: "Select categories that complete the statement: This business ___ a, rather than: this business ___ a.",
          answers: ["IS", "HAS"],
          distractors: ["SELLS", "OFFERS"],
          explanation:
            "A category describes what the business is (a bakery), not everything it has (a coffee machine, Wi-Fi). Use as few categories as possible.",
        },
        {
          kind: "choice",
          id: "q-listings-apple-pin",
          prompt: "Where does Apple want a location's latitude and longitude?",
          options: [
            "On top of the building, centered over the location",
            "On the front door customers use",
            "On the parking lot entrance",
            "On the nearest intersection",
          ],
          answer: 0,
          explanation:
            "Apple's guidelines put the coordinates on top of the building, centered over the location, and rule out the sidewalk, the road, the nearest intersection and access points such as doors or parking entrances.",
        },
      ],
    },
    {
      id: "g-markup",
      title: "LocalBusiness markup on your site",
      concepts: [
        {
          id: "c-localbusiness-markup",
          quiz: {"kind": "blank", "id": "cq-localbusiness-markup", "prompt": "Complete Google's advice for the telephone property in LocalBusiness markup.", "text": "Be sure to include the ___ code and area code in the phone number.", "answers": ["country"], "distractors": ["postal", "extension", "store"], "explanation": "Google asks for the country code and the area code, as in +1-503-555-0142 in the example."},
          term: "LocalBusiness structured data",
          summary:
            "Mark up each location with the most specific LocalBusiness subtype, a name and full address, plus hours, phone, coordinates and the location's own URL.",
          explanation:
            "Google's Local Business documentation says markup lets you \"tell Google about business hours, different departments within a business, reviews (if your site captures reviews about other businesses), and more.\"\n\nThe rules worth knowing:\n\n- **Type**: \"Define each local business location as a LocalBusiness type.\" Use \"the most specific LocalBusiness sub-type possible\". On schema.org, Bakery sits under LocalBusiness, then FoodEstablishment.\n- **Required**: `name` and `address`, a PostalAddress with as many properties as you can provide.\n- **Recommended**: `geo`, where \"The precision must be at least 5 decimal places.\"; `telephone`, where Google says \"Be sure to include the country code and area code in the phone number.\"; `url` for the specific location; `openingHoursSpecification`; and `menu` or `priceRange` where they fit.\n\nGoogle also says \"Since LocalBusiness is a subtype of Organization, we recommend following the fields for Organization\", which you met in Lesson 4.",
          whyItMatters:
            "Markup states the same facts as your profiles in a form machines can read without guessing, on the site that Google names as one of its sources for business information.",
          example: {
            kind: "code",
            language: "json",
            caption: "A block for the made-up Fernhill Bakery's location page; the address, phone and coordinates are invented",
            code: `{
  "@context": "https://schema.org",
  "@type": "Bakery",
  "name": "Fernhill Bakery",
  "url": "https://www.fernhillbakery.example/locations/alder-street",
  "telephone": "+1-503-555-0142",
  "image": "https://www.fernhillbakery.example/photos/storefront.jpg",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "214 Alder Street",
    "addressLocality": "Portland",
    "addressRegion": "OR",
    "postalCode": "97205",
    "addressCountry": "US"
  },
  "geo": { "@type": "GeoCoordinates", "latitude": 45.51912, "longitude": -122.68127 },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "07:00",
      "closes": "15:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Saturday", "Sunday"],
      "opens": "08:00",
      "closes": "14:00"
    }
  ],
  "priceRange": "$"
}`,
          },
          pitfall:
            "Marking up only the home page of a business with several locations. Google asks you to define each location as its own LocalBusiness, ideally on its own page with its own URL, phone and hours.",
          sources: [GOOGLE_LOCAL_BUSINESS, SCHEMA_BAKERY, GBP_INFO_SOURCES],
        },
        {
          id: "c-markup-ratings",
          quiz: {"kind": "choice", "id": "cq-markup-ratings", "prompt": "Which site does Google recommend use aggregateRating in LocalBusiness markup?", "options": ["A city guide that reviews many local bakeries", "A bakery showing its own Google rating on its site", "A bakery whose reviews widget adds the rating automatically", "Any business with a rating above 4"], "answer": 0, "explanation": "Rating properties on LocalBusiness are only recommended for sites that capture reviews about other local businesses. A business controlling reviews about itself, even through a widget, isn't eligible for stars."},
          term: "Ratings in your own markup",
          summary:
            "Google recommends review and aggregateRating on LocalBusiness only for sites that capture reviews about other local businesses, not for a business rating itself.",
          explanation:
            "It's tempting to copy your Google star rating into your own LocalBusiness markup. Google's documentation says no: for both `aggregateRating` and `review`, \"This property is only recommended for sites that capture reviews about other local businesses\".\n\nThe review snippet guidelines give the reason: \"If the entity that's being reviewed controls the reviews about itself, their pages that use LocalBusiness or any other type of Organization structured data are ineligible for star review feature.\" That includes reviews shown \"through an embedded third-party widget\". A city guide reviewing many bakeries can mark up its ratings; the bakery's own site shouldn't.",
          whyItMatters:
            "Self-serving rating markup earns no stars, and Google says sites that break its Local Business guidelines may get a manual action. Let the reviews live on Google, Apple and review sites.",
          pitfall:
            "Installing a reviews widget that quietly adds AggregateRating markup for your own business. Check what plugins output, not only what you wrote.",
          sources: [GOOGLE_LOCAL_BUSINESS, GOOGLE_REVIEW_SNIPPET],
        },
        {
          id: "c-location-pages",
          quiz: {"kind": "passage", "id": "cq-location-pages", "prompt": "Fernhill (made up) has three bakeries. Which setup follows the card?", "passages": ["All three Business Profiles link to the home page, which lists the three addresses.", "Each bakery has its own page with its address, phone, hours and markup, and each bakery's profile links to that page."], "answer": 1, "explanation": "Google's markup url is the specific location's URL, and its profile rules ask for a website that represents the individual location. Without location pages, each branch's facts live only on platforms you don't control."},
          term: "One page per location",
          summary:
            "Give each location its own page with its own address, phone, hours and markup, and link that location's profiles to it.",
          explanation:
            "Google's markup rules and profile rules point the same way. In markup, `url` is \"The fully-qualified URL of the specific business location. The URL must be a working link.\" In the profile guidelines: \"Provide a phone number that connects to your individual business location, or provide a website that represents your individual business location.\"\n\nA good location page answers the practical questions in plain text: address, hours, parking, phone, what is sold or offered there. Those are the same facts the markup and the profiles state, kept in one place you control.",
          whyItMatters:
            "Without location pages, every profile points to the home page, and the facts for each branch exist only on platforms you don't control.",
          pitfall:
            "Building near-identical pages for towns where the business has no location. Location pages describe real locations, with the same details as that location's profile.",
          sources: [GOOGLE_LOCAL_BUSINESS, GBP_GUIDELINES],
        },
      ],
      check: [
        {
          kind: "spot",
          id: "q-markup-spot",
          prompt: "Which line of Fernhill's LocalBusiness markup misses Google's guidance?",
          language: "json",
          lines: [
            "\"@type\": \"Bakery\",",
            "\"name\": \"Fernhill Bakery\",",
            "\"telephone\": \"+1-503-555-0142\",",
            "\"geo\": { \"@type\": \"GeoCoordinates\", \"latitude\": 45.52, \"longitude\": -122.68 },",
          ],
          answer: 3,
          explanation:
            "Google says latitude and longitude need a precision of at least 5 decimal places. Bakery is a specific LocalBusiness subtype, and the phone number includes the country and area codes.",
        },
        {
          kind: "choice",
          id: "q-markup-rating",
          prompt: "Fernhill wants to add its 4.8 Google rating as aggregateRating in the LocalBusiness markup on its own site. What does Google's documentation say?",
          options: [
            "Do it; it is a required property",
            "It is only recommended for sites that capture reviews about other local businesses, so Fernhill's own pages aren't eligible for star features",
            "It is fine if the rating comes from an embedded Google reviews widget",
            "It is fine if the rating is above 4",
          ],
          answer: 1,
          explanation:
            "Rating properties on LocalBusiness are for sites reviewing other businesses. When a business controls the reviews about itself, including through an embedded widget, its pages are ineligible for star review features.",
        },
        {
          kind: "blank",
          id: "q-markup-required",
          prompt: "Complete Google's required properties for LocalBusiness.",
          text: "Google requires two properties: the business ___ and its physical ___.",
          answers: ["name", "address"],
          distractors: ["geo", "telephone", "aggregateRating"],
          explanation:
            "Only name and address are required. Geo, telephone, url, hours and the rest are recommended, and worth adding when you can state them accurately.",
        },
      ],
    },
    {
      id: "g-reviews",
      title: "Reviews and review platforms",
      concepts: [
        {
          id: "c-review-rules",
          quiz: {"kind": "choice", "id": "cq-review-rules", "prompt": "Which kind of review incentive does the FTC rule specifically target?", "options": ["Incentives conditioned on the review expressing a particular sentiment", "Any review link printed on a receipt", "Thank-you emails sent after a purchase", "Public replies to negative reviews"], "answer": 0, "explanation": "The FTC rule covers incentives conditioned on a particular sentiment, positive or negative. Google goes further and bans incentives for any review, so follow the stricter rule."},
          term: "Review rules: Google and the FTC",
          summary:
            "Google bans any incentive for reviews and selective asking; the FTC's rule bans fake reviews, sentiment-conditioned incentives, undisclosed insider reviews and review suppression.",
          explanation:
            "Two sets of rules apply in the US, and they aren't identical.\n\n**Google Maps** treats incentives as fake engagement: \"Offering incentives, like free or discounted goods or services, in exchange for customers to post reviews, change reviews, or remove negative reviews is considered fake & misleading content and is strictly prohibited.\" Its content policy also removes \"Content that is based on a conflict of interest\" (employees, family, competitors), and bars merchants from asking staff to collect a set number of reviews, pressuring customers to review while on the premises, and asking for specific content. Merchants may not \"Discourage or prohibit negative reviews, or selectively solicit positive reviews from customers\".\n\n**The FTC's rule**, which \"went into effect on October 21, 2024\", covers fake reviews \"such as AI-generated fake reviews\", buying or selling fake reviews, \"compensation or other incentives conditioned on the writing of consumer reviews expressing a particular sentiment, either positive or negative\", undisclosed reviews by company insiders, and suppressing reviews with groundless legal threats, physical threats or intimidation. The FTC says the rule \"authorizes courts to impose civil penalties for knowing violations\".\n\nNote the gap: the FTC rule targets incentives tied to a sentiment, while Google bans incentives for any review. Follow the stricter rule.",
          whyItMatters:
            "Google says more reviews and positive ratings can help local ranking, which is exactly why shortcuts are tempting. Reviews that break these rules can be removed, and the FTC rule adds the risk of civil penalties.",
          pitfall:
            "Offering a discount to every customer who leaves a review, good or bad. It isn't tied to a sentiment, but Google's policy still prohibits it.",
          sources: [GBP_REVIEW_TIPS, MAPS_CONTENT_POLICY, FTC_FINAL_RULE, FTC_RULE_QA, GBP_LOCAL_RANKING],
        },
        {
          id: "c-asking-reviews",
          quiz: {"kind": "spot", "id": "cq-asking-reviews", "prompt": "Which step in this (made-up) review plan breaks Google's policy?", "language": "text", "lines": ["Print the review QR code on receipts", "Add the review link to every thank-you email", "Send only 4- and 5-star survey responders on to Google", "Ask every customer the same way, with no reward"], "answer": 2, "explanation": "Passing only happy customers on to Google is selective solicitation, which Google's policy doesn't allow. Ask everyone the same way."},
          term: "Asking for reviews",
          summary: "Ask every customer the same way, with no reward, using Google's review link or QR code.",
          explanation:
            "Each Business Profile has a review link and QR code. Google suggests putting them on receipts, in thank-you emails, at the end of a chat, or printed in the store. What its policy allows is soliciting content \"that does represent a genuine experience, without offering incentives to do so or attempting to influence the rating or the contents of the review.\"\n\nOn asking only happy customers, the FTC's staff answer is cautious: \"The rule does not contain a specific prohibition against such conduct. But this practice could violate the FTC Act.\" Google is clearer still: selectively soliciting positive reviews isn't allowed.\n\nSo ask everyone, the same way, and let the mix fall where it falls. Google's own tips say \"A mix of positive and negative feedback often feels more trustworthy.\"",
          whyItMatters:
            "A steady flow of honest reviews keeps the profile current, and Google says more reviews and positive ratings can help a business's local ranking.",
          pitfall:
            "A post-purchase survey that sends only the 4- and 5-star responders on to Google. That is selective solicitation, which Google's policy doesn't allow.",
          sources: [GBP_REVIEW_LINK, MAPS_CONTENT_POLICY, FTC_RULE_QA, GBP_REVIEW_TIPS, GBP_LOCAL_RANKING],
        },
        {
          id: "c-responding",
          quiz: {"kind": "choice", "id": "cq-responding", "prompt": "What must a business do before it can reply to reviews on its Google profile?", "options": ["Verify the profile", "Get the reviewer's permission", "Report the review first", "Offer the reviewer a discount"], "answer": 0, "explanation": "You must verify the profile before you can reply. Offering deals in replies is something Google says not to do."},
          term: "Responding to reviews",
          summary:
            "Reply as the verified business: short, specific and polite, never sharing private details, making threats or making false accusations.",
          explanation:
            "You must verify the profile before you can reply. Google checks each reply against its content policies, posts it publicly under the review as the business, and notifies the reviewer, who can still change their review afterwards.\n\nGoogle's tips: be professional and polite, keep it short, don't send the same thank-you to everyone, and be conversational rather than promotional. For negative reviews: \"Never share a reviewer's private information or engage in personal attacks\", acknowledge real mistakes, explain what you can and can't do, apologize when appropriate, and reply promptly.\n\nThe FTC adds a legal edge. You can respond publicly, but \"you should watch what you say\": the rule prohibits accusations about the reviewer that you know are false (or make with reckless disregard for the truth), and threats or intimidation to get a review removed or changed.\n\nReport a review only when it breaks Google's policies: \"Do not report a review just because you disagree with it or dislike it.\"",
          whyItMatters:
            "Replies are public text on your profile. They show future customers how the business handles problems, long after the original complaint.",
          example: {
            kind: "before-after",
            before:
              "We have no record of you ever ordering here. Fake reviews like this will be passed to our lawyers.",
            after:
              "Thanks for telling us, Sam, and I'm sorry the croissants were gone by 10. We now bake a second batch at 11 on weekends. If you'd like to talk it over, email me at hello@fernhillbakery.example. Maya, owner",
            note: "Both replies are made up. The first accuses and threatens, which the FTC rule restricts when the accusation is knowingly false or the threat is groundless. The second is short, specific and gives a real update.",
          },
          pitfall:
            "Answering a negative review with a discount. Google says not to use replies to offer deals or promotions, and an incentive to remove a negative review is banned outright.",
          sources: [GBP_MANAGE_REVIEWS, GBP_REVIEW_TIPS, GBP_REPORT_REVIEWS, FTC_RULE_QA],
        },
        {
          id: "c-review-platforms",
          quiz: {"kind": "blank", "id": "cq-review-platforms", "prompt": "Complete Google's bar for lists in its Top Places List documentation.", "text": "The list must be curated by the content provider, be genuine, independent, and not ___.", "answers": ["sponsored"], "distractors": ["indexed", "translated", "dated"], "explanation": "Google only counts top lists that are genuine, independent and not sponsored, so paying for a place on a best-of list doesn't qualify."},
          term: "Third-party reviews and top lists",
          summary:
            "Your Google profile can show reviews from other sites and, in the US, editorial top lists, so reputation on review sites and local guides shows up there too.",
          explanation:
            "Not every review on your profile comes from Google. Google says a profile \"may show customer reviews from trusted, non-Google sources, such as travel or local review sites.\" Owners can't pick or block them: \"You can't choose which website a review comes from. You can't stop reviews from other websites.\" Problems with those reviews go to the other site.\n\nGoogle can also show lists that mention you. In the US, profiles may display editorial top lists from the web, and Search Central's Top Places List documentation sets the bar for them: \"The list must be curated by the content provider, be genuine, independent, and not sponsored.\"\n\nOther assistants have their own partners too: ChatGPT's help page names OpenTable, Resy and Yelp for restaurant reservations. The review sites, local guides and booking platforms your customers use are part of your local presence.",
          whyItMatters:
            "A good Google rating doesn't hide a poor record on the review site your category relies on, because that site's reviews can appear on your Google profile anyway.",
          pitfall:
            "Paying for a place on a local best-of list and presenting it as independent. Google's Top Places List only counts lists that are genuine, independent and not sponsored.",
          sources: [GBP_MANAGE_REVIEWS, GBP_THIRD_PARTY, GOOGLE_TOP_PLACES, OPENAI_SEARCH_HELP],
        },
      ],
      check: [
        {
          kind: "choice",
          id: "q-reviews-incentive",
          prompt: "Fernhill offers a free cookie to everyone who leaves a Google review, whatever the rating. Which is true?",
          options: [
            "It's fine under both sets of rules, because it isn't tied to a positive review",
            "It isn't the FTC rule's sentiment-conditioned incentive, but Google's policy prohibits it",
            "It's banned only in the EU",
            "It's fine if reviewers mention the cookie",
          ],
          answer: 1,
          explanation:
            "The FTC rule bans incentives conditioned on a particular sentiment. Google bans incentives for posting any review, so the free cookie breaks Google's policy.",
        },
        {
          kind: "order",
          id: "q-reviews-report",
          prompt: "Put Google's steps for reporting a policy-violating review in order.",
          items: [
            "Go to your Business Profile",
            "Select Read reviews",
            "Next to the review, select Report",
            "Select the reason, such as Spam",
            "Select Send report",
          ],
          explanation:
            "Google's help page lists these steps. Report only reviews that break its policies, not ones you simply disagree with; evaluation typically takes several days.",
        },
        {
          kind: "choice",
          id: "q-reviews-third-party",
          prompt: "A one-star review from a travel website shows on a hotel's Google profile, and the hotel is in the US. What should the hotel do?",
          options: [
            "Ask Google to hide all third-party reviews",
            "Contact the travel website about the review",
            "Flag it to Google as Spam",
            "Mark up a higher rating on the hotel's own site",
          ],
          answer: 1,
          explanation:
            "Google says you can't choose or stop reviews from other websites, and that issues with them go to that website. Outside the EEA, a hotel can't flag third-party reviews directly on Google.",
        },
      ],
    },
  ],

  exercise: {
    id: "x-fernhill-local",
    title: "Fix a bakery's local presence",
    brief:
      "Fernhill Bakery (made up) has one shop and a website. Its owner, Maya, has noticed AI tools giving out an old phone number and wrong weekend hours. Work through its listings, its markup and its reviews.",
    steps: [
      {
        kind: "choice",
        id: "x-step-where",
        prompt: "ChatGPT gave a customer Fernhill's old phone number. Where should Maya start?",
        options: [
          "Only her Google Business Profile",
          "Every place the business is listed: the website, Google, Apple, Bing Maps and the main directories and review sites",
          "A message to OpenAI asking it to update the number",
          "Adding the new number to the business name field",
        ],
        answer: 1,
        explanation:
          "OpenAI says business listings come from third-party providers it doesn't name, and Google builds profiles from crawled web content and licensed data as well as what owners enter. Every copy of the old number needs fixing.",
      },
      {
        kind: "match",
        id: "x-step-tools",
        prompt: "Match each place Fernhill appears to where Maya manages it.",
        pairs: [
          { term: "Google Maps and Search", definition: "Google Business Profile" },
          { term: "The place card in Apple Maps and Siri", definition: "Apple Business (formerly Business Connect)" },
          { term: "Bing Maps results", definition: "Bing Places for Business" },
          { term: "Fernhill's own location page", definition: "LocalBusiness structured data" },
        ],
        explanation:
          "Each platform has its own claim-and-edit tool, and the website speaks for itself through markup. All four should carry the same name, address, phone and hours.",
      },
      {
        kind: "blank",
        id: "x-step-markup",
        prompt: "Complete Fernhill's markup with the most specific type and a phone number in the format Google asks for.",
        text: "\"@type\": \"___\",\n\"telephone\": \"___\",",
        mono: true,
        answers: ["Bakery", "+1-503-555-0142"],
        distractors: ["LocalBusiness", "503-555-0142", "Organization"],
        explanation:
          "Google asks for the most specific LocalBusiness subtype, and Bakery is one on schema.org. The phone number should include the country code and area code.",
      },
      {
        kind: "spot",
        id: "x-step-asking",
        prompt: "Maya drafts a plan for getting more reviews. Which line breaks Google's rules?",
        language: "text",
        lines: [
          "Print the review QR code on a sign by the counter",
          "Add the review link to every receipt email",
          "Send the review link only to customers who rated us 5 stars in our survey",
          "Ask every customer the same way, with no reward",
        ],
        answer: 2,
        explanation:
          "Google doesn't allow merchants to selectively solicit positive reviews. The FTC's staff say this practice could also violate the FTC Act. The other lines are what Google suggests.",
      },
      {
        kind: "passage",
        id: "x-step-reply",
        prompt: "A customer posts: \"Ordered a birthday cake, it wasn't ready at pickup time.\" Which reply should Maya post?",
        passages: [
          "Thank you for your feedback! Use code SORRY20 for 20% off your next order.",
          "I'm sorry, Priya. Your cake should have been ready at 3, and it wasn't. We've changed how we schedule custom orders so this doesn't happen again. I'd like to make it right: please email me at hello@fernhillbakery.example. Maya",
        ],
        answer: 1,
        explanation:
          "Google's tips favor short, personal replies that acknowledge mistakes and offer to resolve things privately. A discount code is promotional, which Google says replies should avoid. (Both replies are made up.)",
      },
    ],
    debrief:
      "Fernhill now has one version of its facts everywhere: the website, its location markup, and its listings on Google, Apple and Bing. Its review requests go to every customer with no reward, and its replies are short, honest and specific. None of it guarantees a place in an AI answer, but it removes the most common reason local answers go wrong: the sources disagree.",
  },

  example: {
    title: "Google's local ranking factors",
    context:
      "The \"Understand factors that determine local ranking\" section of Google Business Profile Help's page on local ranking, fetched on 4 November 2026.",
    excerpt: {
      kind: "quote",
      text: "Important: There's no way to request or pay for a better local ranking on Google. We do our best to keep the search algorithm details confidential to make the ranking system as fair as possible for everyone. Local results are mainly based on relevance, distance, and popularity. Together, these factors help Google find the best match for customers' searches. […] Prominence means how well-known a business is. Prominent places are more likely to show up in search results. This factor's also based on info like how many websites link to your business and how many reviews you have. More reviews and positive ratings can help your business's local ranking.",
    },
    points: [
      {
        label: "No paid route",
        text: "Google says there's no way to request or pay for a better local ranking. Anyone selling a guaranteed local position is selling something Google says doesn't exist.",
      },
      {
        label: "Two words, one factor",
        text: "The summary sentence says popularity and the heading says Prominence. Read them as the same factor: how well known the business is.",
      },
      {
        label: "Links and reviews",
        text: "Prominence draws on \"how many websites link to your business and how many reviews you have\", so local press coverage and honest reviews both feed it.",
      },
      {
        label: "Distance isn't yours",
        text: "Distance is measured from the searcher, and when they don't share a location Google uses what it knows about it. You can't move closer, so work on relevance and prominence.",
      },
    ],
    source: GBP_LOCAL_RANKING,
  },

  audit: [
    {
      kind: "choice",
      id: "a-pay-ranking",
      prompt: "What does Google say about paying for a better local ranking?",
      options: [
        "It is available through Google Ads",
        "There's no way to request or pay for a better local ranking",
        "It is available to verified businesses only",
        "It is allowed for businesses with over 100 reviews",
      ],
      answer: 1,
      explanation:
        "Google's Business Profile help says there's no way to request or pay for a better local ranking. Local results are mainly based on relevance, distance and prominence.",
    },
    {
      kind: "match",
      id: "a-match-rules",
      prompt: "Match each rule to who sets it.",
      pairs: [
        { term: "Bans incentives for posting any review", definition: "Google Maps content policy" },
        { term: "Bans incentives conditioned on a particular sentiment", definition: "The FTC's reviews rule" },
        { term: "Display name must match the storefront, signage or website", definition: "Apple Business" },
        { term: "Lists must be genuine, independent and not sponsored", definition: "Google's Top Places List" },
      ],
      explanation:
        "Google's policy is broader than the FTC's on incentives, Apple sets its own display name rules, and Google's Top Places List documentation sets the bar for editorial lists.",
    },
    {
      kind: "blank",
      id: "a-blank-markup",
      prompt: "Complete Google's guidance for LocalBusiness markup.",
      text: "Coordinates need a precision of at least ___ decimal places, and the telephone should include the ___ code and area code.",
      answers: ["5", "country"],
      distractors: ["2", "3", "zip"],
      explanation:
        "Google's Local Business documentation asks for at least 5 decimal places for latitude and longitude, and a phone number with country and area codes.",
    },
    {
      kind: "order",
      id: "a-order-setup",
      prompt: "Put the work for a new local business in a sensible order.",
      items: [
        "Claim and verify the Google Business Profile",
        "Complete the address, hours, category and attributes",
        "Make the website, Apple, Bing and directory listings match",
        "Ask every customer for a review with the review link",
        "Reply to reviews as they come in",
      ],
      explanation:
        "Verification comes first because you can't reply to reviews, and are less likely to show up, without it. Then complete the profile, make every other source agree with it, and build reviews honestly.",
    },
    {
      kind: "spot",
      id: "a-spot-apple-name",
      prompt: "Which display name breaks Apple Business's guidelines for a chain with several locations?",
      language: "text",
      lines: [
        "Stella Coffee Beverly Hills",
        "Paul & Eddie's Café",
        "Smith's Family Restaurant (Fresno, CA)",
        "Fernhill Bakery",
      ],
      answer: 2,
      explanation:
        "Apple allows a city when it is part of the brand name, as in Stella Coffee Beverly Hills, but not a city added to tell locations apart, which is Apple's own example of what isn't allowed.",
    },
    {
      kind: "choice",
      id: "a-chatgpt-location",
      prompt: "According to OpenAI, how does ChatGPT know where to look for nearby results if you haven't shared your device location?",
      options: [
        "It can't show local results at all",
        "It may estimate a general location from your IP address",
        "It reads your Google account's location history",
        "It asks the business for your address",
      ],
      answer: 1,
      explanation:
        "OpenAI says ChatGPT may use an approximate location based on your IP address. Sharing precise device location is optional and off by default.",
    },
    {
      kind: "choice",
      id: "a-rating-markup",
      prompt: "Which site should add aggregateRating to LocalBusiness markup, according to Google?",
      options: [
        "A bakery, using its Google rating",
        "A city guide that collects reviews about many local bakeries",
        "Any business with an embedded Google reviews widget",
        "Any business with more than 50 reviews",
      ],
      answer: 1,
      explanation:
        "Google recommends review and aggregateRating on LocalBusiness only for sites that capture reviews about other local businesses. A business controlling reviews about itself isn't eligible for star review features.",
    },
    {
      kind: "passage",
      id: "a-passage-reply",
      prompt: "Which reply to a negative review stays within Google's tips and the FTC's guidance?",
      passages: [
        "This reviewer is obviously a competitor. We've reported you and our lawyer will be in touch.",
        "I'm sorry your order was late, Dan. That's on us, and we've added a second driver on Saturdays. If you'd like to talk, call me on (503) 555-0142. Maya",
      ],
      answer: 1,
      explanation:
        "The first makes an accusation and a threat, which the FTC rule restricts when the accusation is knowingly false or the threat is groundless. The second acknowledges the problem, gives an update and offers a private conversation. (Both are made up.)",
    },
    {
      kind: "choice",
      id: "a-ai-guide",
      prompt: "In its guide to generative AI features, what does Google name as a way for local businesses to be visible in AI responses?",
      options: [
        "A special AI schema type",
        "Google Business Profiles",
        "An llms.txt file",
        "Paid placement in AI Overviews",
      ],
      answer: 1,
      explanation:
        "Google's guide says Merchant Center and Google Business Profiles can help products and services be visible in both AI responses and other Google Search results.",
    },
    {
      kind: "choice",
      id: "a-nap",
      prompt: "Fernhill moves to a new address. Which update plan best fits what Google and Apple document about their sources?",
      options: [
        "Update the Google Business Profile; the rest will follow automatically",
        "Update the website, Google, Apple, Bing and the main directories on the same day",
        "Leave the old address up for a year so customers can find it",
        "Create a second profile for the new address and keep the old one",
      ],
      answer: 1,
      explanation:
        "Google compiles profiles from crawled web content and licensed data as well as owner input, and Apple wants the address listed on your website. Every copy should change together, and Google allows only one profile per business.",
    },
  ],
};
