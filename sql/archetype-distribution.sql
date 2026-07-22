-- Which result people get, and how often it was a tie broken by the recency rule.
select
  archetype,
  count(*)                                                as total,
  count(*) filter (where tied)                            as tie_broken,
  round(100.0 * count(*) / sum(count(*)) over (), 1)      as pct_of_all
from results
group by archetype
order by total desc;
