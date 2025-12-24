import { useState, useEffect } from 'react';

export interface Bookmark {
  nodeId: string;
  label?: string;
  addedAt: number;
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    const stored = localStorage.getItem('node-bookmarks');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('node-bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const addBookmark = (nodeId: string, label?: string) => {
    if (!bookmarks.find(b => b.nodeId === nodeId)) {
      setBookmarks([...bookmarks, { nodeId, label, addedAt: Date.now() }]);
    }
  };

  const removeBookmark = (nodeId: string) => {
    setBookmarks(bookmarks.filter(b => b.nodeId !== nodeId));
  };

  const isBookmarked = (nodeId: string) => {
    return bookmarks.some(b => b.nodeId === nodeId);
  };

  const toggleBookmark = (nodeId: string, label?: string) => {
    if (isBookmarked(nodeId)) {
      removeBookmark(nodeId);
    } else {
      addBookmark(nodeId, label);
    }
  };

  const updateLabel = (nodeId: string, label: string) => {
    setBookmarks(bookmarks.map(b => 
      b.nodeId === nodeId ? { ...b, label } : b
    ));
  };

  return {
    bookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked,
    toggleBookmark,
    updateLabel
  };
}
