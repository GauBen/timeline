CREATE VIEW timeline
WITH (security_invoker = true)
AS SELECT
  users.id AS user_id,
  events.id,
  events.created_at,
  events.date,
  events.duration,
  events.body,
  events.public,
  events.author_id,
  author_id = users.id OR EXISTS (
    SELECT
      1
    FROM
      follows
    WHERE
      follower_id = users.id
      AND following_id = events.author_id
  ) AS followed,
  author_id = users.id OR (
    SELECT
      added
    FROM
      events_to_users
    WHERE
      event_id = events.id
      AND user_id = users.id
  ) AS added
FROM
  events
  CROSS JOIN users
WHERE
  events.public
  OR EXISTS (
    SELECT
      1
    FROM
      events_to_users
    WHERE
      event_id = events.id
      AND user_id = users.id
      AND shared
  )
