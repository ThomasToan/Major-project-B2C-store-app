export function history(posts: { date: Date; active: boolean }[]): {
  month: number;
  year: number;
  count: number;
  // name function is history, input: list of posts, each post must have date = JavaScript Date object, active = boolean
}[] {
  return posts
    .filter((post) => post.active) // keeps only active posts
    .reduce(
      (acc, post) => { // acc =  result array, post = current post
        const month = post.date.getMonth() + 1; // extract month
        const year = post.date.getFullYear(); // extract year
        const current = acc.find((item) => item.month === month && item.year === year);
// Check if group already exists, look for: same month, same year
        if (current) {
          current.count += 1; // if exists, increase count
        } else { // if not, add new group with count 1
          acc.push({ month, year, count: 1 }); 
        }

        return acc; // return result array
      },
      [] as { month: number; year: number; count: number }[], // Start with empty array
    )
    .sort((a, b) => {
      if (a.year !== b.year) {
        return b.year - a.year; // Newest year first
      }

      return b.month - a.month; // Newest month first
    });
}
