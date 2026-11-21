// Lesson 11: video, images and YouTube in AI answers.
// Every claim about Google Search, Search Console, YouTube, schema.org and
// ChatGPT is tied to a source checked on the `accessed` date. Google says its
// generative AI features can bring in images and video, and that following its
// image and video best practices already covers them; it publishes no share of
// AI answers that show YouTube, so the lesson gives none. OpenAI documents that
// images in a ChatGPT search answer link to a source; we found no official
// Perplexity page on how it picks images or videos, so the lesson makes no
// claim about Perplexity. Larkfield Tea is the made-up shop from Lesson 4, on
// a reserved .example domain; its videos, IDs, dates and file names are
// invented.

import type { LessonContent, Source } from "../lesson-types";

const ACCESSED = "2026-11-04";

const GOOGLE_AI_GUIDE: Source = {
  title: "Optimizing your website for generative AI features on Google Search",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/fundamentals/ai-optimization-guide",
  date: "2026-07-10",
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

const GOOGLE_VIDEO_BP: Source = {
  title: "Video SEO best practices",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/appearance/video",
  date: "2025-12-18",
  dateKind: "updated",
  accessed: ACCESSED,
};

const GOOGLE_VIDEO_SD: Source = {
  title: "Video (VideoObject, Clip, BroadcastEvent) structured data",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/appearance/structured-data/video",
  date: "2026-09-24",
  dateKind: "updated",
  accessed: ACCESSED,
};

const GOOGLE_VIDEO_SITEMAP: Source = {
  title: "Video sitemaps and alternatives",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/crawling-indexing/sitemaps/video-sitemaps",
  date: "2026-05-20",
  dateKind: "updated",
  accessed: ACCESSED,
};

const GOOGLE_ROBOTS_META: Source = {
  title: "Robots meta tag, data-nosnippet, and X-Robots-Tag specifications",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag",
  date: "2026-03-24",
  dateKind: "updated",
  accessed: ACCESSED,
};

const GOOGLE_IMAGES: Source = {
  title: "Google image SEO best practices",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/appearance/google-images",
  date: "2026-03-02",
  dateKind: "updated",
  accessed: ACCESSED,
};

const GOOGLE_IMAGE_SITEMAP: Source = {
  title: "Image sitemaps",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps",
  date: "2025-12-10",
  dateKind: "updated",
  accessed: ACCESSED,
};

const GOOGLE_IMAGE_LICENSE: Source = {
  title: "Image metadata in Google Images",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/appearance/structured-data/image-license-metadata",
  date: "2025-12-10",
  dateKind: "updated",
  accessed: ACCESSED,
};

const GOOGLE_SOCIAL_VIDEO: Source = {
  title: "Analyze your social and video platform content performance in Search Console",
  publisher: "Google Search Central",
  url: "https://developers.google.com/search/docs/monitor-debug/analyze-social-video-content",
  date: "2026-07-29",
  dateKind: "updated",
  accessed: ACCESSED,
};

const GOOGLE_AI_MODE_MULTIMODAL: Source = {
  title: "Bringing multimodal search to AI Mode",
  publisher: "Google (The Keyword)",
  url: "https://blog.google/products/search/ai-mode-multimodal-search/",
  date: "2025-04-07",
  dateKind: "published",
  accessed: ACCESSED,
};

const OPENAI_SEARCH_HELP: Source = {
  title: "Searching the web with ChatGPT",
  publisher: "OpenAI Help Center",
  url: "https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt",
  accessed: ACCESSED,
};

const YT_CHAPTERS: Source = {
  title: "Video chapters",
  publisher: "YouTube Help",
  url: "https://support.google.com/youtube/answer/9884579?hl=en",
  accessed: ACCESSED,
};

const YT_DESCRIPTIONS: Source = {
  title: "Tips for video descriptions",
  publisher: "YouTube Help",
  url: "https://support.google.com/youtube/answer/12948449?hl=en",
  accessed: ACCESSED,
};

const YT_SETTINGS: Source = {
  title: "Edit video settings",
  publisher: "YouTube Help",
  url: "https://support.google.com/youtube/answer/57404?hl=en",
  accessed: ACCESSED,
};

const YT_CAPTIONS: Source = {
  title: "Add subtitles & captions",
  publisher: "YouTube Help",
  url: "https://support.google.com/youtube/answer/2734796?hl=en",
  accessed: ACCESSED,
};

const YT_AUTO_CAPTIONS: Source = {
  title: "Use automatic captioning",
  publisher: "YouTube Help",
  url: "https://support.google.com/youtube/answer/6373554?hl=en",
  accessed: ACCESSED,
};

const SCHEMA_VIDEOOBJECT: Source = {
  title: "VideoObject",
  publisher: "Schema.org",
  url: "https://schema.org/VideoObject",
  accessed: ACCESSED,
};

export const LESSON_11: LessonContent = {
  intro:
    "Not every answer is text: AI answers can show a video, a product photo or a still from a how-to, with a link back to whoever published it. In this lesson you learn what Google, YouTube and OpenAI actually document about pictures and video in search and AI answers, and you set up Larkfield Tea's first brewing video and product photos so they can be found, understood and credited.",

  outro:
    "You now know that pictures and video in AI answers run on the same documented basics as image and video search: a real watch page, fetchable files, VideoObject and key moments, a clear YouTube title, description, chapters and captions, and images in plain HTML with useful alt text and, where it fits, license metadata. None of it is a trick for one AI tool, which is exactly why it keeps working as the tools change.",

  groups: [
    {
      id: "g-media-in-answers",
      title: "Pictures and video in AI answers",
      concepts: [
        {
          id: "c-media-ai-features",
          quiz: {"kind": "blank", "id": "cq-media-ai-features", "prompt": "Complete what Google's AI guide says about image and video best practices.", "text": "If you're already following our image SEO best practices and video SEO documentation, you're already optimizing for ___ search.", "answers": ["generative AI"], "distractors": ["voice", "local", "paid"], "explanation": "Google says its image and video SEO guidance already covers its generative AI features, and there's no special schema.org markup to add."},
          term: "Images and video in Google's AI features",
          summary: "Google says its AI features can bring in images and video, and that its existing image and video best practices are how you optimize for that.",
          explanation:
            "Google treats pictures and video as part of AI search, not as a separate channel with its own rules. Its guide to generative AI features says: \"As with Google Search overall, our generative AI search features can bring in relevant images and video, which means more opportunities for your website to appear beyond web page links.\" It then adds: \"If you're already following our image SEO best practices and video SEO documentation, you're already optimizing for generative AI search.\"\n\nGoogle's AI features page lists the same idea among the SEO fundamentals that still apply to AI Overviews and AI Mode: \"Supporting your textual content with high-quality images and videos, when applicable\". The same page says there's \"no special schema.org structured data that you need to add\" to appear in those features.\n\nSo most of this lesson is classic image and video SEO, done properly, with an eye on how answers reuse it.",
          whyItMatters:
            "A video or photo in an answer is another way in, beyond a text link. The work that earns it is already documented, which means you can plan it and check it.",
          pitfall:
            "Hunting for a special AI markup for images or video. Google says there's no extra requirement for AI Overviews or AI Mode; the work is the image and video best practices.",
          sources: [GOOGLE_AI_GUIDE, GOOGLE_AI_FEATURES],
        },
        {
          id: "c-youtube-on-google",
          quiz: {"kind": "choice", "id": "cq-youtube-on-google", "prompt": "How can you see how people find your YouTube content through Google?", "options": ["Add your channel to Search Console as a platform property", "Read Google's published figures on YouTube videos in AI Overviews", "Open the AI Overviews view in Search Console's platform report", "Add VideoObject markup to your YouTube channel page"], "answer": 0, "explanation": "Search Console platform properties show how people find your YouTube content on Google Search, Discover and News. Google doesn't publish how often YouTube appears in AI Overviews, and the guide doesn't describe an AI Overviews view."},
          term: "YouTube and embedded video on Google",
          summary: "A video embedded from YouTube can be indexed on your page and on YouTube, and Search Console can now show how your YouTube content is found on Google.",
          explanation:
            "Google's video documentation says videos \"can appear in several different places on Google, including the main search results page, Video mode, Google Images, and Discover\". If you embed from YouTube, there are two candidates: \"If your website embeds videos from third-party platforms like YouTube, Vimeo, or Facebook, Google may index the video both on your web page and on the third-party platform's equivalent page.\" And: \"Both versions may appear in video features on Google, as long as the pages meet the video indexing criteria.\"\n\nGoogle's AI guide also notes that its AI features can show what's being said about products and services \"including in blogs, videos, and forum discussions.\"\n\nTo see the YouTube side, add your channel to Search Console as a platform property. Google's guide says data on how people find your pages \"is also available for your TikTok, Instagram, X, or YouTube content.\" It covers Google Search, Discover and Google News; the guide doesn't describe a separate view for AI Overviews.\n\nGoogle doesn't publish how often YouTube videos appear in AI Overviews. Third-party studies do estimate it; if you use one, label it as outside research.",
          whyItMatters:
            "Your YouTube video and your own page are two chances at the same result, and each can be measured. Knowing which one Google shows tells you where to send people and where to put the work.",
          pitfall:
            "Assuming the YouTube upload covers your site. The two pages are indexed separately; Google still recommends structured data on your own watch page even when the player is YouTube's.",
          sources: [GOOGLE_VIDEO_BP, GOOGLE_AI_GUIDE, GOOGLE_SOCIAL_VIDEO],
        },
        {
          id: "c-ai-mode-lens",
          quiz: {"kind": "order", "id": "cq-ai-mode-lens", "prompt": "Put a photo search in AI Mode in order.", "items": ["You snap or upload a photo and ask a question about it", "Lens identifies each object in the image", "AI Mode issues multiple queries about the image and the objects in it", "AI Mode answers with links to dive deeper"], "explanation": "The photo starts the search, but the answer is built from ordinary searches about what's in it, which is why pages that clearly name your products matter."},
          term: "Searching with a photo: Lens in AI Mode",
          summary: "AI Mode can take a photo as the question: Lens identifies the objects, then AI Mode searches about them and answers with links.",
          explanation:
            "In April 2025 Google brought Lens into AI Mode. Its announcement says: \"With AI Mode's new multimodal understanding, you can snap a photo or upload an image, ask a question about it and get a rich, comprehensive response with links to dive deeper.\"\n\nHow it works, in Google's words: \"Lens precisely identifies each object in the image.\" Then, using query fan-out, \"AI Mode then issues multiple queries about the image as a whole and the objects within the image\". In Google's bookshelf example, the answer \"provides a list of recommended books with links to learn more and purchase\".\n\nThe practical point: the photo starts the search, but the answer is built from ordinary searches about what is in it. Pages that clearly name and show your products, with images Google can index, are what those searches can find. (At launch this was for Labs users in the U.S.; check current availability before you promise it to anyone.)",
          whyItMatters:
            "Shoppers increasingly point a camera at things they want to know about. If a customer photographs a tin of your tea, the follow-up searches need a page that names it clearly.",
          pitfall:
            "Trying to optimize the customer's photo. You can't; what you control is whether your pages answer the searches about the things in it.",
          sources: [GOOGLE_AI_MODE_MULTIMODAL],
        },
        {
          id: "c-assistant-images",
          quiz: {"kind": "choice", "id": "cq-assistant-images", "prompt": "What does OpenAI's help page document about images in ChatGPT search answers?", "options": ["You can select an image to view its source", "How ChatGPT chooses which images to show", "That images always come from the brand's own site", "That images are never shown in answers"], "answer": 0, "explanation": "OpenAI says you can select an image in a response to view its source, but it doesn't explain how images are chosen."},
          term: "Images in ChatGPT answers",
          summary: "OpenAI documents that images in a ChatGPT search answer link to their source; it doesn't document how they're chosen.",
          explanation:
            "OpenAI's help page on ChatGPT search says responses that use web search may include citations, and: \"If a response includes images, select an image to view its source.\" So an image in a ChatGPT answer is a route back to the page it came from.\n\nThe same page doesn't explain how images are picked, and it warns: \"Search results and citations can be incomplete, outdated, or incorrect.\"\n\nWe couldn't find an official Perplexity help page that explains how it chooses images or videos, so this lesson makes no claim about it. For any assistant, the safe ground is the same basics: images in plain HTML on pages crawlers can reach, with clear text around them.",
          whyItMatters:
            "It tells you what to check in your spot tests: when your image appears, does it link to the right page?",
          pitfall:
            "Treating one sighting of your photo in an answer as a trend. Without documentation on how images are chosen, record it as a spot check and rerun it.",
          sources: [OPENAI_SEARCH_HELP],
        },
      ],
      check: [
        {
          kind: "choice",
          id: "q-media-requirement",
          prompt: "What does Google say you need to do, beyond its normal guidance, for your images and videos to be used in AI Overviews and AI Mode?",
          options: [
            "Add a special AI image markup to each picture",
            "Nothing extra: following its image and video best practices already covers generative AI search",
            "Upload every video to YouTube",
            "Create an AI text file listing your media",
          ],
          answer: 1,
          explanation:
            "Google's AI guide says that if you already follow its image SEO and video SEO documentation, you're already optimizing for generative AI search, and its AI features page says there are no extra requirements.",
        },
        {
          kind: "choice",
          id: "q-media-embed",
          prompt: "Larkfield embeds its YouTube brewing video on its own page. Which version can Google show in video features?",
          options: [
            "Only the YouTube page",
            "Only Larkfield's page",
            "Either, as long as each page meets the video indexing criteria",
            "Neither, because embedded videos aren't indexed",
          ],
          answer: 2,
          explanation:
            "Google may index the video both on your page and on the platform's own page, and both may appear in video features if they meet the indexing criteria.",
        },
        {
          kind: "match",
          id: "q-media-match",
          prompt: "Match each product to what its owner documents about pictures and video.",
          pairs: [
            { term: "Google's AI features", definition: "Can bring in relevant images and video" },
            { term: "AI Mode with Lens", definition: "Identifies objects in a photo, then searches about them" },
            { term: "ChatGPT search", definition: "An image in a response links to its source" },
            { term: "Search Console platform property", definition: "Shows how people find your YouTube content on Google" },
          ],
          explanation:
            "Each line comes from the owner's own page: Google's AI guide, Google's AI Mode announcement, OpenAI's help page and Google's Search Console guide.",
        },
      ],
    },
    {
      id: "g-video-indexing",
      title: "Video pages Google can index",
      concepts: [
        {
          id: "c-watch-page",
          quiz: {"kind": "choice", "id": "cq-watch-page", "prompt": "Larkfield's watch page is indexed. What does Google say about the video on it?", "options": ["It isn't necessarily indexed as well", "It is always indexed along with the page", "It is indexed only if it loads after a click", "It is indexed only if the page has no text"], "answer": 0, "explanation": "Google says that just because the watch page is indexed doesn't mean the video will be. It also says not to rely on clicks or other user actions to load the video."},
          term: "The watch page",
          summary: "A watch page exists to show one video; Google's video features need one, and the page itself must be indexed first.",
          explanation:
            "Google separates a page *about* a video from a page with a video *on* it. A watch page's \"main purpose is to show users a single video.\" Video landing pages and sports highlight pages are watch pages; a blog post that reviews an embedded video, or a product page with a 360 video, aren't.\n\nGoogle's indexing requirements include:\n\n- \"The watch page must be indexed.\"\n- \"Just because the watch page is indexed doesn't mean that the video will also be indexed.\"\n- \"The video can't be hidden behind other elements.\"\n- \"The video must have a valid thumbnail that's available at a stable URL.\"\n\nEmbed the video with a standard element (video, embed, iframe or object), and \"Don't rely on user actions (such as swiping, clicking, or typing) to load the video.\" A non-watch page with the same video can still appear as a text result or an image result with a video badge.",
          whyItMatters:
            "Most video that never shows up in search is stuck on pages where it's a side feature, or loads only after a click. A dedicated page fixes both.",
          example: {
            kind: "before-after",
            before: "A blog post, \"Our autumn teas\", with three videos in a carousel that loads each one only after a visitor clicks.",
            after: "One page per video, such as /videos/brewing-oolong, with the player in an iframe at the top, a unique title and description, a short written summary, and a link from the blog post.",
            note: "Larkfield Tea and its pages are made up. The second layout gives each video a page whose main purpose is that video, loaded without a click.",
          },
          pitfall:
            "Expecting a video to be indexed because its page is. Google says the two are separate: the page can be indexed while the video isn't.",
          sources: [GOOGLE_VIDEO_BP],
        },
        {
          id: "c-video-files",
          quiz: {"kind": "blank", "id": "cq-video-files", "prompt": "Fill in the robots meta rule that allows video previews of up to 15 seconds.", "text": "<meta name=\"robots\" content=\"___:15\">", "mono": true, "answers": ["max-video-preview"], "distractors": ["nosnippet", "noindex", "video-length"], "explanation": "The max-video-preview rule caps preview length in seconds. Without it, Google may show a video snippet and decides the length itself."},
          term: "Fetchable files, thumbnails and previews",
          summary: "Previews and key moments need Google to fetch the video bytes; every video needs a valid thumbnail at a stable URL.",
          explanation:
            "Google says it \"needs to successfully fetch the actual bytes of a video file to enable features like video previews and key moments.\" So don't block the video file with robots.txt or noindex, and keep it at a stable URL. Google adds: \"Google won't expose the video file directly in search results, and users clicking a video result will land on your site to watch the video.\"\n\nThumbnails matter in every video feature. Google supports BMP, GIF, JPEG, PNG, WebP, SVG and AVIF, at least 60x30 pixels, larger preferred, and the file must be reachable by Googlebot and Googlebot Images. Some CDNs use expiring URLs, so Google advises: \"use a single unique and stable thumbnail URL for each video.\" If you give the thumbnail in several places (sitemap and structured data, say), use the same URL in each.\n\nYou can cap preview length with the `max-video-preview` robots meta rule, in seconds. If you don't set it, Google may show a video snippet and decides its length itself.",
          whyItMatters:
            "A thumbnail that 404s next week, or a file Google can't fetch, quietly removes the video from the richer features even when everything else is right.",
          example: {
            kind: "code",
            language: "html",
            caption: "Allow previews of up to 15 seconds for videos on this page (an illustrative value)",
            code: "<meta name=\"robots\" content=\"max-video-preview:15\">",
          },
          pitfall:
            "Blocking the video host or thumbnail folder in robots.txt to save crawl load. Without the file and thumbnail, Google can't offer previews or key moments, and may not index the video at all.",
          sources: [GOOGLE_VIDEO_BP, GOOGLE_ROBOTS_META],
        },
        {
          id: "c-video-sitemap",
          quiz: {"kind": "choice", "id": "cq-video-sitemap", "prompt": "In a video sitemap entry for a YouTube embed, what goes in the player location?", "options": ["The youtube.com/embed URL", "The watch page URL", "The thumbnail URL", "The YouTube channel URL"], "answer": 0, "explanation": "For a YouTube embed, the player location is the youtube.com/embed URL. The watch page goes in the loc tag."},
          term: "Video sitemaps",
          summary: "A video sitemap lists each watch page and its video's thumbnail, title, description, and file or player URL.",
          explanation:
            "Google says: \"Creating a video sitemap is a good way to help Google find and understand the video content on your site, especially content that was recently added or that we might not otherwise discover with our usual crawling mechanisms.\" You can add video tags to an existing sitemap or keep a separate one.\n\nThe required tags are the video element, its thumbnail, title, description, and either a content location (the file) or a player location. For a YouTube embed, the player location is the youtube.com/embed URL. Google adds some rules:\n\n- The description has a 2,048-character maximum and \"must match the description displayed on the web page where the video is embedded, but it doesn't need to be a word-for-word match.\"\n- The content location must not be the same URL as the watch page itself.\n- \"Don't list videos that are unrelated to the content of the host page.\"",
          whyItMatters:
            "A sitemap gets new videos found faster and states the facts (title, thumbnail, player) in one place you control.",
          example: {
            kind: "code",
            language: "html",
            caption: "Larkfield's video sitemap entry for a YouTube embed (made-up URLs and ID)",
            code:
              "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\"\n        xmlns:video=\"http://www.google.com/schemas/sitemap-video/1.1\">\n  <url>\n    <loc>https://larkfieldtea.example/videos/brewing-oolong</loc>\n    <video:video>\n      <video:thumbnail_loc>https://larkfieldtea.example/thumbs/brewing-oolong.jpg</video:thumbnail_loc>\n      <video:title>How to brew oolong tea at home</video:title>\n      <video:description>Our tea buyer shows water temperature, leaf amount and three short infusions for a rolled oolong.</video:description>\n      <video:player_loc>https://www.youtube.com/embed/lark0001xyz</video:player_loc>\n    </video:video>\n  </url>\n</urlset>",
          },
          pitfall:
            "Putting the watch page URL in the content location. That tag is for the video file itself; the page goes in the loc tag.",
          sources: [GOOGLE_VIDEO_SITEMAP],
        },
      ],
      check: [
        {
          kind: "choice",
          id: "q-watch-which",
          prompt: "Which of these is a watch page, as Google defines it?",
          options: [
            "A blog post reviewing a video embedded halfway down",
            "A product page with a 360 video of the product",
            "A page whose main purpose is to show one brewing video",
            "A category page listing twenty videos equally",
          ],
          answer: 2,
          explanation:
            "A watch page's main purpose is to show users a single video. Google lists review posts, product pages with 360 videos and category pages of equal-prominence videos as examples of pages that aren't watch pages.",
        },
        {
          kind: "spot",
          id: "q-sitemap-spot",
          prompt: "Which line of this video sitemap entry breaks one of Google's rules?",
          language: "html",
          lines: [
            "<loc>https://larkfieldtea.example/videos/brewing-oolong</loc>",
            "<video:thumbnail_loc>https://larkfieldtea.example/thumbs/brewing-oolong.jpg</video:thumbnail_loc>",
            "<video:title>How to brew oolong tea at home</video:title>",
            "<video:content_loc>https://larkfieldtea.example/videos/brewing-oolong</video:content_loc>",
          ],
          answer: 3,
          explanation:
            "The content location must point to the video file itself and must not be the same as the URL in the loc tag. Here it repeats the watch page.",
        },
        {
          kind: "choice",
          id: "q-video-fetch",
          prompt: "Larkfield blocks its video file folder in robots.txt. Which features does Google say need the file to be fetchable?",
          options: [
            "Video previews and key moments",
            "Only the video thumbnail",
            "The title link",
            "None; Google never fetches video files",
          ],
          answer: 0,
          explanation:
            "Google says it needs to fetch the actual bytes of a video file to enable features like video previews and key moments.",
        },
      ],
    },
    {
      id: "g-video-markup",
      title: "VideoObject, key moments and YouTube",
      concepts: [
        {
          id: "c-videoobject",
          quiz: {"kind": "match", "id": "cq-videoobject", "prompt": "Match each VideoObject property to what it holds.", "pairs": [{"term": "name", "definition": "The video's title, unique for each video on your site"},{"term": "uploadDate", "definition": "When the video was published, in ISO 8601"},{"term": "contentUrl", "definition": "The URL of the video file"},{"term": "embedUrl", "definition": "The player URL, used if the file URL isn't available"}], "explanation": "name, thumbnailUrl and uploadDate are required. contentUrl is the most effective way for Google to fetch the file, and embedUrl is the fallback, such as a youtube.com/embed address."},
          term: "VideoObject structured data",
          summary: "VideoObject markup describes each video; Google requires name, thumbnailUrl and uploadDate, and recommends contentUrl or embedUrl.",
          explanation:
            "Google's video structured data page lists three required properties: `name`, `thumbnailUrl` and `uploadDate` (in ISO 8601; \"We recommend that you provide timezone information\"). It warns: \"If you don't include the required properties, Google may not be able to extract any information about the video.\"\n\nThe key recommended properties:\n\n- `contentUrl`, the URL of the video file. \"This is the most effective way for Google to fetch your video content files.\"\n- `embedUrl`, the player URL, if `contentUrl` isn't available. For a YouTube embed, that's the youtube.com/embed address.\n- `description` and `duration`.\n\nGoogle asks you to \"Make sure to use unique text in the name property for each video on your site\", and the same for descriptions. It also says plainly: \"Google doesn't guarantee that adding markup will result in a specific video feature in Search results\".",
          whyItMatters:
            "Markup states the facts about the video in a form Google can read without guessing: what it's called, when it was published, what it shows and where to fetch it.",
          example: {
            kind: "code",
            language: "json",
            caption: "Larkfield's watch page markup for a YouTube-hosted video (made-up details)",
            code:
              "{\n  \"@context\": \"https://schema.org\",\n  \"@type\": \"VideoObject\",\n  \"name\": \"How to brew oolong tea at home\",\n  \"description\": \"Our tea buyer shows water temperature, leaf amount and three short infusions for a rolled oolong.\",\n  \"thumbnailUrl\": \"https://larkfieldtea.example/thumbs/brewing-oolong.jpg\",\n  \"uploadDate\": \"2026-10-12T09:00:00+01:00\",\n  \"duration\": \"PT4M30S\",\n  \"embedUrl\": \"https://www.youtube.com/embed/lark0001xyz\"\n}",
          },
          pitfall:
            "Copying one generic description onto every video. Google asks for unique name and description text per video, and the markup must match what the video actually shows.",
          sources: [GOOGLE_VIDEO_SD, GOOGLE_VIDEO_BP],
        },
        {
          id: "c-key-moments",
          quiz: {"kind": "choice", "id": "cq-key-moments", "prompt": "Larkfield doesn't want key moments shown for a video at all. What does Google say to use?", "options": ["The nosnippet rule", "SeekToAction markup", "Clip markup with no start times", "Removing timestamps from the page"], "answer": 0, "explanation": "Google says to use the nosnippet rule to opt out of key moments completely. Google tries to detect segments automatically, so leaving out markup doesn't stop them."},
          term: "Key moments: Clip and SeekToAction",
          summary: "Key moments let people jump to parts of a video; you can label them with Clip markup, point Google at your timestamp URLs with SeekToAction, or use YouTube timestamps.",
          explanation:
            "Google describes key moments as a way to navigate video segments \"like chapters in a book\". It says: \"Google Search tries to automatically detect the segments in your video and show key moments to users, without any effort on your part.\" But: \"We will prioritize key moments set by you, either through structured data or the YouTube description.\"\n\nFor video on your own site, there are two kinds of markup:\n\n- **Clip**: you give each segment a name, a start time in seconds (`startOffset`) and a URL that starts the video there. Clip works in all languages where Google Search is available.\n- **SeekToAction**: you tell Google how your timestamp URLs work, and Google picks the moments itself. It needs Google to fetch your video files and works in a listed set of languages.\n\nGoogle's rules include: \"The video must have the ability to deep link into some point other than the start point in the video URL\", and for Clip, \"Make sure that no two clips on the same video defined on the same page share a start time.\" To opt out of key moments completely, use the `nosnippet` rule.",
          whyItMatters:
            "A how-to video with labeled moments answers several narrower questions at once, each with a link straight to the right second.",
          example: {
            kind: "code",
            language: "json",
            caption: "Clip markup nested in Larkfield's VideoObject (made-up URLs; times in seconds)",
            code:
              "\"hasPart\": [\n  {\n    \"@type\": \"Clip\",\n    \"name\": \"Heating the water to 90°C\",\n    \"startOffset\": 20,\n    \"endOffset\": 75,\n    \"url\": \"https://larkfieldtea.example/videos/brewing-oolong?t=20\"\n  },\n  {\n    \"@type\": \"Clip\",\n    \"name\": \"Three short infusions\",\n    \"startOffset\": 140,\n    \"url\": \"https://larkfieldtea.example/videos/brewing-oolong?t=140\"\n  }\n]",
          },
          pitfall:
            "Adding Clip markup to a player that can't start part way through. Google requires the video to deep link to a point other than the start, and each clip URL must point to the same URL path as the video, with the time added.",
          sources: [GOOGLE_VIDEO_BP, GOOGLE_VIDEO_SD],
        },
        {
          id: "c-youtube-chapters",
          quiz: {"kind": "blank", "id": "cq-youtube-chapters", "prompt": "Complete YouTube's rules for chapters.", "text": "The first timestamp starts at 00:00, the video should have at least ___ timestamps in ascending order, and the minimum chapter length is ___ seconds.", "answers": ["three", "10"], "distractors": ["two", "30"], "explanation": "YouTube needs a first timestamp at 00:00, at least three timestamps in ascending order, and chapters of 10 seconds or more."},
          term: "YouTube chapters and timestamps",
          summary: "On YouTube, timestamps in the description create chapters, and Google can use them as key moments.",
          explanation:
            "YouTube's help page explains how to add chapters: in the description, add a list of timestamps and titles. Its rules:\n\n- \"Make sure that the first timestamp you list starts with 00:00.\"\n- \"Your video should have at least three timestamps listed in ascending order.\"\n- \"The minimum length for video chapters is 10 seconds.\"\n\nChapters you add override automatic chapters. Google Search reads the same list. Google says that for videos hosted on YouTube, it \"may automatically enable key moments for your video based on the video description on YouTube\", and its timestamp guidelines ask you to put each timestamp on a new line, with its label on the same line, in chronological order, and to \"Make sure the label contains at least one word.\"",
          whyItMatters:
            "One list in the description serves viewers on YouTube and key moments on Google. It takes minutes and it's fully in your control.",
          example: {
            kind: "code",
            language: "text",
            caption: "Chapters in Larkfield's YouTube description (made-up)",
            code: "00:00 What you need\n00:20 Heating the water to 90°C\n01:15 How much leaf to use\n02:20 Three short infusions\n03:50 Storing oolong",
          },
          pitfall:
            "Starting the list at the first interesting moment, such as 00:20. YouTube needs the first timestamp at 00:00, at least three of them, and chapters of 10 seconds or more.",
          sources: [YT_CHAPTERS, GOOGLE_VIDEO_SD],
        },
        {
          id: "c-youtube-text",
          quiz: {"kind": "passage", "id": "cq-youtube-text", "prompt": "Which YouTube title and description opening follows YouTube's advice?", "passages": ["Title: Sunday session #3. Description starts: Hey everyone, welcome back to the channel!", "Title: How to brew oolong tea at home (water temperature and timings). Description starts: Our tea buyer shows how hot the water should be and how long each infusion takes."], "answer": 1, "explanation": "YouTube says to describe the video in the first lines of the description and feature one or two main words in both title and description."},
          term: "YouTube titles and descriptions",
          summary: "YouTube's own advice: describe the video in the first lines, use one or two main words in title and description, and keep each description unique.",
          explanation:
            "YouTube's help says: \"Descriptions tell the YouTube algorithm and your viewers what the video is about.\" Its practical tips:\n\n- \"Consider using the first few lines of your description to describe your video because it's what viewers will see first.\"\n- \"Identify 1-2 main words that describe your video and feature them prominently in both your description and title.\"\n- \"Be sure that each video has a unique description; this makes it easier to find through search, and helps it stand out from similar videos.\"\n\nThe limits: titles up to 100 characters, descriptions up to 5,000. Tags help mainly with misspellings; YouTube says \"tags play a minimal role in your video's discovery.\"\n\nThen measure. Google's Search Console guide suggests that if you rewrite a title or caption, you can check whether it changes how people find that content through Google Search.",
          whyItMatters:
            "The title and the first lines of the description are the plain-text facts every system reads first. Vague titles waste them.",
          example: {
            kind: "before-after",
            before: "Title: \"Sunday session #3\". Description starts: \"Hey everyone, welcome back to the channel! Don't forget to subscribe...\"",
            after: "Title: \"How to brew oolong tea at home (water temperature and timings)\". Description starts: \"Our tea buyer shows how hot the water should be, how much leaf to use and how long each of three infusions takes for a rolled oolong.\"",
            note: "Larkfield's video is made up. The second version names the subject in the title and says what the video shows in its first lines.",
          },
          pitfall:
            "Spending the effort on tags. YouTube says they play a minimal role; the title, the description and the video itself do the work.",
          sources: [YT_DESCRIPTIONS, YT_SETTINGS, GOOGLE_SOCIAL_VIDEO],
        },
        {
          id: "c-captions-transcripts",
          quiz: {"kind": "choice", "id": "cq-captions-transcripts", "prompt": "What does YouTube say to do with automatic captions?", "options": ["Always review them and edit any parts that weren't properly transcribed", "Publish them as they are, since they're generated from the audio", "Replace them with tags", "Turn them off so they don't conflict with the title"], "answer": 0, "explanation": "YouTube warns that automatic captions might misrepresent what's said and tells you to always review and edit them. Product names are a common casualty."},
          term: "Captions and transcripts",
          summary: "Captions put the spoken words into text; review YouTube's automatic captions, and put the key points in text on your watch page too.",
          explanation:
            "On YouTube, \"Subtitle and caption files contain the text of what is said in the video.\" You can upload a file, paste a transcript and let YouTube set the timings, or type captions as you watch. YouTube can also create automatic captions, but it warns that they \"might misrepresent the spoken content due to mispronunciations, accents, dialects, or background noise\" and says: \"Always review automatic captions and edit any parts that haven't been properly transcribed.\"\n\nOn your own site, Google's list of SEO fundamentals for AI features includes \"Making sure that important content is available in textual form\". A short summary or full transcript on the watch page does that. Schema.org's VideoObject has a `transcript` property, defined as \"If this MediaObject is an AudioObject or VideoObject, the transcript of that object.\" Google's video structured data page doesn't list it among the properties it uses, so treat it as optional description, not a feature switch.",
          whyItMatters:
            "Text answers quote text. If the useful part of your video exists only as speech, there's nothing on the page for a text answer to lift.",
          pitfall:
            "Publishing automatic captions unchecked. Product names and tea names are exactly what speech recognition gets wrong, and YouTube says to review them.",
          sources: [YT_CAPTIONS, YT_AUTO_CAPTIONS, GOOGLE_AI_FEATURES, SCHEMA_VIDEOOBJECT, GOOGLE_VIDEO_SD],
        },
      ],
      check: [
        {
          kind: "blank",
          id: "q-videoobject-required",
          prompt: "Fill in the two missing required VideoObject properties.",
          text: "{\n  \"@type\": \"VideoObject\",\n  \"___\": \"How to brew oolong tea at home\",\n  \"thumbnailUrl\": \"https://larkfieldtea.example/thumbs/brewing-oolong.jpg\",\n  \"___\": \"2026-10-12T09:00:00+01:00\"\n}",
          mono: true,
          answers: ["name", "uploadDate"],
          distractors: ["headline", "datePublished", "title"],
          explanation:
            "Google's required VideoObject properties are name, thumbnailUrl and uploadDate. headline and datePublished belong to other types, such as Article.",
        },
        {
          kind: "spot",
          id: "q-chapters-spot",
          prompt: "Which line stops this YouTube description from creating chapters?",
          language: "text",
          lines: ["00:15 Heating the water", "01:10 How much leaf to use", "02:20 Three short infusions", "03:50 Storing oolong"],
          answer: 0,
          explanation: "YouTube requires the first timestamp to start at 00:00. The list needs a 00:00 line before 00:15.",
        },
        {
          kind: "choice",
          id: "q-clip-vs-seek",
          prompt: "Larkfield wants to choose and label its own key moments on its website video. Which markup fits?",
          options: ["SeekToAction", "Clip", "BroadcastEvent", "ImageObject"],
          answer: 1,
          explanation:
            "Clip lets you give each segment a name, start time and URL. SeekToAction tells Google how your timestamp URLs work so it can identify moments automatically; Google says to use Clip if you prefer to identify them yourself.",
        },
      ],
    },
    {
      id: "g-images",
      title: "Images for AI and visual search",
      concepts: [
        {
          id: "c-image-html",
          quiz: {"kind": "spot", "id": "cq-image-html", "prompt": "Which of these images won't Google index?", "language": "html", "lines": ["<img src=\"/images/oolong-tin.jpg\" alt=\"A Larkfield Tea oolong tin\">", "<div class=\"hero\" style=\"background-image:url(/images/oolong-leaves.jpg)\"></div>", "<picture><source srcset=\"/images/oolong-cup.webp\"><img src=\"/images/oolong-cup.jpg\" alt=\"A cup of oolong\"></picture>"], "answer": 1, "explanation": "Google finds images in the src of img elements, including inside picture, and says it doesn't index CSS images such as a background-image."},
          term: "Images Google can find",
          summary: "Put images in HTML img elements, near relevant text, in a supported format with a descriptive file name; CSS background images aren't indexed.",
          explanation:
            "Google finds images in the `src` attribute of `img` elements, including inside a `picture` element, and \"Google doesn't index CSS images.\" Supported formats are BMP, GIF, JPEG, PNG, WebP, SVG and AVIF. With `srcset` or `picture`, always give a fallback `src`.\n\nGoogle reads the page around an image: \"Wherever possible, make sure images are placed near relevant text and on pages that are relevant to the image subject matter.\" File names count a little too: \"the filename can give Google very light clues about the subject matter of the image.\" Google's example: my-new-black-kitten.jpg is better than IMG00023.JPG.\n\nThe same pages can surface in more than one place: Google lists text result images, Discover and Google Images among the features that help people find things visually.",
          whyItMatters:
            "Images that are background decoration in CSS, or lazy-loaded with no real src, are invisible to search. A photo search about your product can only find images Google has indexed.",
          example: {
            kind: "before-after",
            before: "<div class=\"hero\" style=\"background-image:url(IMG00023.JPG)\"></div>",
            after: "<img src=\"/images/larkfield-tieguanyin-oolong-loose-leaf.jpg\" alt=\"Rolled Tieguanyin oolong leaves beside a Larkfield Tea tin\" width=\"1200\" height=\"800\">",
            note: "The first is a CSS background with a camera file name, which Google won't index as an image. The second is an img element with a descriptive file name and alt text. (Larkfield's file is made up.)",
          },
          pitfall:
            "Showing your best product photo only as a CSS background in the page hero. It looks great and it can't appear in image results or be found by a photo search.",
          sources: [GOOGLE_IMAGES],
        },
        {
          id: "c-alt-text",
          quiz: {"kind": "choice", "id": "cq-alt-text", "prompt": "In Google's own example, which alt text is best for a photo of a Dalmatian puppy playing fetch?", "options": ["Dalmatian puppy playing fetch", "puppy", "A long list of dog words and breed names", "No alt attribute at all"], "answer": 0, "explanation": "Google's ladder rates no alt and keyword stuffing as bad, puppy as better, and Dalmatian puppy playing fetch as best: a useful description in context."},
          term: "Alt text",
          summary: "Alt text is the most important image metadata Google names; describe the image usefully in context, without stuffing keywords.",
          explanation:
            "Google calls alt text \"The most important attribute when it comes to providing more metadata for an image\". It also helps people using screen readers. And: \"Google uses alt text along with computer vision algorithms and the contents of the page to understand the subject matter of the image.\"\n\nGoogle's own ladder for the same photo:\n\n- Bad: no alt attribute.\n- Bad: a long list of dog words and breed names (keyword stuffing).\n- Better: puppy.\n- Best: Dalmatian puppy playing fetch.\n\nIts warning: \"Avoid filling alt attributes with keywords (also known as keyword stuffing) as it results in a negative user experience and may cause your site to be seen as spam.\" For inline SVG, use a title element instead.",
          whyItMatters:
            "Alt text is the one place you describe the image in your own words. It serves accessibility and search at the same time.",
          example: {
            kind: "before-after",
            before: "alt=\"tea, best tea, oolong tea, buy tea online, cheap tea, tea UK, loose leaf tea\"",
            after: "alt=\"Tieguanyin oolong leaves unfurling in a glass teapot after the second infusion\"",
            note: "Larkfield's photo is made up. The second says what the picture shows, in the context of a brewing guide, with the product named once.",
          },
          pitfall:
            "Writing alt text for search instead of for a person who can't see the image. If it wouldn't help someone using a screen reader, it's probably stuffing.",
          sources: [GOOGLE_IMAGES],
        },
        {
          id: "c-image-sitemap-preferred",
          quiz: {"kind": "choice", "id": "cq-image-sitemap-preferred", "prompt": "You're suggesting which image represents a product page in og:image. Which choice does Google advise against?", "options": ["Your site logo", "A photo of the product itself", "A photo that is relevant and representative of the page"], "answer": 0, "explanation": "Google asks for a relevant, representative image and says to avoid a generic image, such as your site logo, or an image with text."},
          term: "Image sitemaps and the preferred image",
          summary: "Image sitemaps list images Google might miss; primaryImageOfPage, an image on the main entity, or og:image suggest which image represents a page.",
          explanation:
            "Google says: \"Image sitemaps are a way of telling Google about other images on your site, especially those that we might not otherwise find (such as images your site reaches with JavaScript code).\" Each page entry can list up to 1,000 images, and images on another domain, such as a CDN, are fine if you verify both domains in Search Console. Google has removed the caption, geo location, title and license tags from its image sitemap documentation; what remains is the image element and its location.\n\nFor the image that represents a page (for example a text result image or a Discover preview), Google says its choice is automated but you can suggest one with schema.org `primaryImageOfPage`, an `image` on the page's main entity, or the `og:image` meta tag. Its advice: choose an image that's relevant and representative, and \"Avoid using a generic image (for example, your site logo) or an image with text in the schema.org markup or og:image meta tag.\"",
          whyItMatters:
            "When an answer or result shows one picture for your page, you want it to be the product, not your logo.",
          example: {
            kind: "code",
            language: "html",
            caption: "One page entry in an image sitemap (made-up URLs)",
            code:
              "<url>\n  <loc>https://larkfieldtea.example/shop/tieguanyin-oolong</loc>\n  <image:image>\n    <image:loc>https://cdn.larkfieldtea.example/images/tieguanyin-oolong-tin.jpg</image:loc>\n  </image:image>\n  <image:image>\n    <image:loc>https://cdn.larkfieldtea.example/images/tieguanyin-oolong-leaves.jpg</image:loc>\n  </image:image>\n</url>",
          },
          pitfall:
            "Adding captions and titles to an image sitemap and expecting Google to use them. Google has removed those tags from its documentation; put that information on the page instead.",
          sources: [GOOGLE_IMAGE_SITEMAP, GOOGLE_IMAGES],
        },
        {
          id: "c-image-license",
          quiz: {"kind": "choice", "id": "cq-image-license", "prompt": "An image's ImageObject markup and its embedded IPTC metadata give different license details. Which does Google use?", "options": ["The structured data", "The IPTC metadata", "Whichever was added most recently", "Neither, until they match"], "answer": 0, "explanation": "Google says that if the two disagree, it uses the structured data information."},
          term: "Image license metadata",
          summary: "ImageObject markup or IPTC photo metadata can tell Google who made an image and how to license it, making it eligible for the Licensable badge.",
          explanation:
            "If people reuse your photos, you can say who made them and how to license them. Google reads this from structured data or from IPTC photo metadata embedded in the file, and providing it \"can make the image eligible for the Licensable badge\".\n\nIn ImageObject markup:\n\n- `contentUrl` (the image URL) is required.\n- You must also include at least one of `creator`, `creditText`, `copyrightNotice` or `license`.\n- For the badge with structured data, \"you must include the license property\". Add `acquireLicensePage` if you have one.\n\nStructured data has to be added on every page where the image appears; IPTC metadata travels with the file. If the two disagree, \"Google will use the structured data information.\"",
          whyItMatters:
            "Credit and license details turn reuse of your photos into a route back to you, rather than an anonymous copy.",
          example: {
            kind: "code",
            language: "json",
            caption: "ImageObject license metadata for one of Larkfield's photos (made-up URLs and names)",
            code:
              "{\n  \"@context\": \"https://schema.org\",\n  \"@type\": \"ImageObject\",\n  \"contentUrl\": \"https://cdn.larkfieldtea.example/images/tieguanyin-oolong-leaves.jpg\",\n  \"license\": \"https://larkfieldtea.example/image-license\",\n  \"acquireLicensePage\": \"https://larkfieldtea.example/press\",\n  \"creditText\": \"Larkfield Tea\",\n  \"creator\": { \"@type\": \"Person\", \"name\": \"Maya Okafor\" },\n  \"copyrightNotice\": \"Larkfield Tea Ltd\"\n}",
          },
          pitfall:
            "Marking up the license on the product page but not on the blog post that uses the same photo. With structured data, every instance needs its own markup; IPTC in the file avoids that.",
          sources: [GOOGLE_IMAGE_LICENSE],
        },
      ],
      check: [
        {
          kind: "passage",
          id: "q-alt-passage",
          prompt: "Which alt text follows Google's guidance for a photo in Larkfield's brewing guide?",
          passages: [
            "oolong, oolong tea, best oolong, buy oolong UK, cheap oolong, oolong tea leaves",
            "Oolong leaves unfurling in a glass teapot during the second infusion",
          ],
          answer: 1,
          explanation:
            "Google asks for useful, information-rich alt text in context and warns that keyword stuffing is a poor experience and may be seen as spam.",
        },
        {
          kind: "match",
          id: "q-license-match",
          prompt: "Match each ImageObject property to what it holds.",
          pairs: [
            { term: "contentUrl", definition: "The URL of the image itself" },
            { term: "license", definition: "A page describing the license that governs the image's use" },
            { term: "acquireLicensePage", definition: "A page explaining how to license the image" },
            { term: "creditText", definition: "The name credited when the image is published" },
          ],
          explanation:
            "contentUrl is required; with structured data, license is what makes the image eligible for the Licensable badge, and acquireLicensePage is recommended alongside it.",
        },
        {
          kind: "choice",
          id: "q-css-image",
          prompt: "Larkfield's best product photo is set as a CSS background image. What does Google say?",
          options: [
            "It's indexed like any other image",
            "Google doesn't index CSS images",
            "It's indexed only if it has alt text",
            "It's indexed only from an image sitemap",
          ],
          answer: 1,
          explanation: "Google finds images in the src attribute of img elements and says it doesn't index CSS images.",
        },
      ],
    },
  ],

  exercise: {
    id: "x-brewing-video",
    title: "Launch Larkfield's brewing video",
    brief:
      "Larkfield Tea (made up) has uploaded \"How to brew oolong tea at home\" to YouTube and wants it, and the product photos around it, to be findable on Google and usable in answers. Set it up step by step.",
    steps: [
      {
        kind: "choice",
        id: "x-step-page",
        prompt: "Where should Larkfield embed the video on its own site?",
        options: [
          "In a carousel on the home page that loads each video on click",
          "On a dedicated page whose main purpose is that video, with a unique title and description",
          "At the bottom of every product page",
          "Nowhere; the YouTube upload is enough",
        ],
        answer: 1,
        explanation:
          "Google's video features need a watch page whose main purpose is the video, loaded without user actions. The YouTube page can also be indexed, but it's a separate page.",
      },
      {
        kind: "blank",
        id: "x-step-embed",
        prompt: "The file is hosted by YouTube, so Larkfield can't give the video file URL. Complete the markup.",
        text: "\"thumbnailUrl\": \"https://larkfieldtea.example/thumbs/brewing-oolong.jpg\",\n\"___\": \"https://www.youtube.com/embed/lark0001xyz\"",
        mono: true,
        answers: ["embedUrl"],
        distractors: ["contentUrl", "url", "sameAs"],
        explanation:
          "contentUrl is for the video file's own bytes. When that isn't available, Google says to provide embedUrl, the URL of the player.",
      },
      {
        kind: "spot",
        id: "x-step-chapters",
        prompt: "Which line of the YouTube description breaks YouTube's chapter rules?",
        language: "text",
        lines: ["00:00 What you need", "00:20 Heating the water", "00:26 Weighing the leaf", "01:15 Three short infusions"],
        answer: 1,
        explanation:
          "The chapter starting at 00:20 lasts only 6 seconds, until 00:26. YouTube's minimum chapter length is 10 seconds.",
      },
      {
        kind: "passage",
        id: "x-step-first-lines",
        prompt: "Which opening for the YouTube description follows YouTube's advice?",
        passages: [
          "Hey tea friends! Welcome back to the channel, don't forget to like and subscribe, and check out our shop.",
          "How to brew oolong tea at home: our tea buyer shows water temperature, leaf amount and three short infusions for a rolled oolong.",
        ],
        answer: 1,
        explanation:
          "YouTube suggests using the first few lines to describe the video, because they're what viewers see first, with the main words also in the title.",
      },
      {
        kind: "order",
        id: "x-step-launch",
        prompt: "Put the launch steps in a sensible order.",
        items: [
          "Publish the watch page with the video embedded and a short written summary",
          "Add VideoObject markup with name, thumbnailUrl, uploadDate and embedUrl",
          "Test the page with the Rich Results Test and URL Inspection",
          "Add the page to the video sitemap",
          "Check the Video indexing report in Search Console",
        ],
        explanation:
          "Build the page, describe it, test what Google sees, tell Google about it, then monitor. Google's Video indexing report shows how many watch pages have an indexed video and why others don't.",
      },
    ],
    debrief:
      "Larkfield now has one page per video, markup that names the video and its player, chapters that pass YouTube's rules and can become key moments, and a description that says what the video shows in its first lines. None of it targets a single AI tool. It's the documented groundwork that lets Google show the video, lets answers link to it, and gives text answers words to quote.",
  },

  example: {
    title: "Google on images and video in generative AI search",
    context:
      "The \"Add high-quality images and video\" item in Google's guide to optimizing for generative AI features on Google Search, fetched on 4 November 2026.",
    excerpt: {
      kind: "quote",
      text: "Add high-quality images and video: Many people appreciate finding images and videos as they search for things online. As with Google Search overall, our generative AI search features can bring in relevant images and video, which means more opportunities for your website to appear beyond web page links. When it makes sense, look for ways to support your textual content with high-quality, relevant images and videos on your pages. If you're already following our image SEO best practices and video SEO documentation, you're already optimizing for generative AI search.",
    },
    points: [
      {
        label: "Another way in",
        text: "Google frames media as \"more opportunities for your website to appear beyond web page links.\" A video or image is a separate route into an answer, alongside the text citation.",
      },
      {
        label: "Support, not replace",
        text: "The advice is to support your textual content with images and video. The text still carries the answer; media makes the page more useful and gives answers something to show.",
      },
      {
        label: "No separate rulebook",
        text: "Google points back to its image SEO and video SEO documentation. That's why this lesson is mostly watch pages, VideoObject, alt text and sitemaps.",
      },
      {
        label: "\"When it makes sense\"",
        text: "Google hedges: add media where it helps people. A stock photo on every page isn't the goal.",
      },
    ],
    source: GOOGLE_AI_GUIDE,
  },

  audit: [
    {
      kind: "choice",
      id: "a-ai-media",
      prompt: "According to Google, how do you optimize images and video for its generative AI features?",
      options: [
        "Add AI-specific media markup",
        "Follow its image SEO and video SEO best practices",
        "Host every image on Google Drive",
        "Block Googlebot Images to protect your photos",
      ],
      answer: 1,
      explanation:
        "Google says that if you already follow its image SEO best practices and video SEO documentation, you're already optimizing for generative AI search.",
    },
    {
      kind: "choice",
      id: "a-watch-indexed",
      prompt: "Larkfield's watch page is indexed. Is its video therefore indexed?",
      options: [
        "Yes, always",
        "Not necessarily; Google says an indexed watch page doesn't mean the video is indexed",
        "Only if the video is on YouTube",
        "Only if the page has an image sitemap",
      ],
      answer: 1,
      explanation:
        "The page being indexed is a requirement, not a guarantee. Google checks the video separately, and its Video indexing report shows the reasons when it isn't indexed.",
    },
    {
      kind: "match",
      id: "a-match-video-tools",
      prompt: "Match each tool to its job.",
      pairs: [
        { term: "VideoObject", definition: "Describes a video: name, thumbnail, upload date, player or file" },
        { term: "Clip", definition: "Labels a segment with a name, start time and URL" },
        { term: "SeekToAction", definition: "Tells Google how your timestamp URLs work" },
        { term: "Video sitemap", definition: "Lists watch pages and their videos for discovery" },
      ],
      explanation:
        "VideoObject describes the video, Clip and SeekToAction enable key moments in two different ways, and the sitemap helps Google find videos.",
    },
    {
      kind: "blank",
      id: "a-blank-chapters",
      prompt: "Complete YouTube's chapter rules.",
      text: "The first timestamp starts with ___, the video has at least ___ timestamps in ascending order, and each chapter lasts at least 10 seconds.",
      answers: ["00:00", "three"],
      distractors: ["00:10", "five", "two"],
      explanation: "YouTube's chapters page sets those three rules: start at 00:00, at least three timestamps, 10 seconds minimum.",
    },
    {
      kind: "spot",
      id: "a-spot-image",
      prompt: "Which line has an image Google won't index?",
      language: "html",
      lines: [
        "<img src=\"/images/oolong-tin.jpg\" alt=\"Larkfield Tieguanyin oolong tin\">",
        "<picture><source srcset=\"/images/oolong-leaves.avif\" type=\"image/avif\"><img src=\"/images/oolong-leaves.jpg\" alt=\"Rolled oolong leaves\"></picture>",
        "<div style=\"background-image:url(/images/oolong-pour.jpg)\"></div>",
      ],
      answer: 2,
      explanation:
        "Google finds images in img elements, including inside picture with a fallback src. It doesn't index CSS background images.",
    },
    {
      kind: "passage",
      id: "a-passage-alt",
      prompt: "Which alt text is closer to Google's \"best\" example?",
      passages: ["tea", "A glass teapot of oolong steeping beside a Larkfield Tea tin"],
      answer: 1,
      explanation:
        "Google's best example is a short, specific description of what the image shows (Dalmatian puppy playing fetch), not a single generic word.",
    },
    {
      kind: "choice",
      id: "a-license-badge",
      prompt: "Using structured data, which property must an image have to be eligible for Google's Licensable badge?",
      options: ["caption", "license", "keywords", "thumbnailUrl"],
      answer: 1,
      explanation:
        "Alongside the required contentUrl, Google says that with structured data you must include license for the Licensable badge. acquireLicensePage is recommended too.",
    },
    {
      kind: "choice",
      id: "a-lens",
      prompt: "In Google's description of Lens in AI Mode, what happens after Lens identifies the objects in a photo?",
      options: [
        "AI Mode shows only visually similar images",
        "AI Mode issues multiple queries about the image and the objects in it, then answers with links",
        "The photo is matched against your image sitemap",
        "Nothing; Lens results don't link to websites",
      ],
      answer: 1,
      explanation:
        "Google says AI Mode uses query fan-out to issue multiple queries about the whole image and the objects in it, and responds with links to dive deeper.",
    },
    {
      kind: "order",
      id: "a-order-fix",
      prompt: "A Larkfield video doesn't appear in video results. Put the checks in a sensible order.",
      items: [
        "Confirm the watch page itself is indexed",
        "Confirm the video loads without a click and isn't hidden",
        "Confirm the thumbnail and video file aren't blocked and use stable URLs",
        "Check the VideoObject markup has name, thumbnailUrl and uploadDate",
      ],
      explanation:
        "Start with the page, since Google needs it indexed before the video can be considered, then the video's visibility, then fetchable files and thumbnail, then the markup.",
    },
    {
      kind: "choice",
      id: "a-chatgpt-images",
      prompt: "What does OpenAI's help page say about images in ChatGPT search answers?",
      options: [
        "Images are never shown",
        "You can select an image to view its source",
        "Images come only from Google Images",
        "Site owners can submit images to ChatGPT",
      ],
      answer: 1,
      explanation:
        "OpenAI's page says that if a response includes images, you can select an image to view its source. It doesn't document how images are chosen.",
    },
  ],
};
