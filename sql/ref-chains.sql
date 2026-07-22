-- How much of the funnel is driven by referrals (the "Enviar al grupo" loop)
-- vs. cold traffic (WhatsApp broadcast, IG bio, IG story).
select
  coalesce(source::text, 'unknown') as source,
  count(*) filter (where ref is not null) as referred,
  count(*) filter (where ref is null)     as cold,
  count(*)                                as total
from sessions
group by source
order by total desc;

-- Top referrers by how many downstream sessions they kicked off.
select
  s.ref                    as referrer_session_id,
  r.archetype               as referrer_archetype,
  count(*)                  as referred_sessions,
  count(*) filter (where rr.session_id is not null) as referred_completions
from sessions s
left join results r on r.session_id = s.ref
left join results rr on rr.session_id = s.id
where s.ref is not null
group by s.ref, r.archetype
order by referred_sessions desc
limit 50;
