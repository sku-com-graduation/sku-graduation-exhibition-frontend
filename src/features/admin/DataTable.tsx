import { useState, type ReactNode } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table";
import styles from "./admin.module.css";

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  getRowId: (row: T) => string;
  search: string;
  selection: RowSelectionState;
  onSelectionChange: (next: RowSelectionState) => void;
  changedIds?: Set<string>;
  loading?: boolean;
  empty: ReactNode;
  /** 행 이름(체크박스 읽기용) */
  rowLabel: (row: T) => string;
}

/** 관리자 표. 정렬·검색·선택은 TanStack Table에 맡기고 모양만 그린다. */
export const DataTable = <T,>({ data, columns, getRowId, search, selection, onSelectionChange, changedIds, loading, empty, rowLabel }: DataTableProps<T>) => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getRowId,
    state: { sorting, globalFilter: search, rowSelection: selection },
    onSortingChange: setSorting,
    onRowSelectionChange: (updater) => onSelectionChange(typeof updater === "function" ? updater(selection) : updater),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
    enableRowSelection: true,
  });

  const rows = table.getRowModel().rows;

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id}>
              <th scope="col" className={styles.check}>
                <input
                  type="checkbox"
                  aria-label="보이는 행 모두 선택"
                  checked={table.getIsAllRowsSelected()}
                  ref={(el) => {
                    if (el) el.indeterminate = table.getIsSomeRowsSelected();
                  }}
                  onChange={table.getToggleAllRowsSelectedHandler()}
                />
              </th>
              {group.headers.map((header) => {
                const sorted = header.column.getIsSorted();
                return (
                  <th key={header.id} scope="col" aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : undefined} style={{ width: header.column.columnDef.size }}>
                    {header.column.getCanSort() ? (
                      <button type="button" className={styles.sort} onClick={header.column.getToggleSortingHandler()}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <span aria-hidden="true" data-dir={sorted || undefined}>
                          {sorted === "asc" ? "↑" : sorted === "desc" ? "↓" : "↕"}
                        </span>
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 6 }, (_, i) => (
              <tr key={i} aria-hidden="true">
                <td colSpan={columns.length + 1}>
                  <span className={styles.skeleton} />
                </td>
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className={styles.empty}>
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id} data-selected={row.getIsSelected() || undefined} data-changed={changedIds?.has(row.id) || undefined}>
                <td className={styles.check}>
                  <input type="checkbox" aria-label={`${rowLabel(row.original)} 선택`} checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} />
                </td>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

/** 점선 밑줄 칸. 누르면 바로 고칠 수 있다 */
export const TextCell = ({ value, label, onChange, type = "text", placeholder }: { value: string; label: string; onChange: (v: string) => void; type?: string; placeholder?: string }) => (
  <input className={styles.cellInput} type={type} value={value ?? ""} aria-label={label} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
);

export const SelectCell = ({ value, label, options, onChange }: { value: string; label: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) => (
  <select className={styles.cellSelect} value={value ?? ""} aria-label={label} onChange={(e) => onChange(e.target.value)}>
    {options.map((o) => (
      <option key={o.value} value={o.value}>
        {o.label}
      </option>
    ))}
  </select>
);
