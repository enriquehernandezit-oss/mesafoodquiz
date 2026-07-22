-- Where people drop off, from landing to completed result.
-- "answered_at_least_one" and "completed" are derived from events/results,
-- since a session row exists the moment someone lands (see /api/track "landing" phase).
select
  count(*) filter (where true)                                   as landed,
  count(*) filter (where q.max_seq is not null)                  as answered_at_least_one,
  count(*) filter (where r.session_id is not null)               as completed,
  round(
    100.0 * count(*) filter (where r.session_id is not null)
    / nullif(count(*), 0),
    1
  )                                                               as completion_rate_pct
from sessions s
left join results r on r.session_id = s.id
left join (
  select session_id, max(seq) as max_seq
  from events
  where type = 'question_answered'
  group by session_id
) q on q.session_id = s.id;

-- Drop-off by question index (1-based) -- how many sessions answered at least N questions.
select
  (payload->>'questionIndex')::int + 1 as question_number,
  count(distinct session_id)           as reached
from events
where type = 'question_answered'
group by 1
order by 1;
