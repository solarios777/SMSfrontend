"use client";
import React, { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { useRouter } from "next/navigation";

const AGgrid = ({
  columns,
  data,
  list
}: {
  columns: { header: string; accessor: string; className?: string }[];
  data: any[];
  list:string
}) => {
  const router = useRouter();

  // Convert columns to column definitions for AG Grid
  const columnDefs = useMemo(() => {
    return columns.map((col) => ({
      headerName: col.header,
      field: col.accessor,
      cellClass: col.className,
      cellRenderer:
        col.accessor === "link"
          ? (params: any) => (
              <span className="text-blue-500 hover:underline">{params.value}</span>
            )
          : undefined,
    }));
  }, [columns]);

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      floatingFilter: true,
    }),
    []
  );

  const handleRowClick = (event: any) => {
    const Id = event.data.id; // Access the ID of the clicked row
    router.push(`/list/${list}/${Id}`);
  };

  return (
    <div className="ag-theme-alpine " style={{ height: "700px", width: "100%"}}>
      <AgGridReact
        rowData={data}
        columnDefs={columnDefs}
        pagination={true}
        paginationPageSize={10}
        paginationPageSizeSelector={[10, 20, 30, 50, 100]}
        defaultColDef={defaultColDef}
        onRowClicked={handleRowClick} // Add event handler for row clicks
      />
    </div>
  );
};

export default AGgrid;
