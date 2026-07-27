import rules from "./rules.json" with { type: "json" };

type Rule = {
  id: string;
  when: {
    type: string;
    payload_path: string;
    op: "lt" | "gt" | "eq";
    value: number | string | boolean;
  };
  add_flags: string[];
};

function readPath(payload: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as object)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, payload);
}

function matchOp(op: Rule["when"]["op"], left: unknown, right: Rule["when"]["value"]): boolean {
  if (op === "lt" || op === "gt") {
    if (typeof left !== "number" || typeof right !== "number") return false;
    return op === "lt" ? left < right : left > right;
  }
  return left === right;
}

/** Pure triage: returns merged unique flags. Does not know domain meaning beyond rules.json. */
export function applyTriage(
  type: string,
  payload: Record<string, unknown>,
  existingFlags: string[] = [],
): string[] {
  const flags = new Set(existingFlags);
  for (const rule of rules as Rule[]) {
    if (rule.when.type !== type) continue;
    const left = readPath(payload, rule.when.payload_path);
    if (!matchOp(rule.when.op, left, rule.when.value)) continue;
    for (const f of rule.add_flags) flags.add(f);
  }
  return [...flags];
}
