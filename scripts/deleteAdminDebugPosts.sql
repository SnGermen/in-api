-- Удаляет посты от аккаунтов admin / debug / test / demo и связанные с ними данные.

DELETE FROM "CommentLike"
WHERE "commentId" IN (
  SELECT c.id FROM "Comment" c
  WHERE c."postId" IN (
    SELECT p.id FROM "Post" p
    JOIN "User" u ON u.id = p."authorId"
    WHERE lower(u.username) IN ('admin', 'debug')
      OR lower(u.username) LIKE '%debug%'
      OR lower(u.username) LIKE '%test%'
      OR lower(u.username) LIKE '%demo%'
  )
);

DELETE FROM "Comment"
WHERE "postId" IN (
  SELECT p.id FROM "Post" p
  JOIN "User" u ON u.id = p."authorId"
  WHERE lower(u.username) IN ('admin', 'debug')
    OR lower(u.username) LIKE '%debug%'
    OR lower(u.username) LIKE '%test%'
    OR lower(u.username) LIKE '%demo%'
);

DELETE FROM "PostLike"
WHERE "postId" IN (
  SELECT p.id FROM "Post" p
  JOIN "User" u ON u.id = p."authorId"
  WHERE lower(u.username) IN ('admin', 'debug')
    OR lower(u.username) LIKE '%debug%'
    OR lower(u.username) LIKE '%test%'
    OR lower(u.username) LIKE '%demo%'
);

DELETE FROM "SavedPost"
WHERE "postId" IN (
  SELECT p.id FROM "Post" p
  JOIN "User" u ON u.id = p."authorId"
  WHERE lower(u.username) IN ('admin', 'debug')
    OR lower(u.username) LIKE '%debug%'
    OR lower(u.username) LIKE '%test%'
    OR lower(u.username) LIKE '%demo%'
);

DELETE FROM "PostMedia"
WHERE "postId" IN (
  SELECT p.id FROM "Post" p
  JOIN "User" u ON u.id = p."authorId"
  WHERE lower(u.username) IN ('admin', 'debug')
    OR lower(u.username) LIKE '%debug%'
    OR lower(u.username) LIKE '%test%'
    OR lower(u.username) LIKE '%demo%'
);

DELETE FROM "Post"
WHERE "authorId" IN (
  SELECT u.id FROM "User" u
  WHERE lower(u.username) IN ('admin', 'debug')
    OR lower(u.username) LIKE '%debug%'
    OR lower(u.username) LIKE '%test%'
    OR lower(u.username) LIKE '%demo%'
);
