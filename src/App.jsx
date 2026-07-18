import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Plus, X, Trash2, Camera, Bell, ChevronRight, Search, Syringe,
  ArrowLeft, Pencil, CheckSquare, Square, AlertTriangle, Milk,
  ClipboardList, Calendar
} from "lucide-react";

/* ---------------------------------------------------------
   TOKENS
--------------------------------------------------------- */
const C = {
  paper: "#EFEAD9",
  paperDark: "#E4DCC2",
  card: "#FBF8EF",
  ink: "#2B2A25",
  inkSoft: "#655F4F",
  border: "#D9CDA6",
  green: "#425C3A",
  greenSoft: "#DDE4CE",
  red: "#9C3B2E",
  redSoft: "#F1DCD4",
  yellow: "#C98A1F",
  yellowSoft: "#F4E3BE",
  gray: "#8A8272",
  graySoft: "#E7E1D0",
};

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const fmtDate = (d) => {
  if (!d) return "—";
  const dt = new Date(d + "T00:00:00");
  if (isNaN(dt)) return "—";
  return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const addMonths = (dateStr, n) => {
  const d = new Date(dateStr + "T00:00:00");
  d.setMonth(d.getMonth() + n);
  return d.toISOString().slice(0, 10);
};

const daysUntil = (dateStr) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + "T00:00:00");
  return Math.round((d - today) / 86400000);
};

const VACCINE_SUGGESTIONS = [
  "FMD (Foot & Mouth Disease)",
  "HS (Haemorrhagic Septicaemia)",
  "BQ (Black Quarter)",
  "Brucellosis",
  "PPR (Peste des Petits Ruminants)",
  "Enterotoxaemia",
  "Anthrax",
];

/* ---------------------------------------------------------
   SMALL UI PRIMITIVES
--------------------------------------------------------- */
function TagChip({ tag, color = C.green, size = "md" }) {
  const pad = size === "lg" ? "px-4 py-2 text-base" : "px-3 py-1 text-sm";
  return (
    <span
      className={`relative inline-flex items-center rounded-md font-bold shadow-sm ${pad}`}
      style={{ backgroundColor: color, color: "#FBF8EF", fontFamily: "'IBM Plex Mono', monospace" }}
    >
      <span
        className="absolute rounded-full"
        style={{
          left: "-4px",
          width: "8px",
          height: "8px",
          backgroundColor: "#FBF8EF",
          border: `1px solid ${color}`,
        }}
      />
      #{tag}
    </span>
  );
}

function Badge({ children, tone = "green" }) {
  const map = {
    green: { bg: C.greenSoft, fg: C.green },
    red: { bg: C.redSoft, fg: C.red },
    yellow: { bg: C.yellowSoft, fg: C.yellow },
    gray: { bg: C.graySoft, fg: C.gray },
  };
  const t = map[tone];
  return (
    <span
      className="inline-block px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide"
      style={{ backgroundColor: t.bg, color: t.fg }}
    >
      {children}
    </span>
  );
}

function Btn({ children, onClick, variant = "primary", icon: Icon, type = "button", small }) {
  const base = "inline-flex items-center gap-1.5 rounded-lg font-semibold transition-colors";
  const size = small ? "px-2.5 py-1.5 text-xs" : "px-4 py-2 text-sm";
  const styles = {
    primary: { backgroundColor: C.green, color: "#fff" },
    danger: { backgroundColor: C.red, color: "#fff" },
    ghost: { backgroundColor: "transparent", color: C.ink, border: `1px solid ${C.border}` },
  };
  return (
    <button type={type} onClick={onClick} className={`${base} ${size}`} style={styles[variant]}>
      {Icon && <Icon size={small ? 14 : 16} />}
      {children}
    </button>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-semibold" style={{ color: C.inkSoft }}>{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-md px-3 py-2 text-sm outline-none focus:ring-2 bg-white";
const inputStyle = { border: `1px solid ${C.border}`, color: C.ink };

function PhotoPicker({ value, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-16 h-16 rounded-lg flex items-center justify-center overflow-hidden shrink-0"
        style={{ backgroundColor: C.paperDark, border: `1px solid ${C.border}` }}
      >
        {value ? (
          <img src={value} alt="animal" className="w-full h-full object-cover" />
        ) : (
          <Camera size={22} color={C.gray} />
        )}
      </div>
      <label
        className="cursor-pointer text-xs font-semibold px-3 py-2 rounded-md"
        style={{ border: `1px solid ${C.border}`, color: C.inkSoft }}
      >
        {value ? "Change photo" : "Add photo"}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => onChange(ev.target.result);
            reader.readAsDataURL(file);
          }}
        />
      </label>
    </div>
  );
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 overflow-y-auto"
      style={{ backgroundColor: "rgba(43,42,37,0.55)" }}
    >
      <div
        className={`w-full ${wide ? "max-w-2xl" : "max-w-md"} rounded-xl shadow-xl my-6`}
        style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}
      >
        <div
          className="flex items-center justify-between px-5 py-4 rounded-t-xl"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <h3 className="font-bold text-lg" style={{ fontFamily: "'Zilla Slab', serif", color: C.ink }}>
            {title}
          </h3>
          <button onClick={onClose} className="p-1 rounded hover:opacity-70">
            <X size={20} color={C.inkSoft} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   COW FORM
--------------------------------------------------------- */
function CowForm({ initial, onSave, onCancel }) {
  const [f, setF] = useState(
    initial || {
      tag: "",
      age: "",
      lactation: "",
      status: "Milking",
      pregnant: "No",
      breedingDate: "",
      photo: "",
    }
  );
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const estCalving = f.pregnant === "Yes" && f.breedingDate ? addMonths(f.breedingDate, 9) : "";

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!f.tag) return;
        onSave({ ...f, estCalvingDate: estCalving });
      }}
    >
      <PhotoPicker value={f.photo} onChange={(v) => set("photo", v)} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Tag number">
          <input required className={inputCls} style={inputStyle} value={f.tag}
            onChange={(e) => set("tag", e.target.value)} placeholder="e.g. 214" />
        </Field>
        <Field label="Age (years)">
          <input type="number" step="0.1" className={inputCls} style={inputStyle} value={f.age}
            onChange={(e) => set("age", e.target.value)} placeholder="e.g. 4" />
        </Field>
        <Field label="Lactation number">
          <input type="number" className={inputCls} style={inputStyle} value={f.lactation}
            onChange={(e) => set("lactation", e.target.value)} placeholder="e.g. 2" />
        </Field>
        <Field label="Current status">
          <select className={inputCls} style={inputStyle} value={f.status}
            onChange={(e) => set("status", e.target.value)}>
            <option>Milking</option>
            <option>Dry</option>
          </select>
        </Field>
        <Field label="Pregnant?">
          <select className={inputCls} style={inputStyle} value={f.pregnant}
            onChange={(e) => set("pregnant", e.target.value)}>
            <option>No</option>
            <option>Yes</option>
          </select>
        </Field>
        {f.pregnant === "Yes" && (
          <Field label="Breeding / insemination date">
            <input type="date" className={inputCls} style={inputStyle} value={f.breedingDate}
              onChange={(e) => set("breedingDate", e.target.value)} />
          </Field>
        )}
      </div>
      {f.pregnant === "Yes" && f.breedingDate && (
        <div className="rounded-md px-3 py-2 text-sm" style={{ backgroundColor: C.greenSoft, color: C.green }}>
          Estimated calving date (9 months): <strong>{fmtDate(estCalving)}</strong>
        </div>
      )}
      <div className="flex justify-end gap-2 pt-1">
        <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
        <Btn type="submit">Save cow</Btn>
      </div>
    </form>
  );
}

/* ---------------------------------------------------------
   CALF FORM
--------------------------------------------------------- */
function CalfForm({ initial, cows, onSave, onCancel }) {
  const [f, setF] = useState(initial || { tag: "", dob: "", motherTag: "", photo: "" });
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!f.tag) return;
        onSave(f);
      }}
    >
      <PhotoPicker value={f.photo} onChange={(v) => set("photo", v)} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Calf tag number">
          <input required className={inputCls} style={inputStyle} value={f.tag}
            onChange={(e) => set("tag", e.target.value)} placeholder="e.g. C-31" />
        </Field>
        <Field label="Date of calving">
          <input type="date" className={inputCls} style={inputStyle} value={f.dob}
            onChange={(e) => set("dob", e.target.value)} />
        </Field>
        <Field label="Mother's tag number">
          <input list="mother-tags" className={inputCls} style={inputStyle} value={f.motherTag}
            onChange={(e) => set("motherTag", e.target.value)} placeholder="e.g. 214" />
          <datalist id="mother-tags">
            {cows.map((c) => <option key={c.tag} value={c.tag} />)}
          </datalist>
        </Field>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
        <Btn type="submit">Save calf</Btn>
      </div>
    </form>
  );
}

/* ---------------------------------------------------------
   BEEF / MUTTON FORM
--------------------------------------------------------- */
function BeefForm({ initial, onSave, onCancel }) {
  const [f, setF] = useState(
    initial || {
      tag: "",
      category: "Beef",
      subtype: "Sheep",
      purchaseDate: "",
      purchasePrice: "",
      purchaseWeight: "",
      photo: "",
    }
  );
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!f.tag) return;
        onSave(f);
      }}
    >
      <PhotoPicker value={f.photo} onChange={(v) => set("photo", v)} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Tag number">
          <input required className={inputCls} style={inputStyle} value={f.tag}
            onChange={(e) => set("tag", e.target.value)} placeholder="e.g. B-07" />
        </Field>
        <Field label="Category">
          <select className={inputCls} style={inputStyle} value={f.category}
            onChange={(e) => set("category", e.target.value)}>
            <option>Beef</option>
            <option>Mutton</option>
          </select>
        </Field>
        {f.category === "Mutton" && (
          <Field label="Mutton type">
            <select className={inputCls} style={inputStyle} value={f.subtype}
              onChange={(e) => set("subtype", e.target.value)}>
              <option>Sheep</option>
              <option>Goat</option>
            </select>
          </Field>
        )}
        <Field label="Date of purchase">
          <input type="date" className={inputCls} style={inputStyle} value={f.purchaseDate}
            onChange={(e) => set("purchaseDate", e.target.value)} />
        </Field>
        <Field label="Purchase price">
          <input type="number" className={inputCls} style={inputStyle} value={f.purchasePrice}
            onChange={(e) => set("purchasePrice", e.target.value)} placeholder="Rs." />
        </Field>
        <Field label="Purchasing weight (kg)">
          <input type="number" className={inputCls} style={inputStyle} value={f.purchaseWeight}
            onChange={(e) => set("purchaseWeight", e.target.value)} />
        </Field>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
        <Btn type="submit">Save animal</Btn>
      </div>
    </form>
  );
}

/* ---------------------------------------------------------
   VACCINE FORM
--------------------------------------------------------- */
function VaccineForm({ allAnimals, onSave, onCancel }) {
  const [f, setF] = useState({ animalTag: "", vaccineName: "", dateGiven: "", nextDue: "" });
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!f.animalTag || !f.vaccineName) return;
        onSave(f);
      }}
    >
      <Field label="Animal tag number">
        <input list="all-tags" required className={inputCls} style={inputStyle} value={f.animalTag}
          onChange={(e) => set("animalTag", e.target.value)} placeholder="e.g. 214" />
        <datalist id="all-tags">
          {allAnimals.map((a) => <option key={a.tag} value={a.tag}>{a.type}</option>)}
        </datalist>
      </Field>
      <Field label="Vaccine name">
        <input list="vaccine-names" required className={inputCls} style={inputStyle} value={f.vaccineName}
          onChange={(e) => set("vaccineName", e.target.value)} placeholder="e.g. FMD" />
        <datalist id="vaccine-names">
          {VACCINE_SUGGESTIONS.map((v) => <option key={v} value={v} />)}
        </datalist>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Date given">
          <input type="date" className={inputCls} style={inputStyle} value={f.dateGiven}
            onChange={(e) => set("dateGiven", e.target.value)} />
        </Field>
        <Field label="Next due date">
          <input type="date" required className={inputCls} style={inputStyle} value={f.nextDue}
            onChange={(e) => set("nextDue", e.target.value)} />
        </Field>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
        <Btn type="submit">Save vaccine record</Btn>
      </div>
    </form>
  );
}

/* ---------------------------------------------------------
   DASHBOARD
--------------------------------------------------------- */
function StatCard({ emoji, label, count, color, soft, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start gap-2 rounded-xl p-4 text-left transition-transform hover:-translate-y-0.5"
      style={{ backgroundColor: soft, border: `1px solid ${C.border}` }}
    >
      <div className="flex items-center justify-between w-full">
        <span className="text-3xl leading-none">{emoji}</span>
        <span
          className="text-2xl font-bold"
          style={{ fontFamily: "'Zilla Slab', serif", color }}
        >
          {count}
        </span>
      </div>
      <span className="text-sm font-semibold" style={{ color: C.inkSoft }}>{label}</span>
    </button>
  );
}

function Dashboard({ cows, calves, beef, vaccines, setPage, setBeefTab }) {
  const dueVaccines = useMemo(
    () => vaccines.filter((v) => daysUntil(v.nextDue) <= 7).sort((a, b) => daysUntil(a.nextDue) - daysUntil(b.nextDue)),
    [vaccines]
  );
  const beefCattle = beef.filter((b) => b.category === "Beef").length;
  const sheep = beef.filter((b) => b.category === "Mutton" && b.subtype === "Sheep").length;
  const goat = beef.filter((b) => b.category === "Mutton" && b.subtype === "Goat").length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "'Zilla Slab', serif", color: C.ink }}>
          Herd overview
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <StatCard emoji="🐄" label="Adult cows" count={cows.length} color={C.green} soft={C.greenSoft}
            onClick={() => setPage("cows")} />
          <StatCard emoji="🐮" label="Calves" count={calves.length} color={C.green} soft={C.greenSoft}
            onClick={() => setPage("calves")} />
          <StatCard emoji="🐂" label="Beef cattle" count={beefCattle} color={C.red} soft={C.redSoft}
            onClick={() => { setBeefTab("Beef"); setPage("beef"); }} />
          <StatCard emoji="🐑" label="Sheep" count={sheep} color={C.red} soft={C.redSoft}
            onClick={() => { setBeefTab("Sheep"); setPage("beef"); }} />
          <StatCard emoji="🐐" label="Goats" count={goat} color={C.red} soft={C.redSoft}
            onClick={() => { setBeefTab("Goat"); setPage("beef"); }} />
        </div>
      </div>

      <div>
        <button
          onClick={() => setPage("vaccines")}
          className="w-full flex items-center justify-between rounded-xl p-4 text-left"
          style={{
            backgroundColor: dueVaccines.length ? C.yellowSoft : C.card,
            border: `1px solid ${C.border}`,
          }}
        >
          <div className="flex items-center gap-3">
            <Bell size={20} color={dueVaccines.length ? C.yellow : C.gray} />
            <div>
              <p className="font-bold" style={{ color: C.ink }}>
                {dueVaccines.length ? `${dueVaccines.length} vaccine reminder(s)` : "No vaccines due this week"}
              </p>
              {dueVaccines.length > 0 && (
                <p className="text-xs" style={{ color: C.inkSoft }}>
                  {dueVaccines.slice(0, 3).map((v) => `#${v.animalTag} · ${v.vaccineName}`).join("  •  ")}
                </p>
              )}
            </div>
          </div>
          <ChevronRight size={18} color={C.inkSoft} />
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   COWS PAGE
--------------------------------------------------------- */
function CowsPage({ cows, addCow, updateCow, deleteCow }) {
  const [showAdd, setShowAdd] = useState(false);
  const [detail, setDetail] = useState(null);
  const [editing, setEditing] = useState(false);

  const active = cows.find((c) => c.tag === detail);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold" style={{ fontFamily: "'Zilla Slab', serif", color: C.ink }}>
          Adult cows ({cows.length})
        </h2>
        <Btn icon={Plus} onClick={() => setShowAdd(true)}>Add cow</Btn>
      </div>

      {cows.length === 0 ? (
        <EmptyState text="No cows recorded yet. Add your first milking animal to start tracking lactation, pregnancy and vaccines." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {cows.map((c) => (
            <button
              key={c.tag}
              onClick={() => setDetail(c.tag)}
              className="text-left rounded-xl p-4 flex gap-3"
              style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}
            >
              <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0" style={{ backgroundColor: C.paperDark }}>
                {c.photo ? <img src={c.photo} className="w-full h-full object-cover" /> : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🐄</div>
                )}
              </div>
              <div className="flex flex-col gap-1.5 min-w-0">
                <TagChip tag={c.tag} />
                <div className="flex flex-wrap gap-1">
                  <Badge tone={c.status === "Milking" ? "green" : "gray"}>{c.status}</Badge>
                  {c.pregnant === "Yes" && <Badge tone="yellow">Pregnant</Badge>}
                </div>
                <p className="text-xs" style={{ color: C.inkSoft }}>
                  Age {c.age || "—"} · Lactation {c.lactation || "—"}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {showAdd && (
        <Modal title="Add cow" onClose={() => setShowAdd(false)}>
          <CowForm onCancel={() => setShowAdd(false)} onSave={(data) => { addCow({ ...data, id: uid() }); setShowAdd(false); }} />
        </Modal>
      )}

      {active && !editing && (
        <Modal title={`Cow #${active.tag}`} onClose={() => setDetail(null)}>
          <div className="flex flex-col gap-4">
            {active.photo && <img src={active.photo} className="w-full h-48 object-cover rounded-lg" />}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Detail label="Age" value={`${active.age || "—"} years`} />
              <Detail label="Lactation number" value={active.lactation || "—"} />
              <Detail label="Status" value={active.status} />
              <Detail label="Pregnant" value={active.pregnant} />
              {active.pregnant === "Yes" && (
                <Detail label="Estimated calving date" value={fmtDate(active.estCalvingDate)} />
              )}
            </div>
            <div className="flex justify-between pt-2">
              <Btn variant="danger" icon={Trash2} onClick={() => { deleteCow(active.tag); setDetail(null); }}>Delete</Btn>
              <Btn variant="ghost" icon={Pencil} onClick={() => setEditing(true)}>Edit</Btn>
            </div>
          </div>
        </Modal>
      )}

      {active && editing && (
        <Modal title={`Edit cow #${active.tag}`} onClose={() => setEditing(false)}>
          <CowForm
            initial={active}
            onCancel={() => setEditing(false)}
            onSave={(data) => { updateCow(active.tag, data); setEditing(false); setDetail(null); }}
          />
        </Modal>
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   CALVES PAGE
--------------------------------------------------------- */
function CalvesPage({ calves, cows, addCalf, updateCalf, deleteCalf }) {
  const [showAdd, setShowAdd] = useState(false);
  const [detail, setDetail] = useState(null);
  const [editing, setEditing] = useState(false);
  const active = calves.find((c) => c.tag === detail);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold" style={{ fontFamily: "'Zilla Slab', serif", color: C.ink }}>
          Calves ({calves.length})
        </h2>
        <Btn icon={Plus} onClick={() => setShowAdd(true)}>Add calf</Btn>
      </div>

      {calves.length === 0 ? (
        <EmptyState text="No calves recorded yet. Add a calf and link it to its mother's tag number." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {calves.map((c) => (
            <button key={c.tag} onClick={() => setDetail(c.tag)}
              className="text-left rounded-xl p-4 flex gap-3"
              style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
              <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0" style={{ backgroundColor: C.paperDark }}>
                {c.photo ? <img src={c.photo} className="w-full h-full object-cover" /> : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🐮</div>
                )}
              </div>
              <div className="flex flex-col gap-1.5 min-w-0">
                <TagChip tag={c.tag} />
                <p className="text-xs" style={{ color: C.inkSoft }}>Born {fmtDate(c.dob)}</p>
                <p className="text-xs" style={{ color: C.inkSoft }}>Mother #{c.motherTag || "—"}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {showAdd && (
        <Modal title="Add calf" onClose={() => setShowAdd(false)}>
          <CalfForm cows={cows} onCancel={() => setShowAdd(false)}
            onSave={(data) => { addCalf({ ...data, id: uid() }); setShowAdd(false); }} />
        </Modal>
      )}

      {active && !editing && (
        <Modal title={`Calf #${active.tag}`} onClose={() => setDetail(null)}>
          <div className="flex flex-col gap-4">
            {active.photo && <img src={active.photo} className="w-full h-48 object-cover rounded-lg" />}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Detail label="Date of calving" value={fmtDate(active.dob)} />
              <Detail label="Mother's tag" value={active.motherTag || "—"} />
            </div>
            <div className="flex justify-between pt-2">
              <Btn variant="danger" icon={Trash2} onClick={() => { deleteCalf(active.tag); setDetail(null); }}>Delete</Btn>
              <Btn variant="ghost" icon={Pencil} onClick={() => setEditing(true)}>Edit</Btn>
            </div>
          </div>
        </Modal>
      )}

      {active && editing && (
        <Modal title={`Edit calf #${active.tag}`} onClose={() => setEditing(false)}>
          <CalfForm initial={active} cows={cows} onCancel={() => setEditing(false)}
            onSave={(data) => { updateCalf(active.tag, data); setEditing(false); setDetail(null); }} />
        </Modal>
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   BEEF & MUTTON PAGE
--------------------------------------------------------- */
function BeefPage({ beef, tab, setTab, addBeef, updateBeef, deleteBeef }) {
  const [showAdd, setShowAdd] = useState(false);
  const [detail, setDetail] = useState(null);
  const [editing, setEditing] = useState(false);
  const active = beef.find((b) => b.tag === detail);

  const filtered = beef.filter((b) => {
    if (tab === "All") return true;
    if (tab === "Beef") return b.category === "Beef";
    return b.category === "Mutton" && b.subtype === tab;
  });

  const tabs = ["All", "Beef", "Sheep", "Goat"];
  const emojiFor = (b) => (b.category === "Beef" ? "🐂" : b.subtype === "Sheep" ? "🐑" : "🐐");

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-lg font-bold" style={{ fontFamily: "'Zilla Slab', serif", color: C.ink }}>
          Beef & mutton ({beef.length})
        </h2>
        <Btn icon={Plus} onClick={() => setShowAdd(true)}>Add animal</Btn>
      </div>

      <div className="flex gap-2 mb-4">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className="px-3 py-1.5 rounded-md text-sm font-semibold"
            style={{
              backgroundColor: tab === t ? C.red : "transparent",
              color: tab === t ? "#fff" : C.inkSoft,
              border: `1px solid ${tab === t ? C.red : C.border}`,
            }}>
            {t}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState text="No animals in this category yet. Add one to track its purchase details and weight." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((b) => (
            <button key={b.tag} onClick={() => setDetail(b.tag)}
              className="text-left rounded-xl p-4 flex gap-3"
              style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
              <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0" style={{ backgroundColor: C.paperDark }}>
                {b.photo ? <img src={b.photo} className="w-full h-full object-cover" /> : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">{emojiFor(b)}</div>
                )}
              </div>
              <div className="flex flex-col gap-1.5 min-w-0">
                <TagChip tag={b.tag} color={C.red} />
                <Badge tone="red">{b.category === "Beef" ? "Beef cattle" : b.subtype}</Badge>
                <p className="text-xs" style={{ color: C.inkSoft }}>Purchased {fmtDate(b.purchaseDate)}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {showAdd && (
        <Modal title="Add beef / mutton animal" onClose={() => setShowAdd(false)}>
          <BeefForm onCancel={() => setShowAdd(false)}
            onSave={(data) => { addBeef({ ...data, id: uid() }); setShowAdd(false); }} />
        </Modal>
      )}

      {active && !editing && (
        <Modal title={`#${active.tag}`} onClose={() => setDetail(null)}>
          <div className="flex flex-col gap-4">
            {active.photo && <img src={active.photo} className="w-full h-48 object-cover rounded-lg" />}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Detail label="Category" value={active.category === "Beef" ? "Beef cattle" : `Mutton — ${active.subtype}`} />
              <Detail label="Date of purchase" value={fmtDate(active.purchaseDate)} />
              <Detail label="Purchase price" value={active.purchasePrice ? `Rs. ${active.purchasePrice}` : "—"} />
              <Detail label="Purchasing weight" value={active.purchaseWeight ? `${active.purchaseWeight} kg` : "—"} />
            </div>
            <div className="flex justify-between pt-2">
              <Btn variant="danger" icon={Trash2} onClick={() => { deleteBeef(active.tag); setDetail(null); }}>Delete</Btn>
              <Btn variant="ghost" icon={Pencil} onClick={() => setEditing(true)}>Edit</Btn>
            </div>
          </div>
        </Modal>
      )}

      {active && editing && (
        <Modal title={`Edit #${active.tag}`} onClose={() => setEditing(false)}>
          <BeefForm initial={active} onCancel={() => setEditing(false)}
            onSave={(data) => { updateBeef(active.tag, data); setEditing(false); setDetail(null); }} />
        </Modal>
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   VACCINES PAGE
--------------------------------------------------------- */
function VaccinesPage({ vaccines, allAnimals, addVaccine, deleteVaccine }) {
  const [showAdd, setShowAdd] = useState(false);
  const sorted = [...vaccines].sort((a, b) => daysUntil(a.nextDue) - daysUntil(b.nextDue));

  const statusOf = (v) => {
    const d = daysUntil(v.nextDue);
    if (d < 0) return { tone: "red", label: `Overdue ${Math.abs(d)}d` };
    if (d <= 7) return { tone: "yellow", label: d === 0 ? "Due today" : `Due in ${d}d` };
    return { tone: "green", label: `In ${d}d` };
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold" style={{ fontFamily: "'Zilla Slab', serif", color: C.ink }}>
          Vaccine records ({vaccines.length})
        </h2>
        <Btn icon={Plus} onClick={() => setShowAdd(true)}>Add vaccine</Btn>
      </div>

      {vaccines.length === 0 ? (
        <EmptyState text="No vaccine records yet. Add one to get reminders before the next dose is due." />
      ) : (
        <div className="flex flex-col gap-2">
          {sorted.map((v) => {
            const s = statusOf(v);
            return (
              <div key={v.id} className="flex items-center justify-between rounded-xl p-3"
                style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
                <div className="flex items-center gap-3 min-w-0">
                  <Syringe size={18} color={C.inkSoft} className="shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: C.ink }}>
                      #{v.animalTag} · {v.vaccineName}
                    </p>
                    <p className="text-xs" style={{ color: C.inkSoft }}>
                      Given {fmtDate(v.dateGiven)} · Next due {fmtDate(v.nextDue)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge tone={s.tone}>{s.label}</Badge>
                  <button onClick={() => deleteVaccine(v.id)} className="p-1 rounded hover:opacity-70">
                    <Trash2 size={16} color={C.gray} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAdd && (
        <Modal title="Add vaccine record" onClose={() => setShowAdd(false)}>
          <VaccineForm allAnimals={allAnimals} onCancel={() => setShowAdd(false)}
            onSave={(data) => { addVaccine({ ...data, id: uid() }); setShowAdd(false); }} />
        </Modal>
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   TO-DO PAGE
--------------------------------------------------------- */
function TodoPage({ todos, addTodo, toggleTodo, deleteTodo }) {
  const [text, setText] = useState("");
  const [date, setDate] = useState("");
  const pending = todos.filter((t) => !t.done);
  const done = todos.filter((t) => t.done);

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    addTodo({ id: uid(), text: text.trim(), date, done: false });
    setText("");
    setDate("");
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "'Zilla Slab', serif", color: C.ink }}>
        Day-to-day to-do list
      </h2>
      <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2 mb-5">
        <input className={inputCls + " flex-1"} style={inputStyle} value={text}
          onChange={(e) => setText(e.target.value)} placeholder="e.g. Check feed stock, call vet..." />
        <input type="date" className={inputCls} style={{ ...inputStyle, width: "auto" }} value={date}
          onChange={(e) => setDate(e.target.value)} />
        <Btn type="submit" icon={Plus}>Add</Btn>
      </form>

      {todos.length === 0 ? (
        <EmptyState text="Nothing on the list yet. Add today's farm tasks above." />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            {pending.map((t) => (
              <TodoRow key={t.id} t={t} toggleTodo={toggleTodo} deleteTodo={deleteTodo} />
            ))}
            {pending.length === 0 && <p className="text-sm" style={{ color: C.inkSoft }}>All tasks complete 🎉</p>}
          </div>
          {done.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: C.gray }}>Completed</p>
              <div className="flex flex-col gap-2">
                {done.map((t) => (
                  <TodoRow key={t.id} t={t} toggleTodo={toggleTodo} deleteTodo={deleteTodo} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TodoRow({ t, toggleTodo, deleteTodo }) {
  return (
    <div className="flex items-center justify-between rounded-lg p-3"
      style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
      <button onClick={() => toggleTodo(t.id)} className="flex items-center gap-2.5 text-left min-w-0">
        {t.done ? <CheckSquare size={18} color={C.green} /> : <Square size={18} color={C.inkSoft} />}
        <span className="text-sm truncate" style={{ color: t.done ? C.gray : C.ink, textDecoration: t.done ? "line-through" : "none" }}>
          {t.text}
        </span>
      </button>
      <div className="flex items-center gap-2 shrink-0">
        {t.date && (
          <span className="text-xs flex items-center gap-1" style={{ color: C.inkSoft }}>
            <Calendar size={12} /> {fmtDate(t.date)}
          </span>
        )}
        <button onClick={() => deleteTodo(t.id)} className="p-1 rounded hover:opacity-70">
          <Trash2 size={14} color={C.gray} />
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   SHARED HELPERS
--------------------------------------------------------- */
function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.gray }}>{label}</p>
      <p className="font-medium" style={{ color: C.ink }}>{value}</p>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-xl p-8 text-center" style={{ backgroundColor: C.card, border: `1px dashed ${C.border}` }}>
      <p className="text-sm" style={{ color: C.inkSoft }}>{text}</p>
    </div>
  );
}

/* ---------------------------------------------------------
   APP
--------------------------------------------------------- */
export default function App() {
  const [cows, setCows] = useState([]);
  const [calves, setCalves] = useState([]);
  const [beef, setBeef] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [todos, setTodos] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const [page, setPage] = useState("dashboard");
  const [beefTab, setBeefTab] = useState("All");

  // Load saved records once on startup
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("hassan-farm-data");
      if (raw) {
        const data = JSON.parse(raw);
        setCows(data.cows || []);
        setCalves(data.calves || []);
        setBeef(data.beef || []);
        setVaccines(data.vaccines || []);
        setTodos(data.todos || []);
      }
    } catch (e) {
      // no saved data yet, or read failed — start fresh
    } finally {
      setLoaded(true);
    }
  }, []);

  // Persist all records together whenever anything changes
  const firstRun = useRef(true);
  useEffect(() => {
    if (!loaded) return;
    if (firstRun.current) { firstRun.current = false; return; }
    try {
      window.localStorage.setItem(
        "hassan-farm-data",
        JSON.stringify({ cows, calves, beef, vaccines, todos })
      );
      setSaveError(false);
    } catch (e) {
      setSaveError(true);
    }
  }, [cows, calves, beef, vaccines, todos, loaded]);

  const addCow = (c) => setCows((s) => [...s, c]);
  const updateCow = (tag, data) => setCows((s) => s.map((c) => (c.tag === tag ? { ...c, ...data } : c)));
  const deleteCow = (tag) => setCows((s) => s.filter((c) => c.tag !== tag));

  const addCalf = (c) => setCalves((s) => [...s, c]);
  const updateCalf = (tag, data) => setCalves((s) => s.map((c) => (c.tag === tag ? { ...c, ...data } : c)));
  const deleteCalf = (tag) => setCalves((s) => s.filter((c) => c.tag !== tag));

  const addBeef = (b) => setBeef((s) => [...s, b]);
  const updateBeef = (tag, data) => setBeef((s) => s.map((b) => (b.tag === tag ? { ...b, ...data } : b)));
  const deleteBeef = (tag) => setBeef((s) => s.filter((b) => b.tag !== tag));

  const addVaccine = (v) => setVaccines((s) => [...s, v]);
  const deleteVaccine = (id) => setVaccines((s) => s.filter((v) => v.id !== id));

  const addTodo = (t) => setTodos((s) => [...s, t]);
  const toggleTodo = (id) => setTodos((s) => s.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const deleteTodo = (id) => setTodos((s) => s.filter((t) => t.id !== id));

  const allAnimals = [
    ...cows.map((c) => ({ tag: c.tag, type: "Cow" })),
    ...calves.map((c) => ({ tag: c.tag, type: "Calf" })),
    ...beef.map((b) => ({ tag: b.tag, type: b.category === "Beef" ? "Beef cattle" : b.subtype })),
  ];

  const dueCount = vaccines.filter((v) => daysUntil(v.nextDue) <= 7).length;

  const nav = [
    { id: "dashboard", label: "Dashboard" },
    { id: "cows", label: "Cows" },
    { id: "calves", label: "Calves" },
    { id: "beef", label: "Beef & Mutton" },
    { id: "vaccines", label: "Vaccines" },
    { id: "todo", label: "To-Do" },
  ];

  if (!loaded) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center" style={{ backgroundColor: C.paper }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Zilla+Slab:wght@500;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap'); * { font-family: 'IBM Plex Sans', sans-serif; }`}</style>
        <p style={{ color: C.inkSoft }}>Loading the farm register…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: C.paper }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Zilla+Slab:wght@500;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@600&display=swap');
        * { font-family: 'IBM Plex Sans', sans-serif; }
      `}</style>

      {saveError && (
        <div className="px-4 sm:px-8 py-2 text-xs font-semibold text-center" style={{ backgroundColor: C.redSoft, color: C.red }}>
          Couldn't save your last change — your browser storage may be full. This session's data is still safe until you close the tab.
        </div>
      )}

      <header className="px-4 sm:px-8 pt-6 pb-4" style={{ borderBottom: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg flex items-center justify-center text-xl shrink-0"
            style={{ backgroundColor: C.green }}>
            <Milk size={22} color="#fff" />
          </div>
          <div>
            <h1 className="text-2xl font-bold leading-tight" style={{ fontFamily: "'Zilla Slab', serif", color: C.ink }}>
              Hassan Dairy Farm
            </h1>
            <p className="text-xs" style={{ color: C.inkSoft }}>Livestock register &amp; day book</p>
          </div>
        </div>

        <nav className="flex gap-1 mt-5 overflow-x-auto pb-1">
          {nav.map((n) => (
            <button
              key={n.id}
              onClick={() => setPage(n.id)}
              className="relative px-3.5 py-2 text-sm font-semibold rounded-md whitespace-nowrap shrink-0 flex items-center gap-1.5"
              style={{
                color: page === n.id ? "#fff" : C.inkSoft,
                backgroundColor: page === n.id ? C.green : "transparent",
              }}
            >
              {n.label}
              {n.id === "vaccines" && dueCount > 0 && (
                <span className="w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold"
                  style={{ backgroundColor: page === n.id ? "#fff" : C.yellow, color: page === n.id ? C.yellow : "#fff" }}>
                  {dueCount}
                </span>
              )}
            </button>
          ))}
        </nav>
      </header>

      <main className="px-4 sm:px-8 py-6 max-w-6xl mx-auto">
        {page === "dashboard" && (
          <Dashboard cows={cows} calves={calves} beef={beef} vaccines={vaccines} setPage={setPage} setBeefTab={setBeefTab} />
        )}
        {page === "cows" && (
          <CowsPage cows={cows} addCow={addCow} updateCow={updateCow} deleteCow={deleteCow} />
        )}
        {page === "calves" && (
          <CalvesPage calves={calves} cows={cows} addCalf={addCalf} updateCalf={updateCalf} deleteCalf={deleteCalf} />
        )}
        {page === "beef" && (
          <BeefPage beef={beef} tab={beefTab} setTab={setBeefTab} addBeef={addBeef} updateBeef={updateBeef} deleteBeef={deleteBeef} />
        )}
        {page === "vaccines" && (
          <VaccinesPage vaccines={vaccines} allAnimals={allAnimals} addVaccine={addVaccine} deleteVaccine={deleteVaccine} />
        )}
        {page === "todo" && (
          <TodoPage todos={todos} addTodo={addTodo} toggleTodo={toggleTodo} deleteTodo={deleteTodo} />
        )}
      </main>
    </div>
  );
}
