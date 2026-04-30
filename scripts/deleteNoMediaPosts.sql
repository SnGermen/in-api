-- Удаляет все посты без медиа и связанные с ними лайки, комментарии и сохранения.

DELETE FROM "CommentLike"
WHERE "commentId" IN (
  SELECT c.id FROM "Comment" c
  WHERE c."postId" IN (
    SELECT p.id FROM "Post" p
    WHERE NOT EXISTS (
      SELECT 1 FROM "PostMedia" pm WHERE pm."postId" = p.id
    )
  )
);

DELETE FROM "Comment"
WHERE "postId" IN (
  SELECT p.id FROM "Post" p
  WHERE NOT EXISTS (
    SELECT 1 FROM "PostMedia" pm WHERE pm."postId" = p.id
  )
);

DELETE FROM "PostLike"
WHERE "postId" IN (
  SELECT p.id FROM "Post" p
  WHERE NOT EXISTS (
    SELECT 1 FROM "PostMedia" pm WHERE pm."postId" = p.id
  )
);

DELETE FROM "SavedPost"
WHERE "postId" IN (
  SELECT p.id FROM "Post" p
  WHERE NOT EXISTS (
    SELECT 1 FROM "PostMedia" pm WHERE pm."postId" = p.id
  )
);

DELETE FROM "Post"
WHERE NOT EXISTS (
  SELECT 1 FROM "PostMedia" pm WHERE pm."postId" = "Post".id
);
