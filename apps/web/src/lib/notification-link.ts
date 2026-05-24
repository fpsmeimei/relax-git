export function buildNotificationHref(n: any) {
  try {
    const snapshotId = n?.comment?.snapshotId ?? n?.snapshotId;
    const filePath = n?.comment?.filePath;
    const lineStart = n?.comment?.lineStart;
    const commentId = n?.commentId ?? n?.comment?.id;

    if (snapshotId) {
      const params = new URLSearchParams();
      if (filePath) params.set('file', filePath);
      if (typeof lineStart === 'number') {
        params.set('line', String(lineStart));
      }
      if (commentId) params.set('commentId', String(commentId));
      const query = params.toString();
      return query
        ? `/snapshots/${snapshotId}?${query}`
        : `/snapshots/${snapshotId}`;
    }

    const repositoryId = n?.comment?.snapshot?.repository?.id ?? n?.repoId;
    if (repositoryId) {
      if (commentId) {
        return `/repositories/${repositoryId}?tab=discussion&commentId=${encodeURIComponent(String(commentId))}`;
      }
      return `/repositories/${repositoryId}`;
    }

    return '/community';
  } catch {
    return '/community';
  }
}
