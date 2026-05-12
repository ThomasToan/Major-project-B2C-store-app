"use client";

import { useState } from "react";

export function LikeButton({ // define props
  initialLikes,
  initialLiked,
  urlId,
}: {
  initialLikes: number;
  initialLiked: boolean;
  urlId: string;
}) {
  const [likes, setLikes] = useState(initialLikes); // stores current likes count in React state
  const [liked, setLiked] = useState(initialLiked); // stores whether current user liked it
  const [pending, setPending] = useState(false); // stores loading/pending state

  async function handleClick() { // defines click handler
    if (pending) { // stop double clicking while requrest is pending
      return;
    }

    setPending(true); // set pending true

    try {
      const response = await fetch("/api/likes", { // sends fetch request to /api/likes
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }, // send JSON header
        body: JSON.stringify({ urlId }), // send urlID in the request body
      });

      if (!response.ok) {
        return; // stop if API fails
      }

      const body = (await response.json()) as { // read API response JSON
        liked: boolean;
        likes: number;
      };

      setLiked(body.liked); // update liked/unliked state
      setLikes(body.likes); // updates likes count
    } finally {
      setPending(false); // turns pending off
    }
  }

  return ( // render UI
    <div className="flex items-center gap-3">
      <span>{likes} likes</span>
      <button
        className="rounded-full border border-[color:var(--border-color)] px-4 py-2 text-sm font-medium text-primary transition hover:bg-[color:var(--surface-muted)]"
        data-test-id="like-button"
        disabled={pending} 
        onClick={handleClick}
        type="button"
      >
        {liked ? "Unlike" : "Like"}
      </button>
    </div>
  );
}
