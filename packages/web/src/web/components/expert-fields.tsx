import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { regions } from "../lib/catalogue";
import { Field, PhotoUpload } from "./canvas-maker";

// Browser memory only: each maker has a separate draft, cleared by a refresh.
const drafts = new Map<string, unknown>();
export function useExpertDraft<T>(slug: string, initial: T) {
  const [data, setData] = useState<T>(() => (drafts.get(slug) as T) || initial);
  function update(patch: Partial<T>) {
    setData((previous) => {
      const next = { ...previous, ...patch };
      drafts.set(slug, next);
      return next;
    });
  }
  return { data, update };
}
export function RegionField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="field">
      Region
      <select aria-label="Region" value={value} onChange={(e) => onChange(e.target.value)}>
        {regions.map((region) => (
          <option key={region}>{region}</option>
        ))}
      </select>
    </label>
  );
}
export function EntryList<T>({
  items,
  onChange,
  max,
  label,
  empty,
  children,
  note,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  max: number;
  label: string;
  empty: () => T;
  children: (item: T, index: number, change: (patch: Partial<T>) => void) => React.ReactNode;
  note?: string;
}) {
  return (
    <>
      <p className="sample-note">
        {note || `Up to ${max} ${label.toLowerCase()} entries. Placeholder content is not a claim of experience or qualifications.`}
      </p>
      {items.map((item, index) => (
        <div className="entry-card" key={index}>
          <div className="entry-heading">
            <strong>
              {label} {index + 1}
            </strong>
            <button
              className="icon-button"
              aria-label={`Remove ${label.toLowerCase()} ${index + 1}`}
              onClick={() => onChange(items.filter((_, i) => i !== index))}
            >
              <Trash2 size={16} />
            </button>
          </div>
          {children(item, index, (patch) =>
            onChange(items.map((entry, i) => (i === index ? { ...entry, ...patch } : entry))),
          )}
        </div>
      ))}
      <button
        className="button outline add-entry"
        disabled={items.length >= max}
        onClick={() => onChange([...items, empty()])}
      >
        <Plus size={16} />
        Add {label.toLowerCase()} ({items.length}/{max})
      </button>
    </>
  );
}
export function TextList({
  items,
  onChange,
  max,
  label,
  maxLength,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  max: number;
  label: string;
  maxLength: number;
}) {
  return (
    <EntryList
      items={items.map((value) => ({ value }))}
      onChange={(values) => onChange(values.map((item) => item.value))}
      max={max}
      label={label}
      empty={() => ({ value: "" })}
    >
      {(item, index, change) => (
        <Field
          label={`${label} ${index + 1}`}
          value={item.value}
          maxLength={maxLength}
          onChange={(value) => change({ value })}
        />
      )}
    </EntryList>
  );
}
export function OptionalPhoto({
  value,
  onChange,
  label = "Optional profile photo",
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}) {
  return (
    <>
      <PhotoUpload
        label={label}
        onPhoto={(photos) => {
          if (photos[0]) onChange(photos[0]);
        }}
      />
      {value && (
        <>
          <img
            src={value}
            alt={label === "Optional profile photo" ? "Your locally selected profile" : "Your locally selected image"}
            style={{ width: 100, height: 100, objectFit: "cover" }}
          />
          <button className="inline-link" onClick={() => onChange("")}>
            Remove photo
          </button>
        </>
      )}
    </>
  );
}
