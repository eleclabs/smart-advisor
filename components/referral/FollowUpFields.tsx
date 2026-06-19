"use client";

import { useRef, useState } from "react";

export type FollowUpValue = {
  number: string;
  detail: string;
};

type FollowUpRow = FollowUpValue & {
  id: number;
};

export default function FollowUpFields({ initialValues = [] }: { initialValues?: FollowUpValue[] }) {
  const initialRows = initialValues.length > 0
    ? initialValues.map((item, index) => ({ ...item, id: index + 1 }))
    : [{ id: 1, number: "1", detail: "" }];
  const [rows, setRows] = useState<FollowUpRow[]>(initialRows);
  const nextId = useRef(initialRows.length + 1);

  function addRow() {
    const nextNumber = Math.max(
      0,
      ...rows.map((row) => Number.parseInt(row.number, 10) || 0)
    ) + 1;
    setRows((current) => [
      ...current,
      { id: nextId.current++, number: String(nextNumber), detail: "" }
    ]);
  }

  function removeRow(id: number) {
    setRows((current) => current.filter((row) => row.id !== id));
  }

  return (
    <div className="referral-follow-ups">
      {rows.map((row) => (
        <div className="referral-follow-up-row" key={row.id}>
          <label>
            ครั้งที่
            <input name="followUpNumber" inputMode="numeric" defaultValue={row.number} />
          </label>
          <label>
            รายละเอียดการติดตาม
            <textarea name="followUpDetail" rows={3} defaultValue={row.detail} />
          </label>
          <button
            className="referral-remove-button"
            disabled={rows.length === 1}
            onClick={() => removeRow(row.id)}
            type="button"
          >
            ลบรายการ
          </button>
        </div>
      ))}
      <button className="referral-add-button" onClick={addRow} type="button">
        เพิ่มครั้งการติดตาม
      </button>
    </div>
  );
}
