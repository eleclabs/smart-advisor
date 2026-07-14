"use client";

import { useEffect, useRef, useState } from "react";

type SchoolResult = {
  id: string;
  name: string;
  region: string;
  province: string;
  vocationalOffice: string;
  educationType: string;
};

type Props = {
  defaultSchoolId?: string;
  defaultSchoolName?: string;
  defaultSchoolProvince?: string;
  defaultRegion?: string;
  defaultVocationalOffice?: string;
  defaultEducationType?: string;
};

export default function SchoolSearchInput({
  defaultSchoolId = "",
  defaultSchoolName = "",
  defaultSchoolProvince = "",
  defaultRegion = "",
  defaultVocationalOffice = "",
  defaultEducationType = "",
}: Props) {
  const [query, setQuery] = useState(defaultSchoolName);
  const [results, setResults] = useState<SchoolResult[]>([]);
  const [selected, setSelected] = useState<SchoolResult | null>(
    defaultSchoolId
      ? {
          id: defaultSchoolId,
          name: defaultSchoolName,
          region: defaultRegion,
          province: defaultSchoolProvince,
          vocationalOffice: defaultVocationalOffice,
          educationType: defaultEducationType,
        }
      : null
  );
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selected || !query.trim()) {
      setResults([]);
      return;
    }

    const abort = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/schools/search?q=${encodeURIComponent(query)}`, {
        signal: abort.signal,
      })
        .then((r) => r.json())
        .then((data) => {
          setResults(Array.isArray(data) ? data : []);
          setOpen(true);
        })
        .catch(() => {});
    }, 300);

    return () => {
      clearTimeout(timer);
      abort.abort();
    };
  }, [query, selected]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(school: SchoolResult) {
    setSelected(school);
    setQuery(school.name);
    setResults([]);
    setOpen(false);
  }

  function handleClear() {
    setSelected(null);
    setQuery("");
    setResults([]);
  }

  const current = selected;

  return (
    <div ref={containerRef} className="school-search-input-wrap" style={{ gridColumn: "1 / -1" }}>
      <label className="school-search-field">
        <span>ค้นหาสถานศึกษา</span>
        <div style={{ position: "relative" }}>
          <input
            autoComplete="off"
            placeholder="พิมพ์ชื่อสถานศึกษาเพื่อค้นหา"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (selected) setSelected(null);
            }}
            onFocus={() => results.length > 0 && setOpen(true)}
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#94a3b8",
                fontSize: 18,
                lineHeight: 1,
                padding: 0,
              }}
              aria-label="ล้างการค้นหา"
            >
              ×
            </button>
          )}
        </div>

        {open && results.length > 0 && !selected && (
          <ul
            className="school-suggestion-list"
            style={{ listStyle: "none", padding: 0, margin: 0, position: "absolute", zIndex: 50, width: "100%", maxHeight: 280, overflowY: "auto" }}
          >
            {results.map((s) => (
              <li key={s.id}>
                <button type="button" onClick={() => handleSelect(s)}>
                  <strong>{s.name}</strong>
                  {s.province ? <span style={{ color: "#64748b", marginLeft: 8, fontSize: 13 }}>{s.province}</span> : null}
                </button>
              </li>
            ))}
          </ul>
        )}
      </label>

      {current ? (
        <div
          style={{
            marginTop: 8,
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #bbf7d0",
            background: "#f0fdf4",
            fontSize: 14,
            color: "#14532d",
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0,1fr))",
            gap: "6px 16px",
          }}
        >
          <span><strong>สถานศึกษา:</strong> {current.name}</span>
          <span><strong>จังหวัด:</strong> {current.province || "-"}</span>
          <span><strong>ภาค:</strong> {current.region || "-"}</span>
          <span><strong>ประเภท:</strong> {current.educationType || "-"}</span>
          <span style={{ gridColumn: "1 / -1" }}><strong>สำนักงานอาชีวศึกษา:</strong> {current.vocationalOffice || "-"}</span>
        </div>
      ) : null}

      {/* hidden fields submitted with form */}
      <input type="hidden" name="schoolId" value={current?.id ?? ""} />
      <input type="hidden" name="schoolName" value={current?.name ?? ""} />
      <input type="hidden" name="schoolProvince" value={current?.province ?? ""} />
      <input type="hidden" name="region" value={current?.region ?? ""} />
      <input type="hidden" name="vocationalOffice" value={current?.vocationalOffice ?? ""} />
      <input type="hidden" name="educationType" value={current?.educationType ?? ""} />
    </div>
  );
}
