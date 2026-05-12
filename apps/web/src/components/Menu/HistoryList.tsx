import { history } from "@/functions/history";
import { type Post } from "@repo/db/data";
import { LinkList } from "./LinkList";
import { SummaryItem } from "./SummaryItem";

const months = [ // This is an array used to convert a number into a month name.
  "", //Empty string for 0 index, since months are 1-indexed 
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function HistoryList({
  selectedYear,
  selectedMonth,
  posts,
}: {
  selectedYear?: string;
  selectedMonth?: string;
  posts: Post[];
// These are the props passed into the component.
}) {
  const historyItems = history(posts); // calls the history function using the posts

  return (
    <LinkList title="History">
      {historyItems.map((item) => { // loop through each item returned by history(posts)
        const label = `${months[item.month]}, ${item.year}`; // build a label

        return (
          <SummaryItem
            key={`${item.year}-${item.month}`} // unique key for each row
            count={item.count} // passes the number of posts for that month/ year
            isSelected={
              selectedYear === item.year.toString() && // checks whether the current row is the selected one
              selectedMonth === item.month.toString()
            }
            link={`/history/${item.year}/${item.month}`}
            name={label}
            title={`History / ${label}`}
          />
        );
      })}
    </LinkList>
  );
}
