const fs = require("fs");
const path = require("path");

const dir = path.join("src", "app", "(dashboard)", "(protected)", "admin", "actions");
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".ts"))) {
  const p = path.join(dir, f);
  let s = fs.readFileSync(p, "utf8");
  if (s.includes('from "@/lib/supabase/server"') && !s.includes("createClient(")) {
    s = s.replace(/import \{ createClient \} from "@\/lib\/supabase\/server";\n/, "");
    fs.writeFileSync(p, s);
    console.log("stripped", f);
  }
}

const coord = path.join("src", "app", "(dashboard)", "(protected)", "coordinador", "actions", "batchBookingActions.ts");
if (fs.existsSync(coord)) {
  let s = fs.readFileSync(coord, "utf8");
  if (s.includes('from "@/lib/supabase/server"') && !s.includes("createClient(")) {
    s = s.replace(/import \{ createClient \} from "@\/lib\/supabase\/server";\n/, "");
    fs.writeFileSync(coord, s);
    console.log("stripped batchBookingActions.ts");
  }
}
