SELECT
  users.id AS user_id,
  events.id,
  events.created_at,
  events.start,
  events.start_timezone,
  events.end,
  events.end_timezone,
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
  OR author_id = users.id
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
