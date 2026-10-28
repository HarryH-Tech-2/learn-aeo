// The AEO glossary (/glossary): one data file per term in src/lib/content/glossary/.

import type { GlossaryTerm } from "./glossary-types";
import { term as t_aeo } from "./content/glossary/aeo";
import { term as t_aiMode } from "./content/glossary/ai-mode";
import { term as t_aiOverviews } from "./content/glossary/ai-overviews";
import { term as t_aiShareOfVoice } from "./content/glossary/ai-share-of-voice";
import { term as t_answerEngine } from "./content/glossary/answer-engine";
import { term as t_brandMention } from "./content/glossary/brand-mention";
import { term as t_citation } from "./content/glossary/citation";
import { term as t_claudebot } from "./content/glossary/claudebot";
import { term as t_crawlBudget } from "./content/glossary/crawl-budget";
import { term as t_eEAT } from "./content/glossary/e-e-a-t";
import { term as t_entity } from "./content/glossary/entity";
import { term as t_geo } from "./content/glossary/geo";
import { term as t_googleExtended } from "./content/glossary/google-extended";
import { term as t_gptbot } from "./content/glossary/gptbot";
import { term as t_grounding } from "./content/glossary/grounding";
import { term as t_indexnow } from "./content/glossary/indexnow";
import { term as t_jsonLd } from "./content/glossary/json-ld";
import { term as t_knowledgeGraph } from "./content/glossary/knowledge-graph";
import { term as t_llmo } from "./content/glossary/llmo";
import { term as t_llmsTxt } from "./content/glossary/llms-txt";
import { term as t_oaiSearchbot } from "./content/glossary/oai-searchbot";
import { term as t_passageRanking } from "./content/glossary/passage-ranking";
import { term as t_perplexitybot } from "./content/glossary/perplexitybot";
import { term as t_queryFanOut } from "./content/glossary/query-fan-out";
import { term as t_rag } from "./content/glossary/rag";
import { term as t_robotsTxt } from "./content/glossary/robots-txt";
import { term as t_sameAs } from "./content/glossary/same-as";
import { term as t_structuredData } from "./content/glossary/structured-data";
import { term as t_userAgent } from "./content/glossary/user-agent";
import { term as t_zeroClickSearch } from "./content/glossary/zero-click-search";

/** Every term, sorted A–Z by its display name. */
export const GLOSSARY: readonly GlossaryTerm[] = [
  t_aeo, t_aiMode, t_aiOverviews, t_aiShareOfVoice, t_answerEngine, t_brandMention, t_citation, t_claudebot,
  t_crawlBudget, t_eEAT, t_entity, t_geo, t_googleExtended, t_gptbot, t_grounding, t_indexnow, t_jsonLd,
  t_knowledgeGraph, t_llmo, t_llmsTxt, t_oaiSearchbot, t_passageRanking, t_perplexitybot, t_queryFanOut, t_rag,
  t_robotsTxt, t_sameAs, t_structuredData, t_userAgent, t_zeroClickSearch,
].sort((a, b) => a.term.toLowerCase().localeCompare(b.term.toLowerCase()));

export function getTerm(slug: string): GlossaryTerm | undefined {
  return GLOSSARY.find((t) => t.slug === slug);
}
