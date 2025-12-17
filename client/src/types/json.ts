// A lightweight recursive JSON value type for consistent typing across the client
export type JSONValue = string | number | boolean | null | { [k: string]: JSONValue } | JSONValue[];

// (no default export; export types by name only)
