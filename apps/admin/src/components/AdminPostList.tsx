"use client";

import type { Post } from "@repo/db/data"; //imports post type
import Link from "next/link"; // Navigate in Next.js without reloading the whole page
import { useState } from "react"; // imports react state used to store content filter, tag filter, date filter, sort option
import styles from "../app/page.module.css";

type AdminPost = Omit<Post, "date"> & { // Uses the same post shape except date
  date: string;
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatTags(tags: string) { // turns the raw tags string into display text
  return tags
    .split(",") // splits the tags string into an array of individual tags
    .map((tag) => `#${tag.trim()}`) // trims whitespace and agg #
    .join(", "); // turn the array back into display text
}

function parseFilterDate(value: string) { // removes everything that is not a digit
  const digits = value.replace(/\D/g, ""); 

  if (digits.length !== 8) { // if date not exactly 8 digits, return undefined
    return undefined;
  }

  // splits the 8 digit string into day, month, year
  const day = Number(digits.slice(0, 2));
  const month = Number(digits.slice(2, 4)) - 1; // because JavaScipt Date
  const year = Number(digits.slice(4, 8));

  return new Date(year, month, day); // creates new Date object from the parsed values to compare post dates against filter date
}

function compareByTitle(a: AdminPost, b: AdminPost) { // compares two posts alplhabetically by title
  return a.title.localeCompare(b.title);
}

function compareByDate(a: AdminPost, b: AdminPost) { // compares two posts by date
  return new Date(a.date).getTime() - new Date(b.date).getTime(); // convert string dates into Date, date to timestamp with getTime() (negative then a is earlier)
}

export function AdminPostList({
  posts,
  toggleActiveAction,
}: {
  posts: AdminPost[];
  toggleActiveAction: (formData: FormData) => void | Promise<void>;
}) { // receives on prop: posts
  const [contentFilter, setContentFilter] = useState(""); // text typed into "Filter by Content
  const [tagFilter, setTagFilter] = useState(""); // text typed into "Filter by Tag"
  const [dateFilter, setDateFilter] = useState(""); // text typed into "Filter by Date Created
  const [visibilityFilter, setVisibilityFilter] = useState("all"); // useState() returns current value and function to update that value.
  // useState("all") means the default value is "all"
  const [sortBy, setSortBy] = useState("date-desc"); // drowndown selection newest posts first

  const normalizedContent = contentFilter.trim().toLowerCase(); // Removes extra spaces, makes search case-insensitive
  const normalizedTag = tagFilter.trim().toLowerCase(); // same idea
  const createdAfter = parseFilterDate(dateFilter); // turns date filter string into a Date

  const visiblePosts = posts // starts with the fill list of posts
    .filter((post) => { // filters posts
      const matchesContent = // match everything if content filter is empty
        !normalizedContent || // otherwise, match if query is found in title or content
        post.title.toLowerCase().includes(normalizedContent) ||
        post.content.toLowerCase().includes(normalizedContent);

      const matchesTag = // match everything if no tag filter
        !normalizedTag || post.tags.toLowerCase().includes(normalizedTag); 

      const matchesDate = // match everything if no valid date entered
        !createdAfter || new Date(post.date).getTime() >= createdAfter.getTime(); 

      const matchesVisibility = 
        visibilityFilter === "all" || // if selected option is all
        (visibilityFilter === "active" && post.active) || // if selected option is Active and post.active is true
        (visibilityFilter === "inactive" && !post.active); // if selected option is Inactive and post.active is false

      return matchesContent && matchesTag && matchesDate && matchesVisibility; // combined filter: post must match content, tag, date, and visibility filters to be included in visiblePosts
    })
    .sort((a, b) => { // sorts remaining posts, after filtering
      switch (sortBy) {
        case "title-asc": 
          return compareByTitle(a, b);
        case "title-desc":
          return compareByTitle(b, a);
        case "date-asc":
          return compareByDate(a, b);
        case "date-desc":
        default:
          return compareByDate(b, a);
      }
    }); 

  return (
    <>
      <form className={styles.filters}>
        <div className={styles.field}>
          <label htmlFor="content-filter">Filter by Content:</label> {/* Content filter label */}
          <input
            className={styles.input}
            id="content-filter" // give input an id
            value={contentFilter} 
            onChange={(event) => setContentFilter(event.target.value)} 
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="tag-filter">Filter by Tag:</label> {/* Tag filter label */}
          <input
            className={styles.input}
            id="tag-filter"
            value={tagFilter} 
            onChange={(event) => setTagFilter(event.target.value)} 
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="date-filter">Filter by Date Created:</label> {/* Date filter label */}
          <input
            className={styles.input}
            id="date-filter" 
            value={dateFilter} 
            onChange={(event) => setDateFilter(event.target.value)} 
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="visibility-filter">Filter by Visibility:</label>
          <select
            className={styles.select}
            id="visibility-filter"
            value={visibilityFilter}
            onChange={(event) => setVisibilityFilter(event.target.value)}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="sort-by">Sort By:</label>
          <select
            className={styles.select}
            id="sort-by"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
          >
            <option value="date-desc">Date descending</option> {/* These value correspond exactly to the switch(sortBy) cases */}
            <option value="date-asc">Date ascending</option>
            <option value="title-asc">Title ascending</option>
            <option value="title-desc">Title descending</option>
          </select>
        </div>
      </form>

      <Link className={styles.createLink} href="/posts/create">Create Post</Link> {/* Link to create post */}

      <section className={styles.articleList}>
        {visiblePosts.map((post) => ( // Loops through the filterd list and render on article per visible post
          <article className={styles.articleCard} key={post.id}> {/* one article per post */}
            <img alt={post.title} className={styles.articleImage} src={post.imageUrl} /> {/* show image */}
            <div className={styles.articleBody}>
              <h2>
                <Link href={`/post/${post.urlId}`}>{post.title}</Link> {/* title is clickable */}
              </h2>
              <p>{post.category}</p> {/* show category */}
              <p>{formatTags(post.tags)}</p> {/* Display tags */}
              <p>Posted on {dateFormatter.format(new Date(post.date))}</p> {/* Display date */}
              <form action={toggleActiveAction}> {/* When this fomr submits, it calls the server action from page.tsx*/}
                <input name="urlId" type="hidden" value={post.urlId} /> {/* This sends the post identity invisibly (user does not see it, but server receives it)*/}
                <button className={styles.button} type="submit">{post.active ? "Active" : "Inactive"}</button> {/* Show active status */}
              </form>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
