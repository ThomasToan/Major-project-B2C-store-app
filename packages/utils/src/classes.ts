export function cx(
  ...classes: Array<
    string | Record<string, boolean | null | undefined> | null | undefined
  >
): string {
  const result: string[] = []; // create an array to hold the classes that will be added to the result string

  for (const cls of classes) {
    if (!cls) continue; //igore null and undefined

    if (typeof cls === "string") { //handle strings
      result.push(cls);
      }else {
        for (const [key, value] of Object.entries(cls)) { //handle objects
          if (value) {
            result.push(key);
       }
     }
   }
}

  // class helper that turns a list of classes into a single string
  // if one of the classes is an object, it will add the key if the value is truthy

  // e.g. cx("foo", "bar") => "foo bar"
  // e.g. cx("foo", { bar: true }) => "foo bar"
  return result.join(" ");
}

export default cx;
